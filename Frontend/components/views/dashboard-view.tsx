"use client";

import { useEffect, useState, useRef } from "react";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { LogTerminal } from "@/components/dashboard/log-terminal";
import { getStatus, getHourlyData, getSessions, type HourlyData, type SystemStatus } from "@/lib/api";
import { useSocket } from "@/lib/socket-context"; // Import Socket

export function DashboardView() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [connectedChips, setConnectedChips] = useState({ connected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket(); // Get socket instance
  const processedMetricsIds = useRef<Set<string>>(new Set()); // Track locally to avoid double counting
  
  // ROBUST SYNC STATE
  const [lastSeq, setLastSeq] = useState<number>(0);
  const [statsDate, setStatsDate] = useState<string>("");

  const fetchDashboardData = async () => {
    try {
      const [statusData, hourly, sessions] = await Promise.all([
        getStatus(),
        getHourlyData(),
        getSessions(),
      ]);

      // --- SMART MERGE LOGIC (POLLING) ---
      // Goal: Prevent stale API data from overwriting newer Socket data
      
      const apiSeq = (statusData as any).stats_seq || 0;
      const apiDate = (statusData as any).stats_date || "";

      setStatus((prev) => {
          // If no previous state, accept API
          if (!prev) {
              setLastSeq(apiSeq);
              setStatsDate(apiDate);
              return statusData;
          }

          // Case 1: Day Reset (API date is different/newer)
          if (apiDate !== statsDate && apiDate > statsDate) {
               console.log("[Dashboard] Day Reset detected. Accepting API.");
               setLastSeq(apiSeq);
               setStatsDate(apiDate);
               processedMetricsIds.current.clear(); // Clear dedupe for new day
               return statusData;
          }

          // Case 2: Stale Data (API seq <= current seq)
          // We trust our local state (socket) more than the disk reading
          if (apiSeq < lastSeq) {
              console.warn(`[Dashboard] Ignoring Stale Polling. Current Seq: ${lastSeq}, API Seq: ${apiSeq}`);
              return prev; // Keep current state
          }
          
          // Case 3: Valid Update or Sync
          // We use Math.max for total_sent to prevent ANY temporary regression even if seq matches
          // (Sequence might match but total_sent could differ if logic drifted, safe guard)
          setLastSeq(apiSeq);
          
          return {
              ...statusData,
              total_sent: Math.max(prev.total_sent, statusData.total_sent)
          };
      });

      // Same protection for Hourly (optional but good consistency)
      // Since hourly is harder to merge (array), we assume if Status is accepted, Hourly is too.
      // But we only update if we accepted the status (Case 1 or 3)
      if (apiSeq >= lastSeq || (apiDate !== statsDate && apiDate > statsDate)) {
         setHourlyData(hourly);
      }

      setConnectedChips({
        connected: sessions.filter(
          (s) => {
            const status = s.status?.toUpperCase();
            return ["READY", "ONLINE", "IDLE", "SENDING", "COOLDOWN"].includes(status || "");
          }
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

  // Real-time updates for Metrics
  useEffect(() => {
      if (!socket) return;
      
          const handleMessageStatus = (payload: any) => {
          // DEBUG: Trace why metrics might not update
          console.log(`[Dashboard] Status Event: ID=${payload.clientMessageId} Status=${payload.status}`);

          // If message is SENT (Success)
          // We optimistically update the counter to match the log speed
          // DELIVERED does NOT increment total_sent (avoid double count), only feeds delivery rate via polling/calc
          if (payload.status === "SENT") {
              const { clientMessageId, stats_seq } = payload;
              
              // Deduplication
              if (processedMetricsIds.current.has(clientMessageId)) {
                  console.log(`[Dashboard] ID ${clientMessageId} already processed. Skipping count.`);
                  return;
              }
              
              console.log(`[Dashboard] Counting Success: ${clientMessageId} Seq: ${stats_seq}`);
              processedMetricsIds.current.add(clientMessageId);

              // Update Sequence if provided
              if (stats_seq) {
                  setLastSeq(prev => Math.max(prev, stats_seq));
              } else {
                  // Fallback if backend implementation lags: just increment 1
                  setLastSeq(prev => prev + 1);
              }

              // Update Total Sent
              setStatus((prev) => {
                  if (!prev) return prev;
                  return {
                      ...prev,
                      total_sent: prev.total_sent + 1
                  };
              });
              
              // NEW: Update Hourly Chart Real-time
              const now = new Date();
              const hourKey = `${String(now.getHours()).padStart(2, '0')}:00`;
              
              setHourlyData(prev => {
                  const newData = [...prev];
                  const idx = newData.findIndex(h => h.hour === hourKey);
                  
                  if (idx >= 0) {
                       // Increment existing bar
                      newData[idx] = { ...newData[idx], sent: newData[idx].sent + 1 };
                  } else {
                       // Create new bar (e.g. new hour started)
                      newData.push({ hour: hourKey, sent: 1 });
                  }
                  return newData;
              });
          }
      };
      
      const handleCampaignFinish = () => {
          // Force a hard refresh when campaign ends to ensure accuracy
          fetchDashboardData();
          processedMetricsIds.current.clear();
      };
      
      const handleCampaignStart = () => {
          // processedMetricsIds.current.clear(); // REMOVED: Keep dedup to avoid double counting late events
      };

      socket.on("message_status", handleMessageStatus);
      socket.on("campaign_finished", handleCampaignFinish);
      socket.on("campaign_started", handleCampaignStart);

      return () => {
          socket.off("message_status", handleMessageStatus);
          socket.off("campaign_finished", handleCampaignFinish);
          socket.off("campaign_started", handleCampaignStart);
      };
  }, [socket]); // Add dep on sync state to ensure closure freshness? Actually setStatus(prev) handles it.
  // Warning: adding lastSeq to dep array might cause re-bind of listener. 
  // Better to use ref for logic or trust setState(prev). 
  // setState(prev) is sufficient, so we keep deps efficient.
  // Actually, we refer to statsDate in setStatus inside fetch, but fetch is outside.
  // handleMessageStatus logic is safe with setStatus(prev).


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
      
      {!socket?.connected && !loading && (
        <div className="mb-4 rounded-md bg-destructive/90 p-3 text-sm text-white font-bold flex items-center justify-center animate-pulse shadow-md">
            <span>🔌 Conexão perdida com o servidor. Tentando reconectar...</span>
        </div>
      )}

      <MetricsCards
        totalSent={status?.total_sent ?? 0}
        deliveryRate={status?.delivery_rate ?? 0}
        chipsConnected={connectedChips.connected}
        chipsTotal={connectedChips.total}
        comparisons={status?.comparisons}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <HourlyChart data={hourlyData} />
        <LogTerminal />
      </div>
      {/* Build Info for Debugging */}
      <div className="text-[10px] text-gray-400 text-center mt-4">
          Build: {process.env.BUILD_TIMESTAMP || 'Dev Mode'} | 
          Status Seq: {lastSeq}
      </div>
    </div>
  );
}
