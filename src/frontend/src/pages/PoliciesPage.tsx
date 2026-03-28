import { Link } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";

const sections = [
  {
    title: "Shipping Policy",
    content:
      "We deliver all across India in 5-8 business days via standard courier. Shipping is free on all orders with no minimum order required. Once your order is dispatched, you will receive a tracking number in your order status page so you can monitor your delivery. We partner with reliable courier services to ensure your items arrive safely.",
  },
  {
    title: "Return & Refund Policy",
    content:
      "We accept returns within 7 days of delivery for unused items in their original condition with original tags intact. To initiate a return, contact us via WhatsApp or email with your Order ID and reason. Refunds are processed within 5-7 business days to your original UPI payment method after we receive and inspect the returned item. Damaged or used items will not be accepted for return.",
  },
  {
    title: "Privacy Policy",
    content:
      "We collect your name, phone number, email, and delivery address solely to process and fulfill your orders. Your personal data is never sold, rented, or shared with third parties beyond what is required for order fulfillment such as courier services. Your contact information may be used to send order updates and resolve any delivery issues.",
  },
  {
    title: "Terms & Conditions",
    content:
      "By placing an order on ZEEEP, you agree to provide accurate personal and delivery information. All prices displayed are in Indian Rupees (INR) and are inclusive of applicable taxes. ZEEEP reserves the right to cancel any order in the event of payment discrepancy or product unavailability. In such cases, a full refund will be issued. We reserve the right to update these terms at any time.",
  },
];

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
        <div className="flex items-center gap-3 mb-10">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Policies</h1>
            <p className="text-muted-foreground text-sm">
              ZEEEP | Men's Fashion Store
            </p>
          </div>
        </div>
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold mb-3">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-muted/50 border border-border rounded-2xl p-6 text-sm text-center space-y-2">
          <p className="font-semibold">Have questions or concerns?</p>
          <p className="text-muted-foreground">
            WhatsApp us at{" "}
            <a
              href="https://wa.me/919769447954"
              className="text-primary font-medium hover:underline"
            >
              9769447954
            </a>{" "}
            or email{" "}
            <a
              href="mailto:abhishekrathi0710@gmail.com"
              className="text-primary font-medium hover:underline"
            >
              abhishekrathi0710@gmail.com
            </a>
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
