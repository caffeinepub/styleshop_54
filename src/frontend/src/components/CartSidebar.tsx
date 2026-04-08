import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { hexForColor } from "../utils/colorOptions";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

const SHIPPING_THRESHOLD = 99900;
const SHIPPING_FEE = 7000;

function formatPrice(cents: number) {
  return `₹${(cents / 100).toFixed(2)}`;
}

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } =
    useCart();
  const navigate = useNavigate();

  const shippingFee = totalAmount < SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const grandTotal = totalAmount + shippingFee;
  const amountNeededForFreeShipping = Math.ceil(
    (SHIPPING_THRESHOLD - totalAmount) / 100,
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Cart ({totalItems} items)</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Your cart is empty
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-3 items-start"
                >
                  <img
                    src={`https://picsum.photos/seed/${item.product.id}/80/100`}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.selectedSize && (
                        <p className="text-xs text-muted-foreground">
                          Size: {item.selectedSize}
                        </p>
                      )}
                      {item.selectedColor && (
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: hexForColor(item.selectedColor),
                            }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {item.selectedColor}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mt-1">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1,
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity + 1,
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() =>
                      removeItem(
                        item.product.id,
                        item.selectedSize,
                        item.selectedColor,
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                {shippingFee === 0 ? (
                  <span className="text-green-600 font-semibold">FREE 🎉</span>
                ) : (
                  <span>{formatPrice(shippingFee)}</span>
                )}
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  🛑 Add ₹{amountNeededForFreeShipping} more for free shipping!
                </p>
              )}
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  onClose();
                  navigate({ to: "/checkout" });
                }}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
