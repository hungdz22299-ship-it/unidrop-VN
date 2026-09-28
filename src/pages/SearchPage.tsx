import { useSearchParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { queryProducts, type ProductSort } from '@/services/productService';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters, FilterBar, defaultProductFilters } from '@/components/FilterBar';
import { EmptyState } from '@/components/EmptyState';
import { categories } from '@/data/categories';
import { SearchX, ChevronRight } from 'lucide-react';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [sort, setSort] = useState<ProductSort>('default');
  const [filters, setFilters] = useState<ProductFilters>(defaultProductFilters);

  const results = useMemo(() => {
    const serviceFilters = {
      categories: filters.categories,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minRating: filters.minRating ? Number(filters.minRating) : undefined,
      saleOnly: filters.saleOnly,
      inStockOnly: filters.inStockOnly,
    };
    const special = query === 'bestseller' ? serviceFilters : serviceFilters;
    let list = queryProducts(query === 'bestseller' || query === 'new' ? '' : query, special, sort);
    if (query === 'bestseller') list = list.filter((p) => p.bestseller);
    if (query === 'new') list = list.filter((p) => p.isNew);
    return list;
  }, [query, sort, filters]);

  const title = query === 'bestseller' ? 'Sản phẩm bán chạy' : query === 'new' ? 'Sản phẩm mới' : query ? `Kết quả cho "${query}"` : 'Tất cả sản phẩm';

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <nav className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-gray-800">Sản phẩm</span>
      </nav>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">Tìm kiếm theo tên, mô tả hoặc danh mục. Hỗ trợ tìm kiếm không dấu.</p>
      </div>

      <FilterBar
        filters={filters}
        categoryOptions={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        onChange={setFilters}
        onReset={() => setFilters(defaultProductFilters)}
        resultCount={results.length}
        sort={sort}
        onSortChange={(value) => setSort(value as ProductSort)}
      />

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <EmptyState
          icon={<SearchX className="h-10 w-10" />}
          title="Không tìm thấy sản phẩm phù hợp"
          description="Thử bỏ bớt bộ lọc hoặc dùng từ khóa khác nhé!"
          action={<button onClick={() => setFilters(defaultProductFilters)} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Xóa bộ lọc</button>}
        />
      )}
    </div>
  );
}
