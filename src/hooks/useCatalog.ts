import { keepPreviousData, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { QueryParams } from '../api/client';
import { branchesApi, brandsApi, categoriesApi, productsApi, subcategoriesApi } from '../api/services';
import type { Product } from '../api/types';

const FIVE_MIN = 5 * 60 * 1000;

/** Public (non-user-specific) query keys all start with 'public' so logout keeps them. */
export const qk = {
  products: (params: QueryParams) => ['public', 'products', params] as const,
  product: (id: string) => ['public', 'product', id] as const,
  productSummary: (id: string) => ['public', 'product-summary', id] as const,
  categories: (params?: QueryParams) => ['public', 'categories', params ?? {}] as const,
  brands: (params?: QueryParams) => ['public', 'brands', params ?? {}] as const,
  brand: (id: string) => ['public', 'brand', id] as const,
  subcategories: (categoryId?: string) => ['public', 'subcategories', categoryId ?? 'all'] as const,
  branches: (params?: QueryParams) => ['public', 'branches', params ?? {}] as const
};

/** Seeds per-product summaries so cart/wishlist/review rows don't refetch products we already have. */
export function seedProducts(qc: QueryClient, products: Product[]) {
  for (const p of products) {
    if (!qc.getQueryData(qk.productSummary(p._id))) qc.setQueryData(qk.productSummary(p._id), p);
  }
}

export function useProducts(params: QueryParams, opts: { enabled?: boolean } = {}) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: qk.products(params),
    queryFn: async ({ signal }) => {
      const res = await productsApi.list(params, signal);
      seedProducts(qc, res.data);
      return res;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    enabled: opts.enabled ?? true
  });
}

export function useProduct(id: string | undefined) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: qk.product(id ?? ''),
    queryFn: async ({ signal }) => {
      const p = await productsApi.get(id!, signal);
      qc.setQueryData(qk.productSummary(p._id), p);
      return p;
    },
    enabled: !!id
  });
}

/** Lightweight product info (image/title/price) — served from cache when possible. */
export function useProductSummary(id: string | undefined) {
  return useQuery({
    queryKey: qk.productSummary(id ?? ''),
    queryFn: ({ signal }) => productsApi.get(id!, signal),
    enabled: !!id,
    staleTime: FIVE_MIN,
    retry: (count, err) => (err as { status?: number }).status !== 404 && count < 2
  });
}

/** All categories (small collection) — shared by nav, filters, forms. */
export function useCategories() {
  return useQuery({
    queryKey: qk.categories({ limit: 200 }),
    queryFn: ({ signal }) => categoriesApi.list({ limit: 200, sort: 'name' }, signal).then((r) => r.data),
    staleTime: FIVE_MIN
  });
}

export function useBrands() {
  return useQuery({
    queryKey: qk.brands({ limit: 200 }),
    queryFn: ({ signal }) => brandsApi.list({ limit: 200, sort: 'name' }, signal).then((r) => r.data),
    staleTime: FIVE_MIN
  });
}

/** Product.brand is an id — resolve it from the brand list cache or fetch it. */
export function useBrand(id: string | null | undefined) {
  const brands = useBrands();
  const cached = brands.data?.find((b) => b._id === id);
  const single = useQuery({
    queryKey: qk.brand(id ?? ''),
    queryFn: ({ signal }) => brandsApi.get(id!, signal),
    enabled: !!id && brands.isFetched && !cached,
    staleTime: FIVE_MIN
  });
  return cached ?? single.data ?? null;
}

export function useSubcategories(categoryId?: string) {
  return useQuery({
    queryKey: qk.subcategories(categoryId),
    queryFn: ({ signal }) =>
      (categoryId ? subcategoriesApi.listByCategory(categoryId, { limit: 200 }, signal) : subcategoriesApi.list({ limit: 200 }, signal)).then((r) => r.data),
    staleTime: FIVE_MIN
  });
}

/** Category id for a (English) category name — used by the landing sections. */
export function useCategoryIdByName(name: string | undefined) {
  const { data } = useCategories();
  return data?.find((c) => c.name === name)?._id;
}

/** Products of a category looked up by its English name (landing sections). */
export function useCategoryProducts(categoryName: string, params: QueryParams = {}) {
  const categoryId = useCategoryIdByName(categoryName);
  const categories = useCategories();
  const query = useProducts({ category: categoryId, limit: 12, sort: '-sold', ...params }, { enabled: !!categoryId });
  return {
    categoryId,
    products: query.data?.data ?? [],
    isLoading: categories.isLoading || (!!categoryId && query.isLoading),
    isError: categories.isError || query.isError
  };
}

/** Active store branches for the map. */
export function useBranches(params: QueryParams = {}) {
  return useQuery({
    queryKey: qk.branches(params),
    queryFn: ({ signal }) => branchesApi.list({ limit: 200, sort: '-isMain,name', ...params }, signal).then((r) => r.data),
    staleTime: FIVE_MIN
  });
}
