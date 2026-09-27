import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, Package, Wallet, Heart, LogOut } from 'lucide-react';

const navItems = [
  { to: '/tai-khoan', label: 'Hồ sơ', icon: User, end: true },
  { to: '/tai-khoan/don-hang', label: 'Đơn hàng', icon: Package },
  { to: '/tai-khoan/vi', label: 'Ví của tôi', icon: Wallet },
  { to: '/yeu-thich', label: 'Yêu thích', icon: Heart },
];

export function AccountLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tài khoản của tôi</h1>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-lg font-bold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{user?.name}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
