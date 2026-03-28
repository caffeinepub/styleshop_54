import { useQuery } from "@tanstack/react-query";
import { useActor } from "../../hooks/useActor";

export default function AdminCustomers() {
  const { actor } = useActor();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => actor!.getAllCustomers(),
    enabled: !!actor,
  });

  if (isLoading)
    return <div className="text-muted-foreground">Loading customers...</div>;
  if (customers.length === 0)
    return <div className="text-muted-foreground">No customers yet.</div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {customers.length} unique customers
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Name</th>
              <th className="text-left py-2 pr-4">Email</th>
              <th className="text-left py-2 pr-4">Phone</th>
              <th className="text-left py-2">Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.email}
                className="border-b hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 pr-4 font-medium">{c.name}</td>
                <td className="py-3 pr-4">{c.email}</td>
                <td className="py-3 pr-4">{c.phone}</td>
                <td className="py-3 text-sm">
                  {c.street}, {c.city}, {c.state} {c.zip}, {c.country}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
