import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, QrCode } from "lucide-react";
import { useState } from "react";
import type { OrderType } from "../backend";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";

function formatPrice(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}

type Step = "form" | "payment" | "txn";

interface FormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
}

export default function CheckoutPage() {
  const { actor, isFetching } = useActor();
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txn1, setTxn1] = useState("");
  const [txn2, setTxn2] = useState("");
  const [showTxn2, setShowTxn2] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    notes: "",
  });

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const { data: upiId, isLoading: upiLoading } = useQuery<string>({
    queryKey: ["upi-id"],
    queryFn: async () => {
      if (!actor) return "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getUpiId();
    },
    enabled: !!actor && !isFetching && step === "payment",
  });

  const qrUrl = upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(upiId)}%26pn%3DZEEEP%26cu%3DINR`
    : "";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handleConfirmOrder = async () => {
    if (!actor || !txn1.trim()) return;
    setLoading(true);
    setError("");
    try {
      const txnId = txn2.trim()
        ? `${txn1.trim()} | ${txn2.trim()}`
        : txn1.trim();
      const order: OrderType = {
        id: BigInt(0),
        orderNumber: BigInt(0),
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        shippingStreet: form.street,
        shippingCity: form.city,
        shippingState: form.state,
        shippingZip: form.zip,
        shippingCountry: form.country,
        orderNotes: form.notes,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: BigInt(i.quantity),
          price: i.product.price,
          size: i.selectedSize,
        })),
        totalAmount: BigInt(totalAmount),
        status: "Pending",
        stripePaymentIntentId: txnId,
        createdAt: BigInt(Date.now()),
      };
      const orderId = await actor.createOrder(order);
      clearCart();
      navigate({
        to: "/order-confirmation",
        search: { orderId: orderId.toString() },
      });
    } catch {
      setError("Failed to save order. Please try again.");
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "form") navigate({ to: "/" });
    else if (step === "payment") setStep("form");
    else setStep("payment");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button onClick={() => navigate({ to: "/" })}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-muted-foreground hover:text-foreground mb-6 block"
        >
          ←{" "}
          {step === "form"
            ? "Back to shop"
            : step === "payment"
              ? "Back to order details"
              : "Back to payment"}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {(["form", "payment", "txn"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="h-px w-8 bg-border" />}
              <div
                className={`flex items-center gap-1.5 font-medium ${
                  step === s ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step === s ? "bg-foreground text-background" : "bg-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="hidden sm:inline">
                  {s === "form"
                    ? "Details"
                    : s === "payment"
                      ? "Pay"
                      : "Confirm"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {step === "form" && (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <h1 className="text-2xl font-bold mb-6">Order Details</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      data-ocid="checkout.input"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Rahul Sharma"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      data-ocid="checkout.input"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="rahul@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone / Mobile *</Label>
                    <Input
                      id="phone"
                      data-ocid="checkout.input"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    data-ocid="checkout.input"
                    required
                    value={form.street}
                    onChange={(e) => update("street", e.target.value)}
                    placeholder="123, MG Road"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      data-ocid="checkout.input"
                      required
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      data-ocid="checkout.input"
                      required
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      placeholder="MH"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">PIN Code *</Label>
                    <Input
                      id="zip"
                      data-ocid="checkout.input"
                      required
                      value={form.zip}
                      onChange={(e) => update("zip", e.target.value)}
                      placeholder="400001"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    data-ocid="checkout.input"
                    required
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="India"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    data-ocid="checkout.textarea"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Any special instructions..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  data-ocid="checkout.primary_button"
                  className="w-full"
                  size="lg"
                >
                  Proceed to Payment →
                </Button>
              </form>
            )}

            {step === "payment" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Pay via UPI</h1>

                {/* Amount banner */}
                <div className="bg-foreground text-background rounded-xl px-6 py-4 text-center">
                  <p className="text-sm opacity-70 mb-1">Amount to Pay</p>
                  <p className="text-4xl font-bold tracking-tight">
                    {formatPrice(totalAmount)}
                  </p>
                </div>

                {upiLoading ? (
                  <div
                    className="flex items-center justify-center py-12"
                    data-ocid="payment.loading_state"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !upiId ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="payment.error_state"
                  >
                    <QrCode className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>
                      Payment not set up yet. Please contact the store owner.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="border-4 border-foreground rounded-2xl p-2 bg-white shadow-lg">
                      <img
                        src={qrUrl}
                        alt="UPI QR Code"
                        width={220}
                        height={220}
                        className="block"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Or pay using UPI ID
                      </p>
                      <p className="font-mono font-semibold text-lg bg-muted px-4 py-2 rounded-lg select-all">
                        {upiId}
                      </p>
                    </div>
                  </div>
                )}

                {/* Warning note */}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-amber-900">
                  <p className="font-semibold mb-1">⚠️ Important</p>
                  <p className="text-sm leading-relaxed">
                    Please pay exactly{" "}
                    <strong>{formatPrice(totalAmount)}</strong>. If you
                    accidentally paid the wrong amount, pay the remaining
                    balance and add both Transaction IDs below.
                  </p>
                </div>

                <Button
                  data-ocid="payment.primary_button"
                  className="w-full"
                  size="lg"
                  onClick={() => setStep("txn")}
                  disabled={!upiId}
                >
                  I Have Paid ✓
                </Button>
              </div>
            )}

            {step === "txn" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Enter Transaction ID(s)</h1>
                <p className="text-muted-foreground text-sm">
                  You can find the Transaction ID in your UPI app (Google Pay /
                  PhonePe / Paytm) after successful payment.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="txn1">Transaction ID 1 *</Label>
                    <Input
                      id="txn1"
                      data-ocid="txn.input"
                      required
                      value={txn1}
                      onChange={(e) => setTxn1(e.target.value)}
                      placeholder="e.g. 123456789012"
                      className="font-mono"
                    />
                  </div>

                  {showTxn2 ? (
                    <div>
                      <Label htmlFor="txn2">
                        Transaction ID 2 (if you made two payments)
                      </Label>
                      <Input
                        id="txn2"
                        data-ocid="txn.input"
                        value={txn2}
                        onChange={(e) => setTxn2(e.target.value)}
                        placeholder="e.g. 987654321098"
                        className="font-mono"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      data-ocid="txn.secondary_button"
                      onClick={() => setShowTxn2(true)}
                      className="flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      <Plus className="h-4 w-4" />
                      Add second Transaction ID
                    </button>
                  )}
                </div>

                {error && (
                  <p
                    className="text-destructive text-sm"
                    data-ocid="txn.error_state"
                  >
                    {error}
                  </p>
                )}

                <Button
                  data-ocid="txn.submit_button"
                  className="w-full"
                  size="lg"
                  disabled={!txn1.trim() || loading}
                  onClick={handleConfirmOrder}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing
                      Order...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Your order will be confirmed once we verify the payment.
                </p>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:w-80">
            <div className="bg-card border border-border rounded-xl p-5 sticky top-6">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="truncate mr-2">
                      {item.product.name} × {item.quantity}
                      <span className="text-muted-foreground ml-1">
                        (Size: {item.selectedSize})
                      </span>
                    </span>
                    <span className="font-medium shrink-0">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
