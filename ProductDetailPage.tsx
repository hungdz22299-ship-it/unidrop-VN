import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { getProductBySlug, getRelatedProducts } from '@/services/productService';
import { ProductDetailSection } from '@/components/ProductDetailSection';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/format';
import { categories } from '@/data/categories';
import { PackageX, ShoppingCart, Heart, Minus, Plus, ChevronRight, Check } from 'lucide-react';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isLoggedIn } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => getProductBySlug(slug), [slug]);
  const related = useMemo(() => product ? getRelatedProducts(product, 4) : [], [product]);

  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-16"><EmptyState icon={<PackageX className="h-10 w-10" />} title="Không tìm thấy sản phẩm" description="Sản phẩm bạn tìm không tồn tại hoặc đã bị xóa." action={<Link to="/" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Về trang chủ</Link>} /></div>;
  }

  const inWishlist = isInWishlist(product.id);
  const categoryName = categories.find((c) => c.slug === product.category)?.name || product.category;

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <nav className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <Link to={`/danh-muc/${product.category}`} className="hover:text-indigo-600">{categoryName}</Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="max-w-[55vw] truncate font-medium text-gray-800">{product.name}</span>
      </nav>

      <ProductDetailSection product={product} />

      <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:mt-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-gray-200">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-11 w-11 items-center justify-center text-gray-600 hover:text-indigo-600" aria-label="Giảm số lượng"><Minus className="h-4 w-4" /></button>
            <span className="w-12 text-center font-semibold">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(Math.max(product.stock, 1), quantity + 1))} className="flex h-11 w-11 items-center justify-center text-gray-600 hover:text-indigo-600" aria-label="Tăng số lượng"><Plus className="h-4 w-4" /></button>
          </div>
          <button onClick={() => { if (!isLoggedIn) { navigate('/dang-nhap'); return; } toggleWishlist(product.id); showToast(inWishlist ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích', 'success'); }} className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${inWishlist ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-gray-200 text-gray-600 hover:border-rose-200 hover:text-rose-500'}`} aria-label="Yêu thích">
            <Heart className={`h-5 w-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={() => { if (!isLoggedIn) { navigate('/dang-nhap'); return; } addToCart(product, quantity); showToast('Đã thêm vào giỏ hàng', 'success'); }} disabled={product.stock === 0} className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 py-3 font-semibold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50">
            <ShoppingCart className="h-5 w-5" /> Thêm vào giỏ
          </button>
          <button onClick={() => { if (!isLoggedIn) { navigate('/dang-nhap'); return; } addToCart(product, quantity); navigate('/gio-hang'); }} disabled={product.stock === 0} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Check className="h-5 w-5" /> Mua ngay
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">Tổng: <span className="font-bold text-indigo-600">{formatCurrency(product.price * quantity)}</span></p>
      </div>

      {related.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <h2 className="mb-5 text-xl font-bold text-gray-900 sm:text-2xl">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
