# Royal Care — Storefront & Admin Dashboard

React 18 + Vite + TypeScript + Tailwind frontend for the E-Commerce API
(`Backend-E-Commerce-App`, see its `FRONTEND_API_GUIDE.md`).

- **Storefront** (English/Arabic, RTL): catalog with search/filters/pagination,
  product details & reviews, wishlist, cart with coupons, checkout (cash),
  orders, profile, password, addresses, forgot-password flow.
- **Dashboard** at `/dashboard` (admin & manager): overview stats, products,
  categories, subcategories, brands, coupons, users, orders (mark paid /
  delivered) and review moderation. Deleting is admin-only.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set VITE_API_URL to the backend origin
npm run dev
```

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend origin (without `/api/v1`) |
| `VITE_CURRENCY` | `AED` | Currency used to format prices |
| `VITE_ENABLE_STRIPE` | `false` | Enables Visa/Stripe checkout (see below) |

## Structure

```
src/api/         API client (auth header, error normalization), typed services, Stripe module
src/auth/        AuthProvider (token persistence, 401 handling), route guards, permissions
src/hooks/       React Query hooks for catalog, cart, wishlist; form helpers
src/components/  ui/ (design-system primitives), shop/ (storefront pieces), existing landing sections
src/pages/       storefront, auth and account pages
src/dashboard/   admin/manager dashboard (lazy-loaded)
src/messages/    en/ar strings (shop.*.ts holds storefront/account strings)
```

## Backend integration

All catalog data comes from the API — the landing sections (hair oils, anti-acne
routine, summer sun care), the quick-view modal and the product page read live
products (bilingual `titleAr` / `descriptionAr`, benefits, ingredients,
directions and sizes) and fall back to English when Arabic is missing.

- **Store locator** — `/stores` and the home "Our Branches" section show the
  branches from `GET /api/v1/branches` on a Leaflet + OpenStreetMap map (no API
  key): search, city filter, "nearest to me" (browser geolocation) and
  Google Maps directions. Leaflet is lazy-loaded in its own chunk.
- **Dashboard → Branches** — CRUD with a location picker (click / drag the pin).
- **Dashboard forms** — Arabic names for categories, subcategories and brands,
  brand logo upload, product subcategories, featured flag, product facts and
  image updates without re-uploading existing images.

Seed the database with the matching dummy data from the backend:
`npm run seed` (in `Backend-E-Commerce-App`) — login `admin@care.com` / `123456`.

The backend issues listed in the API guide (§17) were fixed in the backend
itself. The client still tolerates the old behaviour where it is harmless
(e.g. `GET /cart` 404 → empty cart, nested image URLs are unwrapped).
