import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatDate, formatCurrency } from '@/lib/format';
import { User, Mail, Phone, Calendar, Save } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone });
    showToast('Cập nhật hồ sơ thành công', 'success');
  };

  if (!user) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Hồ sơ cá nhân</h2>

      {/* Info display */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="h-3.5 w-3.5" /> Email
          </div>
          <p className="mt-1.5 font-medium text-gray-900">{user.email}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" /> Ngày tham gia
          </div>
          <p className="mt-1.5 font-medium text-gray-900">{formatDate(user.createdAt)}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-4">
          <div className="flex items-center gap-2 text-xs text-indigo-600">
            Số dư ví
          </div>
          <p className="mt-1.5 font-bold text-indigo-700">{formatCurrency(user.balance || 0)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            Vai trò
          </div>
          <p className="mt-1.5 font-medium text-gray-900">{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</p>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-4 border-t border-gray-100 pt-6">
        <h3 className="font-semibold text-gray-900">Chỉnh sửa thông tin</h3>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Chưa có số điện thoại"
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
        >
          <Save className="h-4 w-4" /> Lưu thay đổi
        </button>
      </form>
    </div>
  );
}
