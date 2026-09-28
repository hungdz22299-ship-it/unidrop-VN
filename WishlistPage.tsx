import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '@/services/productService';
import { useWishlist } from '@/contexts/WishlistContext';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { Heart, ChevronRight } from 'lucide-react';

export function WishlistPage() {
  const { wishlist } = useWishlist();
  const products = useMemo(() => getProducts(), []);
  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-800">Yêu thích</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Sản phẩm yêu thích <span className="text-base font-normal text-gray-400">({wishedProducts.length})</span>
      </h1>

      {wishedProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {wishedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="h-10 w-10" />}
          title="Chưa có sản phẩm yêu thích"
          description="Nhấn vào tim trên sản phẩm để lưu vào danh sách yêu thích."
          action={<Link to="/" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Khám phá sản phẩm</Link>}
        />
      )}
    </div>
  );
}
