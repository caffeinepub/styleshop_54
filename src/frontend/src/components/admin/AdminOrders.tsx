import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useActor } from "../../hooks/useActor";
import { formatOrderId } from "../../utils/orderId";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Rejected"];

function formatPrice(paise: bigint) {
  return `₹${(Number(paise) / 100).toFixed(2)}`;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts)).toLocaleDateString("en-IN");
}

function statusBadge(status: string) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Confirmed":
      return "bg-blue-100 text-blue-800";
    case "Shipped":
      return "bg-purple-100 text-purple-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function AdminOrders() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>(
    {},
  );

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => actor!.getAllOrders(),
    enabled: !!actor,
  });

  // Sort: Pending first, then newest first
  const orders = [...rawOrders].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    return Number(b.createdAt) - Number(a.createdAt);
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      actor!.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const updateTracking = useMutation({
    mutationFn: ({ id, tracking }: { id: bigint; tracking: string }) =>
      actor!.updateOrderTracking(id, tracking),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  function handleTrackingBlur(orderId: bigint, value: string) {
    updateTracking.mutate({ id: orderId, tracking: value });
  }

  if (isLoading)
    return <div className="text-muted-foreground">Loading orders...</div>;
  if (orders.length === 0)
    return (
      <div data-ocid="admin.empty_state" className="text-muted-foreground">
        No orders yet.
      </div>
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {orders.length} total orders
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Order ID</th>
              <th className="text-left py-2 pr-4">Date</th>
              <th className="text-left py-2 pr-4">Customer</th>
              <th className="text-left py-2 pr-4">Phone</th>
              <th className="text-left py-2 pr-4">Items</th>
              <th className="text-left py-2 pr-4">Total</th>
              <th className="text-left py-2 pr-4">UPI Txn ID</th>
              <th className="text-left py-2 pr-4">Address</th>
              <th className="text-left py-2 pr-4">Tracking</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const idKey = order.id.toString();
              const showTracking =
                order.status === "Shipped" || order.status === "Delivered";
              const orderNum = Number(order.orderNumber);
              const friendlyId = formatOrderId(orderNum);
              return (
                <tr
                  key={idKey}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 pr-4 font-mono">
                    <span className="font-semibold">{friendlyId}</span>
                    <span className="text-muted-foreground text-xs ml-1">
                      (#{orderNum})
                    </span>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-muted-foreground text-xs">
                      {order.customerEmail}
                    </div>
                  </td>
                  <td className="py-3 pr-4">{order.customerPhone}</td>
                  <td className="py-3 pr-4">
                    <div className="max-w-[200px]">
                      {order.items.map((item) => (
                        <div
                          key={`${item.productId}-${item.size}`}
                          className="text-xs"
                        >
                          {item.productName} x{item.quantity.toString()} (
                          {item.size})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-semibold">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="text-xs font-mono max-w-[140px] break-all text-muted-foreground">
                      {order.stripePaymentIntentId || (
                        <span className="italic">Not provided</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="text-xs max-w-[160px]">
                      <div>{order.shippingStreet}</div>
                      <div>
                        {order.shippingCity}, {order.shippingState}{" "}
                        {order.shippingZip}
                      </div>
                      <div>{order.shippingCountry}</div>
                      {order.orderNotes && (
                        <div className="text-muted-foreground mt-1 italic">
                          {order.orderNotes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {showTracking ? (
                      <Input
                        className="h-8 w-32 text-xs"
                        placeholder="Tracking #"
                        value={
                          trackingInputs[idKey] ?? order.trackingNumber ?? ""
                        }
                        onChange={(e) =>
                          setTrackingInputs((prev) => ({
                            ...prev,
                            [idKey]: e.target.value,
                          }))
                        }
                        onBlur={(e) =>
                          handleTrackingBlur(order.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleTrackingBlur(
                              order.id,
                              (e.target as HTMLInputElement).value,
                            );
                        }}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    <Select
                      value={order.status}
                      onValueChange={(val) =>
                        updateStatus.mutate({ id: order.id, status: val })
                      }
                    >
                      <SelectTrigger
                        className={`w-32 h-8 text-xs ${statusBadge(order.status)}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
