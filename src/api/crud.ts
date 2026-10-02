import { api, type QueryParams } from './client';
import type { ItemResponse, ListResponse } from './types';

/** Reusable CRUD service for a REST collection (`/categories`, `/brands`, ...). */
export function createCrudService<T, TCreate = unknown, TUpdate = TCreate>(path: string) {
  return {
    list: (params?: QueryParams, signal?: AbortSignal) => api.get<ListResponse<T>>(path, params, signal),
    get: (id: string, signal?: AbortSignal) =>
      api.get<ItemResponse<T>>(`${path}/${id}`, undefined, signal).then((r) => r.data),
    create: (body: TCreate) => api.post<ItemResponse<T>>(path, body).then((r) => r.data),
    update: (id: string, body: TUpdate) => api.put<ItemResponse<T>>(`${path}/${id}`, body).then((r) => r.data),
    remove: (id: string) => api.delete(`${path}/${id}`)
  };
}

/** Builds multipart/form-data, skipping empty values and repeating array fields. */
export function toFormData(fields: Record<string, string | number | Blob | Array<string | Blob> | null | undefined>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach((v) => fd.append(key, v));
    else fd.append(key, value instanceof Blob ? value : String(value));
  }
  return fd;
}

/**
 * Downloads an already-uploaded image so it can be re-sent. Used where the
 * backend requires a file on update even when the image did not change
 * (known issues #3 and #4). Returns null if the image can't be fetched.
 */
export async function urlToFile(url: string, name = 'image.jpeg'): Promise<File | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image')) return null;
    return new File([blob], name, { type: blob.type });
  } catch {
    return null;
  }
}
