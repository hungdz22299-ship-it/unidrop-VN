import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ensureProductsInitialized } from '@/services/productService';
import { ensurePromosInitialized } from '@/services/orderService';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    ensureProductsInitialized();
    ensurePromosInitialized();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
