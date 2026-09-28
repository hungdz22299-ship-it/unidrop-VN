import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { categories } from '@/data/categories';
import { categoryIcons } from '@/data/categories';
import {
  Search, ShoppingCart, Heart, User, Menu, X, Package,
  LogOut, Settings, ChevronDown, Sparkles, Wallet, LayoutDashboard
} from 'lucide-react';

export function Header() {
  const { user, isAdmin, isLoggedIn, isGuest, guestName, logout } = useAuth();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setCategoryMenuOpen(false);
    if (location.pathname === '/tim-kiem') {
      setSearchQuery(new URLSearchParams(location.search).get('q') || '');
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Miễn phí vận chuyển cho đơn từ 150K — Dành riêng cho sinh viên
          </p>
          <div className="hidden items-center gap-4 sm:flex">
            <Link to="/khuyen-mai" className="hover:text-indigo-400 transition-colors">Khuyến mãi</Link>
            <span className="text-gray-600">|</span>
            <Link to="/theo-doi-don" className="hover:text-indigo-400 transition-colors">Theo dõi đơn</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex flex-shrink-0 items-center gap-2">
              <img src="/unidrop-logo.png" alt="UniDrop" className="h-10 w-10 rounded-xl object-cover" />
              <div className="hidden sm:block leading-tight">
                <span className="text-xl font-black tracking-tight text-gray-900">Uni<span className="text-indigo-600">Drop</span></span>
                <span className="block text-[9px] font-semibold text-gray-500">Tiện ích trong tầm tay bạn</span>
              </div>
            </Link>


            {/* Main navigation - desktop */}
            <nav className="hidden xl:flex items-center gap-1 shrink-0" aria-label="Điều hướng chính">
              {[
                ['/','Trang chủ'],
                ['/san-pham','Sản phẩm'],
                ['/combo','Combo'],
                ['/danh-muc/goc-hoc-tap','Danh mục'],
                ['/khuyen-mai','Bộ sưu tập'],
                ['/chinh-sach','Về chúng tôi'],
                ['/tro-giup','Liên hệ'],
              ].map(([to,label]) => (
                <Link key={to} to={to} className="rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600">{label}</Link>
              ))}
            </nav>

            {/* Search - desktop */}
            <form onSubmit={handleSearch} className="hidden flex-1 md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    if (location.pathname === '/tim-kiem') {
                      navigate(value.trim() ? `/tim-kiem?q=${encodeURIComponent(value)}` : '/tim-kiem');
                    }
                  }}
                  placeholder="Tìm sản phẩm, danh mục..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-1">
              {/* Category button - desktop */}
              <div ref={categoryMenuRef} className="relative hidden lg:block">
                <button
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Danh mục
                  <ChevronDown className={`h-4 w-4 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {categoryMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl animate-scale-in">
                    {categories.map((cat) => {
                      const Icon = categoryIcons[cat.slug];
                      return (
                        <Link
                          key={cat.id}
                          to={`/danh-muc/${cat.slug}`}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {Icon && <Icon className="h-4 w-4 text-indigo-600" />}
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AI */}
              <Link
                to="/ai"
                className="hidden h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 lg:flex"
                aria-label="UniDrop AI"
              >
                <Sparkles className="h-4 w-4" /> AI
              </Link>

              {/* Wishlist */}
              <Link
                to="/yeu-thich"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <Heart className="h-5 w-5" />
                {wishCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {wishCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/gio-hang"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {isLoggedIn ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white">
                      {user!.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`hidden h-4 w-4 text-gray-500 transition-transform sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl animate-scale-in">
                      <div className="border-b border-gray-100 px-3 py-2">
                        <p className="truncate text-sm font-semibold text-gray-900">{user!.name}</p>
                        <p className="truncate text-xs text-gray-500">{user!.email}</p>
                        <p className="mt-1 text-xs font-medium text-indigo-600">
                          Ví: {(user!.balance || 0).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <Link to="/tai-khoan" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4 text-gray-400" /> Tài khoản của tôi
                      </Link>
                      <Link to="/tai-khoan/don-hang" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Package className="h-4 w-4 text-gray-400" /> Đơn hàng
                      </Link>
                      <Link to="/tai-khoan/vi" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Wallet className="h-4 w-4 text-gray-400" /> Ví của tôi
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard className="h-4 w-4 text-gray-400" /> Quản trị
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : isGuest ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="text-xs text-gray-500">Xin chào, {guestName}</span>
                  <Link
                    to="/dang-nhap"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link to="/dang-nhap" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    Đăng nhập
                  </Link>
                  <Link to="/dang-ky" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Search - mobile */}
          <form onSubmit={handleSearch} className="pb-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              />
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </form>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white lg:hidden animate-slide-up">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
              <Link to="/" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50">Trang chủ</Link>
              <Link to="/ai" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"><Sparkles className="h-4 w-4" /> UniDrop AI</Link>
              <p className="px-3 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Danh mục</p>
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.slug];
                return (
                  <Link
                    key={cat.id}
                    to={`/danh-muc/${cat.slug}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {Icon && <Icon className="h-4 w-4 text-indigo-600" />}
                    {cat.name}
                  </Link>
                );
              })}
              <div className="border-t border-gray-100 pt-2">
                <Link to="/combo" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Combo</Link>
                <Link to="/khuyen-mai" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50">Khuyến mãi</Link>
                <Link to="/theo-doi-don" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50">Theo dõi đơn hàng</Link>
                {!isLoggedIn && (
                  <div className="space-y-2 pt-2">
                    <Link to="/dang-nhap" className="block rounded-lg bg-gray-100 px-3 py-2.5 text-center text-sm font-semibold text-gray-800">Đăng nhập</Link>
                    <Link to="/dang-ky" className="block rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white">Đăng ký</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
