import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { loadJSON, saveJSON } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface WishlistContextValue {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const key = user ? `wishlist_${user.email}` : null;

  useEffect(() => {
    if (!isLoggedIn || !key) {
      setWishlist([]);
      return;
    }
    setWishlist(loadJSON<string[]>(key, []));
    const onStorage = (event: StorageEvent) => { if (event.key === `unidrop_${key}`) setWishlist(loadJSON<string[]>(key, [])); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isLoggedIn, key]);

  const toggleWishlist = useCallback((productId: string) => {
    if (!key) return;
    setWishlist((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      saveJSON(key, next);
      return next;
    });
  }, [key]);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  return <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, count: wishlist.length }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
