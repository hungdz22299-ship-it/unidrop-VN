import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { getOrderById, updateOrderStatus } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';
import type { OrderStatus } from '@/types';
import { PackageX, CheckCircle, Clock, Truck, Package, XCircle, ChevronRight } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Chờ xác nhận', color: 'text-amber-600 bg-amber-50', icon: Clock },
  processing: { label: 'Đang chuẩn bị', color: 'text-indigo-600 bg-indigo-50', icon: Package },
  shipped: { label: 'Đang giao', color: 'text-indigo-600 bg-indigo-50', icon: Truck },
  delivered: { label: 'Đã giao', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'text-rose-600 bg-rose-50', icon: XCircle },
};

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [refreshTick, forceRefresh] = useState(0);
  const order = useMemo(() => (user ? getOrderById(id, user.id) : undefined), [id, user, refreshTick]);

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={<PackageX className="h-10 w-10" />}
          title="Không tìm thấy đơn hàng"
          description="Đơn hàng bạn tìm không tồn tại."
          action={<Link to="/" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Về trang chủ</Link>}
        />
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const steps: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIdx = order.status === 'cancelled' ? -1 : steps.indexOf(order.status);

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/tai-khoan/don-hang" className="hover:text-indigo-600">Đơn hàng</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-800">{order.id}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng {order.id}</h1>
          <p className="mt-1 text-sm text-gray-500">Đặt lúc {formatDate(order.createdAt)}</p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${status.color}`}>
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </span>
      </div>

      {/* Status tracker */}
      {order.status !== 'cancelled' && (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const StepIcon = statusConfig[step].icon;
              const isDone = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                        isDone ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <span className={`mt-2 text-xs font-medium ${isDone ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {statusConfig[step].label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 ${idx < currentStepIdx ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Sản phẩm</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
              </div>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping info */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Thông tin giao hàng</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-gray-500">Người nhận</p>
            <p className="font-medium text-gray-900">{order.shippingName}</p>
          </div>
          <div>
            <p className="text-gray-500">Số điện thoại</p>
            <p className="font-medium text-gray-900">{order.shippingPhone}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500">Địa chỉ</p>
            <p className="font-medium text-gray-900">{order.shippingAddress}</p>
          </div>
          <div>
            <p className="text-gray-500">Thanh toán</p>
            <p className="font-medium text-gray-900">{order.paymentMethod}</p>
          </div>
          {order.note && (
            <div className="sm:col-span-2">
              <p className="text-gray-500">Ghi chú</p>
              <p className="font-medium text-gray-900">{order.note}</p>
            </div>
          )}
        </div>
      </div>

      {order.status === 'pending' && (
        <div className="mt-6 flex justify-end">
          <button onClick={() => { updateOrderStatus(order.id, 'cancelled'); forceRefresh((v) => v + 1); showToast('Đã hủy đơn hàng.', 'success'); }} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">Hủy đơn hàng</button>
        </div>
      )}

      {/* Total */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900">Tổng cộng</span>
          <span className="text-xl font-bold text-indigo-600">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
