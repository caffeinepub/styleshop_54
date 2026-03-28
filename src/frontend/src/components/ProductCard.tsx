import { useState } from "react";
import type { Product } from "../backend";
import { useCart } from "../context/CartContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

function formatPrice(cents: bigint) {
  return `₹${(Number(cents) / 100).toFixed(2)}`;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
}

export default function ProductCard({
  product,
  onViewDetails,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");

  const imgUrl =
    product.imageUrl && !product.imageUrl.startsWith("placeholder")
      ? product.imageUrl
      : `https://picsum.photos/seed/${product.id}/400/500`;

  return (
    <div className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow">
      <button
        type="button"
        className="relative overflow-hidden cursor-pointer bg-muted w-full"
        style={{ aspectRatio: "4/5" }}
        onClick={onViewDetails}
      >
        <img
          src={imgUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
        <Badge className="absolute top-2 left-2 text-xs" variant="outline">
          {product.category}
        </Badge>
      </button>

      <div className="p-3">
        <button
          type="button"
          className="font-semibold text-sm truncate cursor-pointer hover:underline w-full text-left"
          onClick={onViewDetails}
        >
          {product.name}
        </button>
        <p className="text-primary font-bold mt-1">
          {formatPrice(product.price)}
        </p>

        {product.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.sizes.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`text-xs px-2 py-0.5 border rounded transition-colors ${
                  selectedSize === s
                    ? "bg-foreground text-background border-foreground"
                    : "border-border hover:border-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          🚚 Delivery: 5–8 days
        </p>

        <Button
          className="w-full mt-2 text-xs h-8"
          disabled={!product.inStock}
          onClick={() => addItem(product, selectedSize)}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
}
