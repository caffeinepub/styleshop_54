import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "../../hooks/useActor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function formatPrice(cents: bigint) {
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts)).toLocaleDateString();
}

export default function AdminOrders() {
  const { actor } = useActor();
  const qc = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => actor!.getAllOrders(),
    enabled: !!actor,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      actor!.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  if (isLoading)
    return <div className="text-muted-foreground">Loading orders...</div>;
  if (orders.length === 0)
    return <div className="text-muted-foreground">No orders yet.</div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {orders.length} total orders
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Order #</th>
              <th className="text-left py-2 pr-4">Date</th>
              <th className="text-left py-2 pr-4">Customer</th>
              <th className="text-left py-2 pr-4">Phone</th>
              <th className="text-left py-2 pr-4">Items</th>
              <th className="text-left py-2 pr-4">Total</th>
              <th className="text-left py-2 pr-4">Address</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id.toString()}
                className="border-b hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 pr-4 font-mono">
                  #{order.orderNumber.toString()}
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
                        {item.productName} × {item.quantity.toString()} (
                        {item.size})
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4 font-semibold">
                  {formatPrice(order.totalAmount)}
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
                <td className="py-3">
                  <Select
                    value={order.status}
                    onValueChange={(val) =>
                      updateStatus.mutate({ id: order.id, status: val })
                    }
                  >
                    <SelectTrigger className="w-32 h-8">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
