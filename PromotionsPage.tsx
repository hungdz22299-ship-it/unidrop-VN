import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPromotions } from '@/services/orderService';
import { formatShortDate } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';
import { Tag, Copy, Check, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

export function PromotionsPage() {
  const promos = useMemo(() => getPromotions().filter((p) => p.active && new Date(p.endDate) > new Date()), []);
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState('');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      showToast('Đã sao chép mã', 'success');
      setTimeout(() => setCopiedCode(''), 2000);
    });
  };

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-medium text-rose-600">
          <Tag className="h-4 w-4" /> Khuyến mãi hot
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Mã giảm giá</h1>
        <p className="mt-2 text-sm text-gray-500">Sao chép mã và áp dụng khi thanh toán để nhận ưu đãi</p>
      </div>

      {promos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-gradient-to-br from-indigo-50 to-rose-50 opacity-50" />
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                    {promo.discountType === 'percent' ? `Giảm ${promo.discountValue}%` : `Giảm ${promo.discountValue.toLocaleString('vi-VN')}đ`}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    Hết hạn {formatShortDate(promo.endDate)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{promo.description}</h3>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-2.5 text-center">
                    <span className="font-mono text-lg font-bold tracking-wider text-indigo-600">{promo.code}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-900 text-white transition-all hover:bg-indigo-600"
                  >
                    {copiedCode === promo.code ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  Đơn tối thiểu {promo.minOrder.toLocaleString('vi-VN')}đ
                  {promo.maxDiscount && ` · Giảm tối đa ${promo.maxDiscount.toLocaleString('vi-VN')}đ`}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Tag className="h-10 w-10" />}
          title="Chưa có khuyến mãi"
          description="Hiện không có mã giảm giá nào đang hoạt động. Hãy quay lại sau!"
        />
      )}

      <div className="mt-12 rounded-2xl bg-gradient-to-r from-gray-900 to-indigo-950 p-8 text-center">
        <h2 className="text-xl font-bold text-white">Muốn nhận deal sớm nhất?</h2>
        <p className="mt-2 text-sm text-gray-300">Theo dõi trang khuyến mãi thường xuyên để không bỏ lỡ những mã giảm giá hấp dẫn</p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
        >
          Mua sắm ngay
        </Link>
      </div>
    </div>
  );
}
