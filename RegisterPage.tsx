import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Package, Mail, Lock, User, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    const result = register(name, email, password);
    if (result.error) {
      setError(result.error);
    } else {
      showToast('Đăng ký thành công! Chào mừng bạn đến UniDrop', 'success');
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Uni<span className="text-indigo-600">Drop</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
          <p className="mt-1 text-sm text-gray-500">Tham gia UniDrop — mua sắm cho sinh viên</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-all hover:bg-indigo-700"
            >
              Tạo tài khoản
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
