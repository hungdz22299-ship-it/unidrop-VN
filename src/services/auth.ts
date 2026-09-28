import type { User } from '@/types';
import { loadJSON, saveJSON } from '@/lib/storage';

const USERS_KEY = 'users';
const CURRENT_KEY = 'currentUser';

export const ADMIN_EMAIL = 'adminUni@unidrop.vn';
export const ADMIN_PASSWORD = 'UniDrop@Admin2026';
export const USER_EMAIL = 'demo@unidrop.vn';
export const USER_PASSWORD = '9999';

export function getUsers(): User[] {
  return loadJSON<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]): void {
  saveJSON(USERS_KEY, users);
}

export function getCurrentUser(): User | null {
  return loadJSON<User | null>(CURRENT_KEY, null);
}

export function setCurrentUser(user: User | null): void {
  if (user) saveJSON(CURRENT_KEY, user);
  else saveJSON(CURRENT_KEY, null);
}

export function ensureAdminExists(): void {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || u.email.toLowerCase() === 'admin@unidrop.vn');
  if (existing) {
    Object.assign(existing, {
      id: 'admin-unidrop-001',
      name: 'Quản Trị Viên UniDrop',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
  } else {
    users.push({ id: 'admin-unidrop-001', name: 'Quản Trị Viên UniDrop', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin', balance: 999_999_999, createdAt: '2026-01-01T08:00:00.000Z' });
  }
  saveUsers(users);
}


export function register(name: string, email: string, password: string): { user?: User; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  if (!name.trim()) return { error: 'Vui lòng nhập họ tên' };
  if (!normalizedEmail || !normalizedEmail.includes('@')) return { error: 'Email không hợp lệ' };
  if (password.length < 4) return { error: 'Mật khẩu cần ít nhất 4 ký tự' };
  if (users.find((u) => u.email.toLowerCase() === normalizedEmail)) return { error: 'Email đã được đăng ký' };

  const user: User = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'user',
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  setCurrentUser(user);
  return { user };
}

export function login(email: string, password: string): { user?: User; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return { error: 'Email không tồn tại' };
  if (user.password !== password) return { error: 'Mật khẩu không đúng' };
  setCurrentUser(user);
  return { user };
}

export function logout(): void {
  setCurrentUser(null);
}

export function updateProfile(userId: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates, id: users[idx].id, role: users[idx].role };
  saveUsers(users);
  const current = getCurrentUser();
  if (current && current.id === userId) setCurrentUser(users[idx]);
  return users[idx];
}

export function updateBalance(userId: string, newBalance: number): User | null {
  const updated = updateProfile(userId, { balance: Math.max(0, newBalance) });
  if (updated) saveJSON(`wallet_${updated.email}`, { balance: updated.balance, updatedAt: new Date().toISOString() });
  return updated;
}
