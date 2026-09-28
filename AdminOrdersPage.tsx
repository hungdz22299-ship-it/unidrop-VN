import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '@/services/orderService';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatShortDate } from '@/lib/format';
import type { OrderStatus } from '@/types';
import { ShoppingBag, Search, ChevronRight } from 'lucide-react';

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

const allStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState(getOrders());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    let list = orders;
    if (filterStatus !== 'all') list = list.filter((o) => o.status === filterStatus);
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((o) => o.id.toLowerCase().includes(q) || o.shippingName.toLowerCase().includes(q));
    return list;
  }, [orders, search, filterStatus]);

  const refresh = () => setOrders(getOrders());

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    refresh();
    showToast(`Đã cập nhật trạng thái: ${statusLabels[status]}`, 'success');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="mt-1 text-sm text-gray-500">{orders.length} đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
              filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Tất cả
          </button>
          {allStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                filterStatus === status ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
              }`}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Ngày đặt</th>
              <th className="px-4 py-3">Tổng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/don-hang/${order.id}`} className="font-semibold text-indigo-600 hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{order.shippingName}</p>
                  <p className="text-xs text-gray-500">{order.shippingPhone}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatShortDate(order.createdAt)}</td>
                <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(order.total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`rounded-lg border-0 px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer ${statusColors[order.status]}`}
                  >
                    {allStatuses.map((status) => (
                      <option key={status} value={status}>{statusLabels[status]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/don-hang/${order.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <ShoppingBag className="mb-2 h-10 w-10" />
            <p className="text-sm">Chưa có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
