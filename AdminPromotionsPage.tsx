import { useState, useMemo } from 'react';
import { getPromotions, savePromotions } from '@/services/orderService';
import { useToast } from '@/contexts/ToastContext';
import { Modal } from '@/components/Modal';
import { formatShortDate } from '@/lib/format';
import type { Promotion } from '@/types';
import { Plus, Edit2, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

const emptyForm: Omit<Promotion, 'id' | 'usedCount'> = {
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: 10,
  minOrder: 100000,
  maxDiscount: undefined,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  active: true,
};

export function AdminPromotionsPage() {
  const { showToast } = useToast();
  const [promos, setPromos] = useState<Promotion[]>(getPromotions());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const refresh = () => setPromos(getPromotions());

  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (promo: Promotion) => {
    setForm({ ...promo });
    setEditingId(promo.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa mã khuyến mãi này?')) {
      savePromotions(promos.filter((p) => p.id !== id));
      refresh();
      showToast('Đã xóa mã khuyến mãi', 'info');
    }
  };

  const handleToggle = (promo: Promotion) => {
    savePromotions(promos.map((p) => (p.id === promo.id ? { ...p, active: !p.active } : p)));
    refresh();
    showToast(promo.active ? 'Đã tắt mã' : 'Đã bật mã', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = form.code.toUpperCase().trim();
    if (editingId) {
      savePromotions(promos.map((p) => (p.id === editingId ? { ...p, ...form, code } : p)));
      showToast('Đã cập nhật mã khuyến mãi', 'success');
    } else {
      const newPromo: Promotion = {
        ...form,
        code,
        id: `promo-${Date.now()}`,
        usedCount: 0,
      };
      savePromotions([...promos, newPromo]);
      showToast('Đã thêm mã khuyến mãi', 'success');
    }
    refresh();
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã khuyến mãi</h1>
          <p className="mt-1 text-sm text-gray-500">{promos.length} mã</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Thêm mã
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => (
          <div key={promo.id} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <span className="font-mono text-lg font-bold tracking-wider text-indigo-600">{promo.code}</span>
                <p className="mt-1 text-sm text-gray-600">{promo.description}</p>
              </div>
              <button
                onClick={() => handleToggle(promo)}
                className={promo.active ? 'text-emerald-500' : 'text-gray-300'}
              >
                {promo.active ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-gray-500">
              <p>Loại: {promo.discountType === 'percent' ? `Giảm ${promo.discountValue}%` : `Giảm ${promo.discountValue.toLocaleString('vi-VN')}đ`}</p>
              <p>Đơn tối thiểu: {promo.minOrder.toLocaleString('vi-VN')}đ</p>
              {promo.maxDiscount && <p>Giảm tối đa: {promo.maxDiscount.toLocaleString('vi-VN')}đ</p>}
              <p>Hết hạn: {formatShortDate(promo.endDate)}</p>
              <p>Đã dùng: {promo.usedCount} lần</p>
            </div>

            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => handleEdit(promo)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
              >
                <Edit2 className="h-3.5 w-3.5" /> Sửa
              </button>
              <button
                onClick={() => handleDelete(promo.id)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Xóa
              </button>
            </div>
          </div>
        ))}
        {promos.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-12 text-gray-400">
            <Tag className="mb-2 h-10 w-10" />
            <p className="text-sm">Chưa có mã khuyến mãi nào</p>
          </div>
        )}
      </div>

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Chỉnh sửa mã' : 'Thêm mã khuyến mãi'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Mã giảm giá</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
              placeholder="VD: SUMMER20"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Mô tả</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Loại giảm</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percent' | 'fixed' })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                <option value="percent">Theo phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VND)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Giá trị giảm</label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: parseInt(e.target.value) || 0 })}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Đơn tối thiểu (VND)</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Giảm tối đa (VND)</label>
              <input
                type="number"
                value={form.maxDiscount || ''}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-indigo-600"
            />
            Hoạt động
          </label>
          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {editingId ? 'Lưu' : 'Thêm mã'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
