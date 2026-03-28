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

  // Contact info state
  const [whatsapp, setWhatsapp] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [contactSaved, setContactSaved] = useState(false);

  const { data: isConfigured } = useQuery({
    queryKey: ["payment-configured"],
    queryFn: () => actor!.isPaymentConfigured(),
    enabled: !!actor,
  });

  useQuery({
    queryKey: ["upi-id-admin"],
    queryFn: async () => {
      const id = await actor!.getUpiId();
      if (id) setUpiId(id);
      return id;
    },
    enabled: !!actor,
  });

  useQuery({
    queryKey: ["contact-info-admin"],
    queryFn: async () => {
      const info = await (actor!.getContactInfo() as Promise<{
        whatsapp: string;
        email: string;
      }>);
      if (info) {
        if (info.whatsapp) setWhatsapp(info.whatsapp);
        if (info.email) setSupportEmail(info.email);
      }
      return info;
    },
    enabled: !!actor,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await actor!.setUpiId(upiId);
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const saveContactMutation = useMutation({
    mutationFn: async () => {
      await (actor!.setContactInfo(whatsapp, supportEmail) as Promise<void>);
    },
    onSuccess: () => {
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2000);
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

      {/* Support Contact Info Section */}
      <div className="border-t pt-5">
        <h2 className="text-lg font-semibold mb-1">Support Contact Info</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These details will be shown to customers on the payment page so they
          can reach you for any payment/order issues.
        </p>
        <div className="space-y-3">
          <div>
            <Label>WhatsApp Number</Label>
            <Input
              type="text"
              data-ocid="settings.input"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="9769447954"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your WhatsApp number (without +91, e.g. 9769447954).
            </p>
          </div>
          <div>
            <Label>Support Email</Label>
            <Input
              type="email"
              data-ocid="settings.input"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button
            data-ocid="settings.save_button"
            onClick={() => saveContactMutation.mutate()}
            disabled={
              !whatsapp || !supportEmail || saveContactMutation.isPending
            }
          >
            {contactSaved
              ? "Saved!"
              : saveContactMutation.isPending
                ? "Saving..."
                : "Save Contact Info"}
          </Button>
        </div>
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
