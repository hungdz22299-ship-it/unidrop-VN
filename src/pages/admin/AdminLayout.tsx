import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, Tag, Users, BarChart3, Settings, ArrowLeft, Boxes } from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/san-pham', label: 'Sản phẩm', icon: Package },
  { to: '/admin/combo', label: 'Combo', icon: Boxes },
  { to: '/admin/don-hang', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/khuyen-mai', label: 'Khuyến mãi', icon: Tag },
  { to: '/admin/nguoi-dung', label: 'Người dùng', icon: Users },
  { to: '/admin/thong-ke', label: 'Thống kê', icon: BarChart3 },
  { to: '/admin/cai-dat', label: 'Cài đặt', icon: Settings },
];

export function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-[140px] hidden h-[calc(100vh-140px)] w-60 border-r border-gray-100 bg-white lg:block">
        <div className="p-5">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="font-bold text-gray-900">Quản trị</span>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Về cửa hàng
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden">
        <div className="sticky top-[140px] z-30 border-b border-gray-100 bg-white">
          <div className="flex gap-1 overflow-x-auto px-4 py-3 scrollbar-hide">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 lg:ml-60">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
