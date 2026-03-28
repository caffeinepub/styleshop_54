import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CheckCircle2, Mail, MessageCircle, Package } from "lucide-react";
import { Button } from "../components/ui/button";
import { formatOrderId } from "../utils/orderId";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const searchParams = new URLSearchParams(routerState.location.search);
  const orderId = searchParams.get("orderId");
  const displayId = orderId ? formatOrderId(Number(orderId)) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6 py-12">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-5">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground text-sm">
            Thank you for shopping at ZEEEP. We will verify your payment within
            2-4 hours.
          </p>
        </div>
        {displayId && (
          <div
            data-ocid="order_confirmation.panel"
            className="bg-primary/10 border-2 border-primary rounded-2xl p-6"
          >
            <p className="text-sm font-medium text-primary mb-1">
              Your Order ID
            </p>
            <p className="text-4xl font-bold font-mono text-primary">
              {displayId}
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Save this Order ID — you'll need it to track your order or contact
              support.
            </p>
          </div>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 text-left">
          <p className="font-semibold mb-1">Payment Verification in Progress</p>
          <p>
            Your order status is currently <strong>Pending</strong>. Once we
            match your UPI transaction ID, your order will be confirmed within
            2-4 hours.
          </p>
        </div>
        <Link
          to="/track-order"
          data-ocid="order_confirmation.link"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Package className="h-4 w-4" />
          Track My Order
        </Link>
        <div className="border border-border rounded-xl p-4 text-sm text-left space-y-2">
          <p className="font-semibold text-muted-foreground">Need Help?</p>
          <a
            href="https://wa.me/919769447954"
            className="flex items-center gap-2 hover:text-primary"
          >
            <MessageCircle className="h-4 w-4 text-green-500" />
            WhatsApp: 9769447954
          </a>
          <a
            href="mailto:abhishekrathi0710@gmail.com"
            className="flex items-center gap-2 hover:text-primary"
          >
            <Mail className="h-4 w-4 text-blue-500" />
            abhishekrathi0710@gmail.com
          </a>
        </div>
        <Button
          data-ocid="order_confirmation.primary_button"
          onClick={() => navigate({ to: "/" })}
          className="w-full"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
