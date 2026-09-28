import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';
import { SearchPage } from '@/pages/SearchPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { PromotionsPage } from '@/pages/PromotionsPage';
import { PolicyPage } from '@/pages/PolicyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { HelpPage } from '@/pages/HelpPage';
import { ComboPage } from '@/pages/ComboPage';
import { TransactionsPage } from '@/pages/account/TransactionsPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AccountLayout } from '@/pages/account/AccountLayout';
import { ProfilePage } from '@/pages/account/ProfilePage';
import { MyOrdersPage } from '@/pages/account/MyOrdersPage';
import { WalletPage } from '@/pages/account/WalletPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminCombosPage } from '@/pages/admin/AdminCombosPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminPromotionsPage } from '@/pages/admin/AdminPromotionsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminStatisticsPage } from '@/pages/admin/AdminStatisticsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { ensureUniDropSeedData } from '@/services/seedService';
import { loadProductsFromCloud } from '@/services/productService';
import { loadCombosFromCloud } from '@/services/comboService';

// Initialize the local data layer before the first page reads from storage.
ensureUniDropSeedData();

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tim-kiem" element={<SearchPage />} />
        <Route path="/danh-muc/:slug" element={<CategoryPage />} />
        <Route path="/san-pham" element={<SearchPage />} />
        <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
        <Route path="/khuyen-mai" element={<PromotionsPage />} />
        <Route path="/combo" element={<ComboPage />} />
        <Route path="/chinh-sach" element={<PolicyPage />} />
        <Route path="/theo-doi-don" element={<TrackOrderPage />} />
        <Route path="/tro-giup" element={<HelpPage />} />
        <Route path="/ai" element={<AIAssistantPage />} />
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />

        <Route path="/gio-hang" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/yeu-thich" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/thanh-toan" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/don-hang/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

        <Route path="/tai-khoan" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route index element={<ProfilePage />} />
          <Route path="don-hang" element={<MyOrdersPage />} />
          <Route path="vi" element={<WalletPage />} />
          <Route path="lich-su-giao-dich" element={<TransactionsPage />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="san-pham" element={<AdminProductsPage />} />
          <Route path="combo" element={<AdminCombosPage />} />
          <Route path="don-hang" element={<AdminOrdersPage />} />
          <Route path="khuyen-mai" element={<AdminPromotionsPage />} />
          <Route path="nguoi-dung" element={<AdminUsersPage />} />
          <Route path="thong-ke" element={<AdminStatisticsPage />} />
          <Route path="cai-dat" element={<AdminSettingsPage />} />
        </Route>

        <Route path="/trang-chu" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  const [productsReady, setProductsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([loadProductsFromCloud(), loadCombosFromCloud()]).finally(() => {
      if (active) setProductsReady(true);
    });
    return () => { active = false; };
  }, []);

  if (!productsReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-5 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
          <p className="mt-3 text-sm font-medium text-gray-700">Đang tải sản phẩm UniDrop...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <AppRoutes />
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
