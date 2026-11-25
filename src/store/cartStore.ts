import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  variantLabel: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discountPct: number;
  isCartOpen: boolean;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  updateQty: (productId: string, variantLabel: string, delta: number) => void;
  applyPromo: (code: string, pct: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
      discountPct: 0,
      isCartOpen: false,
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
      addItem: (newItem) =>
        set((s) => {
          const idx = s.items.findIndex(
            (i) => i.productId === newItem.productId && i.variantLabel === newItem.variantLabel
          );
          if (idx > -1) {
            const updated = [...s.items];
            updated[idx].quantity += 1;
            return { items: updated };
          }
          return { items: [...s.items, { ...newItem, quantity: 1 }] };
        }),
      updateQty: (productId, variantLabel, delta) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.productId === productId && i.variantLabel === variantLabel
                ? { ...i, quantity: i.quantity + delta }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      applyPromo: (code, pct) => set({ promoCode: code, discountPct: pct }),
      clearCart: () => set({ items: [], promoCode: null, discountPct: 0 }),
    }),
    { name: "nora-atelier-cart" }
  )
);
