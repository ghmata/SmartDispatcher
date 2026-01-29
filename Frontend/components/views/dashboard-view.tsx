"use client";

import { useEffect, useState } from "react";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { LogTerminal } from "@/components/dashboard/log-terminal";
import { getStatus, getHourlyData, getSessions, type HourlyData, type SystemStatus } from "@/lib/api";

export function DashboardView() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [connectedChips, setConnectedChips] = useState({ connected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [statusData, hourly, sessions] = await Promise.all([
        getStatus(),
        getHourlyData(),
        getSessions(),
      ]);

      setStatus(statusData);
      setHourlyData(hourly);
      setConnectedChips({
        connected: sessions.filter(
          (s) => s.status === "READY" || s.status === "ONLINE"
        ).length,
        total: sessions.length,
      });
      setError(null); // Clear error on success
    } catch (err: any) {
      console.error("[Dashboard] Fetch Error:", err.message);
      setError(err.message || "Falha ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const loop = async () => {
      if (!isMounted) return;
      
      await fetchDashboardData();
      
      // Smart Polling: 
      // If success -> fast refresh (5s)
      // If error -> slow backoff (20s) to avoid spamming
      const delay = error ? 20000 : 5000;
      if (isMounted) timeoutId = setTimeout(loop, delay);
    };

    loop();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array = one loop instance

  // Show Error Banner at top if offline, but keep showing stale data if available
  const errorBanner = error ? (
      <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 flex items-center justify-between">
          <span>⚠️ {error} - Tentando reconectar...</span>
      </div>
  ) : null;

  if (loading && !status) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground animate-pulse">Conectando ao Backend...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Visão geral do sistema de automação
        </p>
      </div>

      {errorBanner}

      <MetricsCards
        totalSent={status?.total_sent ?? 0}
        deliveryRate={status?.delivery_rate ?? 0}
        chipsConnected={connectedChips.connected}
        chipsTotal={connectedChips.total}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <HourlyChart data={hourlyData} />
        <LogTerminal />
      </div>
    </div>
  );
}
