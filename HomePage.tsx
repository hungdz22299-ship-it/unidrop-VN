import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { categories } from '@/data/categories';
import { getProducts } from '@/services/productService';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { formatCurrency } from '@/lib/format';
import { Truck, ShieldCheck, RotateCcw, Headphones, ArrowRight, Sparkles, Flame, Tag } from 'lucide-react';

export function HomePage() {
  const { isAdmin } = useAuth();
  const allProducts = useMemo(() => getProducts(), []);
  const featured = allProducts.filter((p) => p.featured).slice(0, 8);
  const bestsellers = allProducts.filter((p) => p.bestseller).slice(0, 4);
  const newArrivals = allProducts.filter((p) => p.isNew).slice(0, 4);
  const onSale = allProducts.filter((p) => p.onSale).slice(0, 4);

  if (allProducts.length === 0) {
    return (
      <div className="animate-fade-in">
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
          <div className="mx-auto max-w-7xl px-4 py-16 text-white lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
                <Sparkles className="h-4 w-4" />
                UniDrop — Cửa hàng của bạn
              </div>
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Bắt đầu xây dựng
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                  cửa hàng UniDrop
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-gray-300">
                Hiện cửa hàng chưa có sản phẩm nào.
              </p>
              {isAdmin && (
                <Link
                  to="/admin/san-pham"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
                >
                  Thêm sản phẩm đầu tiên
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
            {[
              { icon: Truck, title: 'Giao nhanh', desc: 'Thông tin mô phỏng' },
              { icon: ShieldCheck, title: 'Thanh toán', desc: 'Chỉ mô phỏng' },
              { icon: RotateCcw, title: 'Đổi trả', desc: 'Theo cấu hình demo' },
              { icon: Headphones, title: 'Hỗ trợ', desc: '8h - 21h mỗi ngày' },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
              <div key={badge.title} className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </div>
              </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-indigo-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
                <Sparkles className="h-4 w-4" />
                Mua sắm cho sinh viên — Giá cực sinh viên
              </div>
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Học tốt hơn. Sống chất hơn!
              </h1>
              <p className="max-w-xl text-lg text-gray-300">
                Đồ dùng tiện ích, phụ kiện và sản phẩm chuẩn gu sinh viên.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/danh-muc/goc-hoc-tap"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/san-pham"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
                >
                  <Tag className="h-4 w-4" />
                  Xem sản phẩm
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {featured.slice(0, 4).map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/san-pham/${p.slug}`}
                    className={`group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-indigo-400/40 hover:bg-white/10 ${
                      i % 2 === 1 ? 'mt-8' : ''
                    }`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-xs font-medium text-white">{p.name}</p>
                      <p className="mt-1 text-sm font-bold text-indigo-400">{formatCurrency(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          {[
            { icon: Truck, title: 'Giao nhanh', desc: 'Trong 24h tại nội thành' },
            { icon: ShieldCheck, title: 'Thanh toán', desc: 'An toàn, bảo mật' },
            { icon: RotateCcw, title: 'Đổi trả', desc: 'Trong 7 ngày' },
            { icon: Headphones, title: 'Hỗ trợ', desc: '8h - 21h mỗi ngày' },
          ].map((badge) => {
            const Icon = badge.icon;
            return (
            <div key={badge.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{badge.title}</p>
                <p className="text-xs text-gray-500">{badge.desc}</p>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Danh mục nổi bật</h2>
            <p className="mt-1 text-sm text-gray-500">Tất cả những gì sinh viên cần, gọn gàng chia theo nhóm</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-rose-500" />
            <h2 className="text-2xl font-bold text-gray-900">Sản phẩm hot hôm nay</h2>
          </div>
          <Link to="/tim-kiem?q=bestseller" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Flash sale banner */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 to-rose-600 p-8 lg:p-12">
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
            <div className="absolute -right-10 top-1/4 h-40 w-40 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative max-w-lg">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase text-white">
              <Tag className="h-3 w-3" /> Flash Sale
            </div>
            <h2 className="text-3xl font-bold text-white">Giảm đến 40%</h2>
            <p className="mt-2 text-white/80">Hàng ngàn sản phẩm đang được giảm giá. Số lượng có hạn, chốt đơn ngay!</p>
            <Link
              to="/khuyen-mai"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-rose-600 transition-transform hover:scale-105"
            >
              Mua ngay <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gợi ý cho bạn</h2>
            <p className="mt-1 text-sm text-gray-500">Những sản phẩm được UniDrop chọn lọc kỹ càng</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-900">Mới về</h2>
          </div>
          <Link to="/tim-kiem?q=new" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* On sale */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-emerald-500" />
            <h2 className="text-2xl font-bold text-gray-900">Đang giảm giá</h2>
          </div>
          <Link to="/khuyen-mai" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {onSale.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="overflow-hidden rounded-3xl bg-gray-900 p-8 text-center lg:p-12">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">Nhận thông tin khuyến mãi</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            Đăng ký để không bỏ lỡ những deal hot nhất, dành riêng cho sinh viên
          </p>
          <form className="mx-auto mt-6 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="email@example.com"
              className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
            />
            <button className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
              Đăng ký
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
