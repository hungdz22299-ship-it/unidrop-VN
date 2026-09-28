import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { queryProducts, type ProductSort } from '@/services/productService';
import { categories, categoryIcons } from '@/data/categories';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar, ProductFilters, defaultProductFilters } from '@/components/FilterBar';
import { EmptyState } from '@/components/EmptyState';
import { PackageX, ChevronRight } from 'lucide-react';

export function CategoryPage() {
  const { slug = '' } = useParams();
  const [sort, setSort] = useState<ProductSort>('default');
  const [filters, setFilters] = useState<ProductFilters>(defaultProductFilters);
  const category = categories.find((c) => c.slug === slug);
  const Icon = categoryIcons[slug];

  const products = useMemo(() => queryProducts('', { categories: [slug], minPrice: filters.minPrice ? Number(filters.minPrice) : undefined, maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined, minRating: filters.minRating ? Number(filters.minRating) : undefined, saleOnly: filters.saleOnly, inStockOnly: filters.inStockOnly }, sort), [filters, slug, sort]);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState icon={<PackageX className="h-10 w-10" />} title="Không tìm thấy danh mục" description="Danh mục bạn tìm không tồn tại hoặc đã bị xóa." action={<Link to="/" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Về trang chủ</Link>} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <nav className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-gray-800">{category.name}</span>
      </nav>

      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-gray-50 p-4 sm:gap-4 sm:p-6">
        {Icon && <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm sm:h-16 sm:w-16"><Icon className="h-6 w-6 sm:h-8 sm:w-8" /></div>}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{category.name}</h1>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{category.description}</p>
          <p className="mt-1 text-xs text-gray-400">{products.length} sản phẩm phù hợp</p>
        </div>
      </div>

      <FilterBar
        filters={filters}
        categoryOptions={[]}
        onChange={setFilters}
        onReset={() => setFilters(defaultProductFilters)}
        resultCount={products.length}
        sort={sort}
        onSortChange={(value) => setSort(value as ProductSort)}
      />

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <EmptyState icon={<PackageX className="h-10 w-10" />} title="Chưa có sản phẩm phù hợp" description="Hãy thử bỏ bớt bộ lọc để xem thêm sản phẩm." action={<button onClick={() => setFilters(defaultProductFilters)} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Xóa bộ lọc</button>} />
      )}
    </div>
  );
}
