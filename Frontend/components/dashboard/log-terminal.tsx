"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/socket-context";
import { Terminal, Trash2 } from "lucide-react";

export function LogTerminal() {
  const { logs, clearLogs } = useSocket();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: "success" | "error" | "info") => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-medium text-foreground">
            Terminal de Logs
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearLogs}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Limpar</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div
          ref={terminalRef}
          className="h-[280px] overflow-y-auto rounded-lg bg-black/80 p-4 custom-scrollbar"
        >
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="font-mono text-sm text-muted-foreground">
                Aguardando logs...
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`font-mono text-sm ${getLogColor(log.type)}`}
                >
                  <span className="text-muted-foreground">[{log.timestamp}]</span>{" "}
                  <span className="text-yellow-400">[{log.chipId}]</span>{" "}
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
