import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "../backend";
import CartSidebar from "../components/CartSidebar";
import DeliveryStrip from "../components/DeliveryStrip";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useActor } from "../hooks/useActor";

type ProductWithSub = Product & { subcategory?: string };

export default function StorePage() {
  const { actor } = useActor();
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.getAllProducts(),
    enabled: !!actor,
  });

  // Build dynamic subcategory list from loaded products
  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products as ProductWithSub[]) {
      const sub = p.subcategory || p.category || "Other";
      counts[sub] = (counts[sub] || 0) + 1;
    }
    return counts;
  }, [products]);

  const subcategories = useMemo(
    () => Object.keys(subcategoryCounts).sort(),
    [subcategoryCounts],
  );

  const filtered = (products as ProductWithSub[])
    .filter(
      (p) =>
        selectedSubcategory === "All" ||
        (p.subcategory || p.category) === selectedSubcategory,
    )
    .filter(
      (p) =>
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="min-h-screen bg-background">
      <DeliveryStrip />
      <Header onCartClick={() => setCartOpen(true)} />

      {/* Hero */}
      <div
        className="relative h-[320px] md:h-[420px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('/assets/generated/hero-banner.dim_1400x600.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            Dress to Impress
          </h1>
          <p className="text-base md:text-xl opacity-90 mb-5 md:mb-6">
            Premium men's clothing &amp; accessories
          </p>
          <Button className="bg-white text-black hover:bg-gray-100 text-sm md:text-lg md:px-8 md:py-3">
            Shop Now
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="store.search_input"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Subcategory Filter */}
        <div className="flex flex-wrap gap-2 mb-4 md:mb-6 overflow-x-auto">
          <button
            type="button"
            data-ocid="store.tab"
            onClick={() => setSelectedSubcategory("All")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border whitespace-nowrap ${
              selectedSubcategory === "All"
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground"
            }`}
          >
            All ({products.length})
          </button>
          {subcategories.map((sub) => (
            <button
              type="button"
              key={sub}
              data-ocid="store.tab"
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border whitespace-nowrap ${
                selectedSubcategory === sub
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground"
              }`}
            >
              {sub} ({subcategoryCounts[sub]})
            </button>
          ))}
        </div>

        {/* Search result count */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for
            &quot;{searchQuery}&quot;
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
              <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="store.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            {searchQuery
              ? `No products found for "${searchQuery}"`
              : "No products found."}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                onViewDetails={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
