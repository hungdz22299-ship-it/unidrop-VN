import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Grid2X2, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { totalItems } = useCart();
  const { isLoggedIn } = useAuth();
  const items = [
    ['/', 'Trang chủ', Home],
    ['/danh-muc/goc-hoc-tap', 'Danh mục', Grid2X2],
    ['/tim-kiem', 'Tìm kiếm', Search],
    ['/gio-hang', 'Giỏ hàng', ShoppingCart],
    ['/tai-khoan', 'Tài khoản', User],
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map(([to, label, Icon]) => {
          const protectedPath = to === '/gio-hang' || to === '/tai-khoan';
          const target = !isLoggedIn && protectedPath ? '/dang-nhap' : to;
          const active = to === '/tim-kiem' ? pathname.startsWith('/tim-kiem') : pathname === to;
          return (
            <Link key={to} to={target} className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] ${active ? 'text-indigo-600' : 'text-slate-500'}`}>
              <Icon className="h-5 w-5" />
              {label}
              {to === '/gio-hang' && totalItems > 0 && (
                <span className="absolute right-4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] text-white">{totalItems}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
