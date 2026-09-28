import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, getOrdersByUser } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatShortDate } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';
import type { OrderStatus } from '@/types';
import { Search, PackageX, ChevronRight } from 'lucide-react';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  processing: 'Đang chuẩn bị',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export function TrackOrderPage() {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<ReturnType<typeof getOrders>[0] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const allOrders = getOrders();
    const order = allOrders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());
    if (order) {
      setFoundOrder(order);
    } else {
      setFoundOrder(null);
    }
  };

  const userOrders = user ? getOrdersByUser(user.id).slice(0, 5) : [];

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Theo dõi đơn hàng</h1>
      <p className="mb-6 text-sm text-gray-500">Nhập mã đơn hàng để xem trạng thái giao hàng</p>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="VD: DH1700..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">
          Tra cứu
        </button>
      </form>

      {searched && !foundOrder && (
        <div className="mb-6">
          <EmptyState
            icon={<PackageX className="h-10 w-10" />}
            title="Không tìm thấy đơn hàng"
            description={`Không có đơn hàng nào với mã "${orderId}". Kiểm tra lại mã đơn nhé!`}
          />
        </div>
      )}

      {foundOrder && (
        <Link
          to={`/don-hang/${foundOrder.id}`}
          className="mb-6 block rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">{foundOrder.id}</p>
              <p className="text-sm text-gray-500">{formatShortDate(foundOrder.createdAt)}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[foundOrder.status]}`}>
                {statusLabels[foundOrder.status]}
              </span>
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-600">{formatCurrency(foundOrder.total)}</p>
              <p className="text-sm text-gray-500">{foundOrder.items.length} sản phẩm</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>
      )}

      {userOrders.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Đơn hàng gần đây</h2>
          <div className="space-y-3">
            {userOrders.map((order) => (
              <Link
                key={order.id}
                to={`/don-hang/${order.id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{formatShortDate(order.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{formatCurrency(order.total)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
