import { useState, useMemo } from 'react';
import { getUsers, saveUsers } from '@/services/auth';
import { useToast } from '@/contexts/ToastContext';
import { formatDate, formatCurrency } from '@/lib/format';
import type { User, Role } from '@/types';
import { Search, Users as UsersIcon, Shield, User as UserIcon } from 'lucide-react';

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(getUsers());
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const refresh = () => setUsers(getUsers());

  const handleRoleChange = (id: string, role: Role) => {
    saveUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
    refresh();
    showToast('Đã cập nhật vai trò', 'success');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="mt-1 text-sm text-gray-500">{users.length} người dùng</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Ngày tham gia</th>
              <th className="px-4 py-3">Số dư ví</th>
              <th className="px-4 py-3">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(user.balance || 0)}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                    className={`rounded-lg border-0 px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer ${
                      user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <option value="user">Thành viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <UsersIcon className="mb-2 h-10 w-10" />
            <p className="text-sm">Chưa có người dùng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
