import type { Order, Transaction, User } from '@/types';
import { loadJSON, saveJSON } from '@/lib/storage';
import { ensureProductsInitialized } from '@/services/productService';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from '@/services/auth';

export const ADMIN_ACCOUNT = { id: 'admin-unidrop-001', name: 'Quản Trị Viên UniDrop', email: 'adminUni@unidrop.vn', password: 'UniDrop@Admin2026', role: 'admin' as const, balance: 999_999_999 };
export const DEMO_ACCOUNT = { id: 'user-unidrop-001', name: 'Nguyễn Minh Anh', email: 'demo@unidrop.vn', password: '9999', role: 'user' as const, balance: 999_999_999 };
const SEEDED_KEY = 'unidrop_seed_v3';
const ORDERS_SEED_KEY = 'unidrop_initial_orders_v3';

function makeUser(account: typeof ADMIN_ACCOUNT | typeof DEMO_ACCOUNT): User {
  return { ...account, createdAt: account.role === 'admin' ? '2026-01-01T08:00:00.000Z' : '2026-01-02T08:00:00.000Z' };
}

function ensurePredefinedUsers(): void {
  const users = getUsers();
  const ensure = (account: typeof ADMIN_ACCOUNT | typeof DEMO_ACCOUNT) => {
    const exact = users.find((u) => u.email.toLowerCase() === account.email.toLowerCase());
    if (exact) {
      Object.assign(exact, { id: account.id, name: account.name, email: account.email, password: account.password, role: account.role });
      return;
    }
    const legacy = users.find((u) => account.role === 'admin' ? u.email.toLowerCase() === 'admin@unidrop.vn' : u.email.toLowerCase() === 'demo@unidrop.vn');
    if (legacy) { Object.assign(legacy, { id: account.id, name: account.name, email: account.email, password: account.password, role: account.role }); return; }
    users.push(makeUser(account));
  };
  ensure(ADMIN_ACCOUNT); ensure(DEMO_ACCOUNT); saveUsers(users);
  const current = getCurrentUser();
  if (current) { const refreshed = users.find((u) => u.id === current.id || u.email.toLowerCase() === current.email.toLowerCase()); if (refreshed) setCurrentUser(refreshed); }
}

function seedInitialTransactionsOnce(): void {
  const user = getUsers().find((u) => u.email.toLowerCase() === DEMO_ACCOUNT.email.toLowerCase());
  if (!user) return;
  const key = `transactions_${user.email}`;
  if (!loadJSON<Transaction[]>(key, []).length) saveJSON(key, []);
}

export function ensureUniDropSeedData(): void {
  ensurePredefinedUsers();
  ensureProductsInitialized();
  // Không tạo đơn hàng mẫu vì catalog UniDrop khởi đầu để trống.
  seedInitialTransactionsOnce();
  saveJSON(SEEDED_KEY, '3');
}
