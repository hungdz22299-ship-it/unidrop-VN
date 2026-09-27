import { SlidersHorizontal, X } from 'lucide-react';

export interface ProductFilters {
  categories: string[];
  minPrice: string;
  maxPrice: string;
  minRating: string;
  saleOnly: boolean;
  inStockOnly: boolean;
}

export const defaultProductFilters: ProductFilters = {
  categories: [],
  minPrice: '',
  maxPrice: '',
  minRating: '',
  saleOnly: false,
  inStockOnly: false,
};

interface FilterBarProps {
  filters: ProductFilters;
  categoryOptions?: { slug: string; name: string }[];
  onChange: (filters: ProductFilters) => void;
  onReset: () => void;
  resultCount: number;
  sort: string;
  onSortChange: (sort: string) => void;
}

export function FilterBar({
  filters,
  categoryOptions = [],
  onChange,
  onReset,
  resultCount,
  sort,
  onSortChange,
}: FilterBarProps) {
  const set = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch });
  const active = filters.categories.length + Number(Boolean(filters.minPrice || filters.maxPrice)) +
    Number(Boolean(filters.minRating)) + Number(filters.saleOnly) + Number(filters.inStockOnly);

  return (
    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categoryOptions.length > 0 && (
            <label className="text-xs font-medium text-gray-600">
              Danh mục
              <select
                multiple
                value={filters.categories}
                onChange={(e) => set({ categories: Array.from(e.target.selectedOptions, (o) => o.value) })}
                className="mt-1 min-h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                {categoryOptions.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
          )}

          <label className="text-xs font-medium text-gray-600">
            Giá từ
            <input
              inputMode="numeric"
              value={filters.minPrice}
              onChange={(e) => set({ minPrice: e.target.value.replace(/\D/g, '') })}
              placeholder="0"
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </label>

          <label className="text-xs font-medium text-gray-600">
            Giá đến
            <input
              inputMode="numeric"
              value={filters.maxPrice}
              onChange={(e) => set({ maxPrice: e.target.value.replace(/\D/g, '') })}
              placeholder="299000"
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </label>

          <label className="text-xs font-medium text-gray-600">
            Đánh giá
            <select
              value={filters.minRating}
              onChange={(e) => set({ minRating: e.target.value })}
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">Tất cả</option>
              <option value="4.5">Từ 4.5 sao</option>
              <option value="4">Từ 4 sao</option>
              <option value="3">Từ 3 sao</option>
            </select>
          </label>

          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-3">
              <input type="checkbox" checked={filters.saleOnly} onChange={(e) => set({ saleOnly: e.target.checked })} />
              Đang giảm giá
            </label>
            <label className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-3">
              <input type="checkbox" checked={filters.inStockOnly} onChange={(e) => set({ inStockOnly: e.target.checked })} />
              Còn hàng
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">{resultCount} sản phẩm</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
          >
            <option value="default">Mặc định</option>
            <option value="popular">Phổ biến</option>
            <option value="sold">Bán chạy nhất</option>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: thấp → cao</option>
            <option value="price-desc">Giá: cao → thấp</option>
            <option value="rating">Đánh giá cao</option>
          </select>
          <button
            type="button"
            onClick={onReset}
            disabled={active === 0}
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-gray-200 px-3 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" /> Xóa lọc
          </button>
        </div>
      </div>

      {active > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700">
          <SlidersHorizontal className="h-4 w-4" />
          Đang áp dụng {active} nhóm bộ lọc
        </div>
      )}
    </div>
  );
}
