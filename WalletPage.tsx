import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getTransactionsByUser, createTransaction } from '@/services/orderService';
import { updateBalance } from '@/services/auth';
import { formatCurrency, formatDate } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import type { Transaction } from '@/types';
import { Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Receipt } from 'lucide-react';

export function WalletPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState('');

  const transactions = useMemo(() => (user ? getTransactionsByUser(user.id) : []), [user]);

  if (!user) return null;

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    const allowed = [100000, 500000, 1000000, 5000000];
    if (!amt || !allowed.includes(amt)) {
      showToast('Vui lòng nhập số tiền hợp lệ', 'error');
      return;
    }
    const newBalance = user.balance + amt;
    updateBalance(user.id, newBalance);
    refreshUser();
    const txn: Transaction = {
      id: `TXN${Date.now()}`,
      userId: user.id,
      type: 'topup',
      amount: amt,
      description: `Nạp tiền vào ví`,
      createdAt: new Date().toISOString(),
      balanceAfter: newBalance,
    };
    createTransaction(txn);
    showToast(`Đã nạp ${formatCurrency(amt)} vào ví`, 'success');
    setShowTopup(false);
    setAmount('');
  };

  const quickAmounts = [100000, 500000, 1000000, 5000000];

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white">
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium text-indigo-100">Ví UniDrop</span>
            </div>
            <button
              onClick={() => setShowTopup(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <Plus className="h-4 w-4" /> Nạp tiền
            </button>
          </div>
          <p className="mt-6 text-3xl font-bold">{formatCurrency(user.balance || 0)}</p>
          <p className="mt-1 text-sm text-indigo-200">Số dư hiện tại</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Lịch sử giao dịch</h2>
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  txn.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {txn.amount > 0 ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(txn.createdAt)}</p>
                </div>
                <span className={`text-sm font-bold ${txn.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {txn.amount > 0 ? '+' : ''}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Receipt className="h-10 w-10" />}
            title="Chưa có giao dịch"
            description="Lịch sử nạp tiền và thanh toán sẽ hiển thị tại đây."
          />
        )}
      </div>

      {/* Topup modal */}
      <Modal open={showTopup} onClose={() => setShowTopup(false)} title="Nạp tiền vào ví">
        <form onSubmit={handleTopup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Số tiền nạp</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Nhập số tiền (VND)"
              className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(String(amt))}
                className="rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600"
              >
                {amt >= 1000 ? `${amt / 1000}K` : amt}
              </button>
            ))}
          </div>
          <p className="rounded-lg bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
            Chọn số tiền bạn muốn nạp và xác nhận để cập nhật số dư ví.
          </p>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Nạp tiền
          </button>
        </form>
      </Modal>
    </div>
  );
}
