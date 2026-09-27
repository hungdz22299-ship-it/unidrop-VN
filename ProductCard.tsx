import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
        <Link to={`/san-pham/${product.slug}`}>
          <SafeImage
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Mới
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              -{discount}%
            </span>
          )}
          {product.bestseller && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Hot
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
            showToast(inWishlist ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích', 'success');
          }}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white"
          aria-label="Thêm vào yêu thích"
        >
          <Heart
            className={`h-4 w-4 transition-all ${inWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <Link to={`/san-pham/${product.slug}`} className="mb-1 line-clamp-2 text-sm font-medium text-gray-800 hover:text-indigo-600 transition-colors">
          {product.name}
        </Link>

        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">{product.rating}</span>
          </div>
          <span>·</span>
          <span>Đã bán {formatNumber(product.sold)}</span>
        </div>

        <div className="mt-auto">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-indigo-600">{formatCurrency(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through">{formatCurrency(product.oldPrice)}</span>
              )}
            </div>
            <span className={`text-[11px] font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>

          <button
            onClick={() => {
              if (!isLoggedIn) { navigate('/dang-nhap'); return; }
              addToCart(product);
              showToast('Đã thêm vào giỏ hàng', 'success');
            }}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white transition-all hover:bg-indigo-700 active:scale-[0.99]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
