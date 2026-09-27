import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersByUser } from '@/services/orderService';
import { formatCurrency, formatShortDate } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';
import type { OrderStatus } from '@/types';
import { PackageX, ChevronRight } from 'lucide-react';

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

export function MyOrdersPage() {
  const { user } = useAuth();
  const orders = useMemo(() => (user ? getOrdersByUser(user.id) : []), [user]);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <EmptyState
          icon={<PackageX className="h-10 w-10" />}
          title="Chưa có đơn hàng"
          description="Bạn chưa đặt đơn hàng nào. Hãy khám phá sản phẩm và mua sắm ngay!"
          action={<Link to="/" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Mua sắm ngay</Link>}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Lịch sử đơn hàng</h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/don-hang/${order.id}`}
            className="block rounded-xl border border-gray-100 p-4 transition-all hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{order.id}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{formatShortDate(order.createdAt)} · {order.items.length} sản phẩm</p>
                <div className="mt-2 flex gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <img key={item.productId} src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600">{formatCurrency(order.total)}</p>
                <ChevronRight className="ml-auto mt-2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
