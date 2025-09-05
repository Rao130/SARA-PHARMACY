import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.medicine === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: Math.min(copy[idx].quantity + qty, 99) };
        return copy;
      }
      return [
        ...prev,
        {
          medicine: product._id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image || 'no-photo.jpg',
          quantity: Math.min(qty, 99),
        },
      ];
    });
  };

  const updateQty = (medicineId, qty) => {
    setItems((prev) => prev.map((x) => (x.medicine === medicineId ? { ...x, quantity: Math.max(1, Math.min(99, qty)) } : x)));
  };

  const removeItem = (medicineId) => {
    setItems((prev) => prev.filter((x) => x.medicine !== medicineId));
  };

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const totalQuantity = items.reduce((s, x) => s + x.quantity, 0);
    const totalAmount = items.reduce((s, x) => s + x.quantity * x.price, 0);
    return { totalQuantity, totalAmount };
  }, [items]);

  const value = useMemo(
    () => ({ items, addItem, updateQty, removeItem, clear, ...totals }),
    [items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
