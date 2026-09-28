import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/format';
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={<ShoppingCart className="h-10 w-10" />}
          title="Giỏ hàng trống"
          description="Bạn chưa có sản phẩm nào trong giỏ. Hãy khám phá danh mục và chọn món đồ yêu thích!"
          action={<Link to="/" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Tiếp tục mua sắm</Link>}
        />
      </div>
    );
  }

  const shippingFee = totalPrice >= 150000 ? 0 : 25000;
  const finalTotal = totalPrice + shippingFee;

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Giỏ hàng <span className="text-base font-normal text-gray-400">({totalItems} sản phẩm)</span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items list */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4"
            >
              <Link to={`/san-pham/${item.productId}`} className="flex-shrink-0">
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <Link to={`/san-pham/${item.productId}`} className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-indigo-600">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-bold text-indigo-600">{formatCurrency(item.price)}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-indigo-600"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-indigo-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => {
                        removeFromCart(item.productId);
                        showToast('Đã xóa sản phẩm', 'info');
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => { clearCart(); showToast('Đã xóa toàn bộ giỏ hàng', 'info'); }}
              className="text-sm text-gray-500 hover:text-rose-500"
            >
              Xóa tất cả
            </button>
            <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-900">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-gray-900">
                  {shippingFee === 0 ? <span className="text-emerald-600">Miễn phí</span> : formatCurrency(shippingFee)}
                </span>
              </div>
              {totalPrice < 150000 && (
                <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                  Mua thêm {formatCurrency(150000 - totalPrice)} để được miễn phí vận chuyển!
                </p>
              )}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-indigo-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/thanh-toan')}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-all hover:bg-indigo-700"
            >
              Tiến hành thanh toán
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShoppingBag className="h-3.5 w-3.5" />
              Thanh toán an toàn và bảo mật
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
