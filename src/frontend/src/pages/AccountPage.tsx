import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, LogIn, Package, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { formatOrderId } from "../utils/orderId";

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

export default function AccountPage() {
  const { actor, isFetching } = useActor();
  const { login, isLoggingIn, identity } = useInternetIdentity();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => actor!.getMyOrders(),
    enabled: !!actor && !isFetching && !!identity,
  });

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
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-muted-foreground text-sm">
              View your past orders and payment status
            </p>
          </div>
        </div>
        {!identity ? (
          <div
            data-ocid="account.panel"
            className="bg-card border border-border rounded-2xl p-8 text-center space-y-5"
          >
            <LogIn className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Login to view your orders</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with Internet Identity to see all your past orders and
              track deliveries.
            </p>
            <Button
              data-ocid="account.primary_button"
              onClick={login}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login with Internet Identity"}
            </Button>
          </div>
        ) : isLoading ? (
          <div data-ocid="account.loading_state" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div
            data-ocid="account.empty_state"
            className="bg-card border border-border rounded-2xl p-8 text-center space-y-4"
          >
            <Package className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">No orders yet</h2>
            <p className="text-sm text-muted-foreground">
              You haven't placed any orders. Start shopping!
            </p>
            <Link to="/">
              <Button>Shop Now</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div
                data-ocid={`account.item.${idx + 1}`}
                key={order.id.toString()}
                className="bg-card border border-border rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-bold font-mono">
                      {formatOrderId(Number(order.orderNumber))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(Number(order.createdAt))}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
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
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.productName} ({item.size}) x
                        {item.quantity.toString()}
                      </span>
                      <span>₹{(Number(item.price) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span>₹{(Number(order.totalAmount) / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            to="/track-order"
            className="text-sm text-primary hover:underline"
          >
            Track an order by Order ID
          </Link>
        </div>
      </div>
    </div>
  );
}
