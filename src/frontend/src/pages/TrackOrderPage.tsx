import { Link } from "@tanstack/react-router";
import { ArrowLeft, Package, Search } from "lucide-react";
import { useState } from "react";
import type { OrderType } from "../backend";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useActor } from "../hooks/useActor";
import { decodeOrderId, formatOrderId } from "../utils/orderId";

function statusColor(status: string) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Confirmed":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Shipped":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "Delivered":
      return "bg-green-100 text-green-800 border-green-300";
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrackOrderPage() {
  const { actor } = useActor();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderType | null | undefined>(undefined);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!actor || !orderId || !phone) return;
    setLoading(true);
    setError("");
    setOrder(undefined);
    try {
      // Decode alphanumeric code (e.g. ZP4K2) back to numeric ID
      const numericId = decodeOrderId(orderId.trim().toUpperCase());
      if (numericId === null) {
        setError(
          "Order not found. Please check your Order ID and phone number.",
        );
        setLoading(false);
        return;
      }
      const result = await actor.getOrderByIdAndPhone(BigInt(numericId), phone);
      setOrder(result);
      if (!result)
        setError(
          "Order not found. Please check your Order ID and phone number.",
        );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground text-sm">
              Enter your Order ID (e.g. ZP4K2) and phone number
            </p>
          </div>
        </div>
        <form
          onSubmit={handleSearch}
          className="bg-card border border-border rounded-2xl p-6 space-y-4 mb-8"
        >
          <div>
            <label
              htmlFor="track-order-id"
              className="text-sm font-medium mb-1.5 block"
            >
              Order ID
            </label>
            <Input
              id="track-order-id"
              data-ocid="track.input"
              type="text"
              placeholder="e.g. ZP4K2"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label
              htmlFor="track-phone"
              className="text-sm font-medium mb-1.5 block"
            >
              Phone Number
            </label>
            <Input
              id="track-phone"
              type="tel"
              placeholder="Phone number used at checkout"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button
            data-ocid="track.submit_button"
            type="submit"
            className="w-full"
            disabled={loading || !actor}
          >
            {loading ? (
              "Searching..."
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Track Order
              </>
            )}
          </Button>
        </form>
        {error && (
          <div
            data-ocid="track.error_state"
            className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 text-sm"
          >
            {error}
          </div>
        )}
        {order && (
          <div
            data-ocid="track.success_state"
            className="bg-card border border-border rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="text-xl font-bold font-mono">
                  {formatOrderId(Number(order.orderNumber))}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Placed on {formatDateTime(Number(order.createdAt))}
            </div>
            {order.trackingNumber && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-700 font-medium">
                  Tracking Number
                </p>
                <p className="font-mono font-bold text-purple-900">
                  {order.trackingNumber}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Items Ordered
              </p>
              <div className="space-y-1.5">
                {order.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.productName} ({item.size}) x
                      {item.quantity.toString()}
                    </span>
                    <span className="font-medium">
                      ₹{(Number(item.price) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>₹{(Number(order.totalAmount) / 100).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Questions? WhatsApp{" "}
              <a
                href="https://wa.me/919769447954"
                className="text-primary font-medium"
              >
                9769447954
              </a>{" "}
              or email{" "}
              <a
                href="mailto:abhishekrathi0710@gmail.com"
                className="text-primary font-medium"
              >
                abhishekrathi0710@gmail.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
