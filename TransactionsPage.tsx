import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTransactionsByUser } from '@/services/orderService';
import { formatCurrency, formatDate } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';
import { Receipt } from 'lucide-react';
export function TransactionsPage(){const {user}=useAuth();const items=useMemo(()=>user?getTransactionsByUser(user.id):[],[user]);if(!user)return null;return <div className="rounded-2xl border border-gray-100 bg-white p-6"><h1 className="mb-5 text-xl font-bold">Lịch sử giao dịch</h1>{items.length?<div className="space-y-2">{items.map(t=><div key={t.id} className="flex items-center gap-3 rounded-xl border-b border-gray-50 p-3"><div className="flex-1"><p className="text-sm font-medium">{t.description}</p><p className="text-xs text-gray-500">{formatDate(t.createdAt)}</p></div><div className="text-right"><p className={`font-semibold ${t.amount>=0?'text-emerald-600':'text-rose-600'}`}>{t.amount>=0?'+':''}{formatCurrency(t.amount)}</p>{t.balanceAfter!==undefined&&<p className="text-xs text-gray-400">Số dư: {formatCurrency(t.balanceAfter)}</p>}</div></div>)}</div>:<EmptyState icon={<Receipt className="h-10 w-10"/>} title="Chưa có giao dịch" description="Các giao dịch nạp tiền, thanh toán và hoàn tiền sẽ hiển thị tại đây."/>}</div>}
