'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct } from '@/lib/products';

export interface CartItem {
  slug: string;
  color: string;
  size: string;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  count: number;
  subtotal: number;
}

const KEY = 'bk-bag-v1';
const Ctx = createContext<CartCtx | null>(null);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed.filter((i) => getProduct(i.slug)));
      }
    } catch {
      /* storage can be blocked; the bag still works for this visit */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, loaded]);

  const add = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.slug === item.slug && p.color === item.color && p.size === item.size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(10, next[i].qty + qty) };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const setQty = useCallback((index: number, qty: number) => {
    setItems((prev) => (qty <= 0 ? prev.filter((_, i) => i !== index) : prev.map((p, i) => (i === index ? { ...p, qty: Math.min(10, qty) } : p))));
  }, []);

  const remove = useCallback((index: number) => setItems((prev) => prev.filter((_, i) => i !== index)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + (getProduct(i.slug)?.price ?? 0) * i.qty, 0);
    return { items, add, setQty, remove, clear, open, setOpen, count, subtotal };
  }, [items, add, setQty, remove, clear, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
