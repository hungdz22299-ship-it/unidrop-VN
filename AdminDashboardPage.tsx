import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '@/services/productService';
import { getOrders, getTransactions } from '@/services/orderService';
import { getUsers } from '@/services/auth';
import { formatCurrency, formatShortDate } from '@/lib/format';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import type { OrderStatus } from '@/types';

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

export function AdminDashboardPage() {
  const products = useMemo(() => getProducts(), []);
  const orders = useMemo(() => getOrders(), []);
  const users = useMemo(() => getUsers(), []);
  const transactions = useMemo(() => getTransactions(), []);

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const customerCount = users.filter((u) => u.role === 'user').length;

  const stats = [
    { label: 'Doanh thu', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'from-indigo-500 to-indigo-700', trend: '+12%' },
    { label: 'Đơn hàng', value: orders.length, icon: ShoppingBag, color: 'from-emerald-500 to-emerald-700', trend: `${pendingOrders} chờ` },
    { label: 'Sản phẩm', value: products.length, icon: Package, color: 'from-amber-500 to-amber-700', trend: '' },
    { label: 'Khách hàng', value: customerCount, icon: Users, color: 'from-rose-500 to-rose-700', trend: '' },
  ];

  // Top selling products
  const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.trend && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Đơn hàng gần đây</h2>
            <Link to="/admin/don-hang" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Xem tất cả →</Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/don-hang/${order.id}`}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{formatShortDate(order.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">Chưa có đơn hàng nào</p>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Sản phẩm bán chạy</h2>
            <Link to="/admin/san-pham" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Xem tất cả →</Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                  {idx + 1}
                </span>
                <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">Đã bán {product.sold}</p>
                </div>
                <span className="text-sm font-bold text-indigo-600">{formatCurrency(product.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending orders alert */}
      {pendingOrders > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Có {pendingOrders} đơn hàng đang chờ xác nhận</p>
            <p className="text-sm text-amber-700">Xử lý sớm để khách hàng nhận được hàng</p>
          </div>
          <Link
            to="/admin/don-hang"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Xử lý ngay
          </Link>
        </div>
      )}
    </div>
  );
}
