import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useActor } from "../../hooks/useActor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AdminSettings() {
  const { actor } = useActor();
  const [upiId, setUpiId] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: isConfigured } = useQuery({
    queryKey: ["payment-configured"],
    queryFn: () => actor!.isPaymentConfigured(),
    enabled: !!actor,
  });

  useQuery({
    queryKey: ["upi-id-admin"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = await (actor as any).getUpiId();
      if (id) setUpiId(id);
      return id;
    },
    enabled: !!actor,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).setUpiId(upiId);
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">UPI Payment</h2>
        <p className="text-sm text-muted-foreground">
          Status:{" "}
          {isConfigured ? (
            <span className="text-green-600 font-medium">Configured ✓</span>
          ) : (
            <span className="text-yellow-600 font-medium">Not configured</span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label>UPI ID</Label>
          <Input
            type="text"
            data-ocid="settings.input"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter your UPI ID (e.g. name@upi, name@okaxis, name@paytm).
            Customers will scan a QR code to pay you directly.
          </p>
        </div>
        <Button
          data-ocid="settings.save_button"
          onClick={() => saveMutation.mutate()}
          disabled={!upiId || saveMutation.isPending}
        >
          {saved
            ? "Saved!"
            : saveMutation.isPending
              ? "Saving..."
              : "Save Configuration"}
        </Button>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-2">
          How to accept UPI payments
        </h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>
            Find your UPI ID in Google Pay, PhonePe, Paytm, or any UPI app
          </li>
          <li>
            It usually looks like <strong>yourname@okaxis</strong> or{" "}
            <strong>phonenumber@upi</strong>
          </li>
          <li>Paste it above and click Save</li>
          <li>
            Customers will see a QR code on checkout and can scan to pay
            directly to you
          </li>
          <li>
            After payment, customers enter their Transaction ID so you can
            verify
          </li>
        </ol>
      </div>
    </div>
  );
}
