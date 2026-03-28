import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import AdminCustomers from "../components/admin/AdminCustomers";
import AdminOrders from "../components/admin/AdminOrders";
import AdminProducts from "../components/admin/AdminProducts";
import AdminSettings from "../components/admin/AdminSettings";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { storeSessionParameter } from "../utils/urlParams";

export default function AdminPage() {
  const { actor } = useActor();
  const { login, identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [tokenInput, setTokenInput] = useState("");
  const [backupCodeInput, setBackupCodeInput] = useState("");
  const [claimError, setClaimError] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !!identity,
  });

  const claimAdmin = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      storeSessionParameter("caffeineAdminToken", tokenInput);
      await actor._initializeAccessControlWithSecret(tokenInput);
    },
    onSuccess: () => {
      setClaimError("");
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
    onError: () => {
      setClaimError(
        "Invalid token. Check your Caffeine project settings and try again.",
      );
    },
  });

  const claimAdminBackup = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const success = await actor.claimAdminWithBackupCode(backupCodeInput);
      if (!success) throw new Error("Invalid backup code");
    },
    onSuccess: () => {
      setClaimError("");
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
    onError: () => {
      setClaimError("Invalid backup code. Please check and try again.");
    },
  });

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Login with Internet Identity to access the admin panel.
        </p>
        <Button onClick={login}>Login with Internet Identity</Button>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold">Claim Admin Access</h1>

        {!useBackupCode ? (
          <>
            <p className="text-muted-foreground text-center max-w-sm">
              Enter the Admin Token from your Caffeine project settings to claim
              admin access.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <Input
                type="password"
                placeholder="Paste your admin token here"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
              {claimError && (
                <p className="text-sm text-destructive">{claimError}</p>
              )}
              <Button
                onClick={() => claimAdmin.mutate()}
                disabled={!tokenInput || claimAdmin.isPending}
              >
                {claimAdmin.isPending ? "Claiming..." : "Claim Admin Access"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUseBackupCode(true);
                  setClaimError("");
                }}
              >
                Use backup code instead
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-center max-w-sm">
              Enter the backup code to claim admin access.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <Input
                type="password"
                placeholder="Enter backup code"
                value={backupCodeInput}
                onChange={(e) => setBackupCodeInput(e.target.value)}
              />
              {claimError && (
                <p className="text-sm text-destructive">{claimError}</p>
              )}
              <Button
                onClick={() => claimAdminBackup.mutate()}
                disabled={!backupCodeInput || claimAdminBackup.isPending}
              >
                {claimAdminBackup.isPending
                  ? "Claiming..."
                  : "Claim with Backup Code"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUseBackupCode(false);
                  setClaimError("");
                }}
              >
                Use admin token instead
              </Button>
            </div>
          </>
        )}

        <Button variant="outline" onClick={clear}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">ZEEEP Admin</h1>
          <Button variant="outline" size="sm" onClick={clear}>
            Logout
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>
          <TabsContent value="customers">
            <AdminCustomers />
          </TabsContent>
          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
