"use client";

import { useState, useEffect } from "react";
import { SocketProvider } from "@/lib/socket-context";
import { Sidebar } from "@/components/sidebar";
import { StatusBar } from "@/components/status-bar";
import { DashboardView } from "@/components/views/dashboard-view";
import { ConnectionsView } from "@/components/views/connections-view";
import { CampaignView } from "@/components/views/campaign-view";
import { SettingsView } from "@/components/views/settings-view";
import { getStatus } from "@/lib/api";

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState("dashboard");
  const [queueData, setQueueData] = useState({ current: 0, total: 0 });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    async function loadQueue() {
      try {
        const status = await getStatus();
        if (isMounted) {
            setQueueData({
                current: status.queue_current,
                total: status.queue_total,
            });
        }
        // Success: 10s refresh
        if (isMounted) timeoutId = setTimeout(loadQueue, 10000);
      } catch (error: any) {
        console.error("[App] Queue Poll Error:", error.message); // Silent to UI, log to console
        // Error: 30s backoff
        if (isMounted) timeoutId = setTimeout(loadQueue, 30000);
      }
    }

    loadQueue();
    
    return () => {
        isMounted = false;
        clearTimeout(timeoutId);
    };
  }, []);

  const renderView = () => {
    switch (currentRoute) {
      case "dashboard":
        return <DashboardView />;
      case "connections":
        return <ConnectionsView />;
      case "campaign":
        return <CampaignView onRouteChange={setCurrentRoute} />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentRoute={currentRoute} onRouteChange={setCurrentRoute} />

      <div className="lg:pl-64">
        <StatusBar
          queueCurrent={queueData.current}
          queueTotal={queueData.total}
        />

        <main className="p-6">{renderView()}</main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}
