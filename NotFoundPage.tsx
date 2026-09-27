import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <Package className="h-10 w-10 text-gray-400" />
      </div>
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-3 text-lg font-semibold text-gray-700">Trang không tồn tại</p>
      <p className="mt-1 text-sm text-gray-500">Trang bạn tìm có thể đã bị xóa hoặc chuyển đi nơi khác.</p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
