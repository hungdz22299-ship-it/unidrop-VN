import { Link } from 'react-router-dom';
import { categories } from '@/data/categories';
import { Package, Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">
                Uni<span className="text-indigo-400">Drop</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Nền tảng mua sắm trực tuyến dành riêng cho sinh viên. Đồ dùng thiết yếu, giá sinh viên, giao nhanh.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Danh mục</h4>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/danh-muc/${cat.slug}`} className="text-gray-400 hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Hỗ trợ</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/theo-doi-don" className="text-gray-400 hover:text-indigo-400 transition-colors">Theo dõi đơn hàng</Link></li>
              <li><Link to="/khuyen-mai" className="text-gray-400 hover:text-indigo-400 transition-colors">Mã khuyến mãi</Link></li>
              <li><Link to="/chinh-sach" className="text-gray-400 hover:text-indigo-400 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/chinh-sach" className="text-gray-400 hover:text-indigo-400 transition-colors">Phương thức thanh toán</Link></li>
              <li><Link to="/chinh-sach" className="text-gray-400 hover:text-indigo-400 transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" />
                <span className="text-gray-400">Khu Công Nghệ, Làng Sinh Viên, Quận Nam Từ Liêm, TP. Hà Nội</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                <span className="text-gray-400">1900 1234 (8h - 21h)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                <span className="text-gray-400">hotro@unidrop.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© 2026 UniDrop. Mọi quyền được bảo lưu.</p>
          <p>Thiết kế dành cho sinh viên Việt Nam</p>
        </div>
      </div>
    </footer>
  );
}
