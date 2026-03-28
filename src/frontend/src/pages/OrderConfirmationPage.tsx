import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "../components/ui/button";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const searchParams = new URLSearchParams(routerState.location.search);
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-6xl">✓</div>
      <h1 className="text-3xl font-bold">Order Confirmed!</h1>
      <p className="text-muted-foreground max-w-md">
        Thank you for your purchase.
        {orderId
          ? ` Your order #${orderId} has been placed successfully.`
          : " Your order has been placed successfully."}{" "}
        We will verify your payment and process your order shortly.
      </p>
      <Button onClick={() => navigate({ to: "/" })}>Continue Shopping</Button>
    </div>
  );
}
