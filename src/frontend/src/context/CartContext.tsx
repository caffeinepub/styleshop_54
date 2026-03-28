import { type ReactNode, createContext, useContext, useState } from "react";
import type { Product } from "../backend";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color?: string) => void;
  removeItem: (productId: bigint, size: string, color: string) => void;
  updateQuantity: (
    productId: bigint,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, size: string, color = "") => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.product.id === product.id &&
          i.selectedSize === size &&
          i.selectedColor === color,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id &&
          i.selectedSize === size &&
          i.selectedColor === color
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        { product, quantity: 1, selectedSize: size, selectedColor: color },
      ];
    });
  };

  const removeItem = (productId: bigint, size: string, color: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.product.id === productId &&
            i.selectedSize === size &&
            i.selectedColor === color
          ),
      ),
    );
  };

  const updateQuantity = (
    productId: bigint,
    size: string,
    color: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId &&
        i.selectedSize === size &&
        i.selectedColor === color
          ? { ...i, quantity }
          : i,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
