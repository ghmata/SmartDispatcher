"use client";

import { useSocket } from "@/lib/socket-context";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, WifiOff } from "lucide-react";

interface StatusBarProps {
  queueCurrent: number;
  queueTotal: number;
}

export function StatusBar({ queueCurrent, queueTotal }: StatusBarProps) {
  const { isConnected } = useSocket();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground lg:hidden ml-12">
          Smart Dispatcher
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Queue Status */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Fila de Envio:</span>
          <span className="text-sm font-medium text-foreground">
            {queueCurrent} / {queueTotal}
          </span>
        </div>

        {/* Connection Status */}
        <Badge
          variant={isConnected ? "default" : "destructive"}
          className={
            isConnected
              ? "bg-success/20 text-success hover:bg-success/30 border-success/30"
              : "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/30"
          }
        >
          {isConnected ? (
            <>
              <Wifi className="mr-1.5 h-3 w-3" />
              Sistema Online
            </>
          ) : (
            <>
              <WifiOff className="mr-1.5 h-3 w-3" />
              Offline
            </>
          )}
        </Badge>
      </div>
    </header>
  );
}
