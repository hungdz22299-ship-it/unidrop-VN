import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, Product } from '@/types';
import { loadJSON, saveJSON } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const key = user ? `cart_${user.email}` : null;

  useEffect(() => {
    if (!isLoggedIn || !key) {
      setItems([]);
      return;
    }
    setItems(loadJSON<CartItem[]>(key, []));
    const onStorage = (event: StorageEvent) => { if (event.key === `unidrop_${key}`) setItems(loadJSON<CartItem[]>(key, [])); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isLoggedIn, key]);

  const persist = useCallback((newItems: CartItem[]) => {
    if (!key) return;
    setItems(newItems);
    saveJSON(key, newItems);
  }, [key]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (!key || quantity <= 0) return;
    const safeQuantity = Math.min(quantity, Math.max(product.stock, 0));
    if (safeQuantity <= 0) return;
    const existing = items.find((i) => i.productId === product.id);
    const next = existing
      ? items.map((i) => i.productId === product.id
        ? { ...i, quantity: Math.min(i.quantity + safeQuantity, product.stock) }
        : i)
      : [...items, { productId: product.id, name: product.name, price: product.price, image: product.image, quantity: safeQuantity }];
    persist(next);
  }, [items, key, persist]);

  const removeFromCart = useCallback((productId: string) => {
    persist(items.filter((i) => i.productId !== productId));
  }, [items, persist]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const maxStock = Math.max(0, loadJSON<Product[]>('products', []).find((p) => p.id === productId)?.stock ?? quantity);
    persist(items.map((i) => i.productId === productId ? { ...i, quantity: Math.min(quantity, maxStock) } : i));
  }, [items, persist, removeFromCart]);

  const clearCart = useCallback(() => persist([]), [persist]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
