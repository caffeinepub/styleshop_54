import { useState } from "react";
import type { Product } from "../backend";
import { useCart } from "../context/CartContext";
import { getColorsForCategory } from "../utils/productColors";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

function formatPrice(cents: bigint) {
  return `₹${(Number(cents) / 100).toFixed(2)}`;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [added, setAdded] = useState(false);
  const colors = getColorsForCategory(product.category);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "");

  const imgUrl =
    product.imageUrl && !product.imageUrl.startsWith("placeholder")
      ? product.imageUrl
      : `https://picsum.photos/seed/${product.id}/600/750`;

  const handleAdd = () => {
    addItem(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-y-auto max-h-[90vh]">
        <div className="flex flex-col sm:flex-row">
          <div
            className="sm:w-1/2 bg-muted max-h-60 sm:max-h-none"
            style={{ aspectRatio: "4/5" }}
          >
            <img
              src={imgUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="sm:w-1/2 p-5 md:p-6 flex flex-col">
            <DialogHeader>
              <Badge variant="outline" className="w-fit mb-2">
                {product.category}
              </Badge>
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
            </DialogHeader>
            <p className="text-2xl font-bold mt-2">
              {formatPrice(product.price)}
            </p>
            <p className="text-muted-foreground text-sm mt-3 flex-1 leading-relaxed">
              {product.description}
            </p>

            {product.sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Size: {selectedSize}</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1 border rounded text-sm transition-colors ${
                        selectedSize === s
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">
                  Color:{" "}
                  <span className="text-muted-foreground font-normal">
                    {selectedColor}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      title={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === c.name
                          ? "border-foreground scale-110 shadow-md"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              🚚 Delivery: 5–8 days across India
            </p>

            <Button
              className="mt-4"
              disabled={!product.inStock}
              onClick={handleAdd}
            >
              {added
                ? "Added!"
                : product.inStock
                  ? "Add to Cart"
                  : "Out of Stock"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
