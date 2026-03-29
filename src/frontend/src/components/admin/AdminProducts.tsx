import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Product } from "../../backend";
import { useActor } from "../../hooks/useActor";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const SUBCATEGORIES = [
  "T-Shirt",
  "Shirt",
  "Jeans",
  "Pants",
  "Hoodie",
  "Jacket",
  "Sweater",
  "Shorts",
  "Footwear",
  "Accessories",
];

type ProductWithSub = Product & { subcategory?: string };

function formatPrice(cents: bigint) {
  return (Number(cents) / 100).toFixed(2);
}

const emptyProduct: Omit<ProductWithSub, "id" | "createdAt"> = {
  name: "",
  description: "",
  price: BigInt(0),
  category: "Men",
  subcategory: "",
  sizes: ["S", "M", "L", "XL"],
  imageUrl: "",
  inStock: true,
};

export default function AdminProducts() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<ProductWithSub | null>(
    null,
  );
  const [addingNew, setAddingNew] = useState(false);
  const [newProduct, setNewProduct] =
    useState<Omit<ProductWithSub, "id" | "createdAt">>(emptyProduct);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.getAllProducts(),
    enabled: !!actor,
  });

  const updateMutation = useMutation({
    mutationFn: (p: ProductWithSub) => actor!.updateProduct(p.id, p as Product),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => actor!.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      actor!.addProduct({
        ...newProduct,
        id: BigInt(0),
        createdAt: BigInt(Date.now()),
      } as Product),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setAddingNew(false);
      setNewProduct(emptyProduct);
    },
  });

  if (isLoading)
    return <div className="text-muted-foreground">Loading products...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {products.length} products
        </p>
        <Button onClick={() => setAddingNew(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-3">Image</th>
              <th className="text-left py-2 pr-3">Name</th>
              <th className="text-left py-2 pr-3">Category</th>
              <th className="text-left py-2 pr-3">Subcategory</th>
              <th className="text-left py-2 pr-3">Price</th>
              <th className="text-left py-2 pr-3">Sizes</th>
              <th className="text-left py-2 pr-3">Stock</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(products as ProductWithSub[]).map((p) => (
              <tr key={p.id.toString()} className="border-b hover:bg-muted/30">
                <td className="py-2 pr-3">
                  <img
                    src={
                      p.imageUrl || `https://picsum.photos/seed/${p.id}/60/75`
                    }
                    alt={p.name}
                    className="w-10 h-12 object-cover rounded"
                  />
                </td>
                <td className="py-2 pr-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {p.description}
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <Badge variant="outline">{p.category}</Badge>
                </td>
                <td className="py-2 pr-3">
                  {p.subcategory ? (
                    <Badge variant="secondary">{p.subcategory}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="py-2 pr-3 font-semibold">
                  ₹{formatPrice(p.price)}
                </td>
                <td className="py-2 pr-3">{p.sizes.join(", ")}</td>
                <td className="py-2 pr-3">
                  <Badge variant={p.inStock ? "default" : "secondary"}>
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingProduct({ ...p })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`))
                          deleteMutation.mutate(p.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {editingProduct && (
        <ProductEditDialog
          product={editingProduct}
          onSave={(p) => updateMutation.mutate(p)}
          onClose={() => setEditingProduct(null)}
          loading={updateMutation.isPending}
        />
      )}

      {/* Add Dialog */}
      {addingNew && (
        <ProductFormDialog
          title="Add New Product"
          product={newProduct}
          onChange={setNewProduct}
          onSave={() => addMutation.mutate()}
          onClose={() => setAddingNew(false)}
          loading={addMutation.isPending}
        />
      )}
    </div>
  );
}

function ProductEditDialog({
  product,
  onSave,
  onClose,
  loading,
}: {
  product: ProductWithSub;
  onSave: (p: ProductWithSub) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [p, setP] = useState<ProductWithSub>(product);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <ProductFields
          product={p}
          onChange={(updated) => setP((prev) => ({ ...prev, ...updated }))}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(p)} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductFormDialog({
  title,
  product,
  onChange,
  onSave,
  onClose,
  loading,
}: {
  title: string;
  product: Omit<ProductWithSub, "id" | "createdAt">;
  onChange: (p: Omit<ProductWithSub, "id" | "createdAt">) => void;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ProductFields
          product={{ ...product, id: BigInt(0), createdAt: BigInt(0) }}
          onChange={(updated) => onChange({ ...product, ...updated })}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? "Saving..." : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductFields({
  product,
  onChange,
}: {
  product: ProductWithSub;
  onChange: (updates: Partial<ProductWithSub>) => void;
}) {
  const priceStr = (Number(product.price) / 100).toFixed(2);
  const sizesStr = product.sizes.join(", ");

  return (
    <div className="space-y-3">
      <div>
        <Label>Name</Label>
        <Input
          value={product.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={product.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Price (₹)</Label>
          <Input
            type="number"
            step="0.01"
            value={priceStr}
            onChange={(e) =>
              onChange({
                price: BigInt(
                  Math.round(Number.parseFloat(e.target.value || "0") * 100),
                ),
              })
            }
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select
            value={product.category}
            onValueChange={(v) => onChange({ category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Men">Men</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Subcategory</Label>
        <Select
          value={product.subcategory || ""}
          onValueChange={(v) => onChange({ subcategory: v })}
        >
          <SelectTrigger data-ocid="admin.products.select">
            <SelectValue placeholder="Select subcategory..." />
          </SelectTrigger>
          <SelectContent>
            {SUBCATEGORIES.map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Sizes (comma-separated)</Label>
        <Input
          value={sizesStr}
          onChange={(e) =>
            onChange({
              sizes: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
      <div>
        <Label>Image URL</Label>
        <Input
          value={product.imageUrl}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://... (leave empty for auto image)"
        />
      </div>
      <div className="flex items-center gap-3">
        <Label>In Stock</Label>
        <input
          type="checkbox"
          checked={product.inStock}
          onChange={(e) => onChange({ inStock: e.target.checked })}
          className="h-4 w-4"
        />
      </div>
    </div>
  );
}
