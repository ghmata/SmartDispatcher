"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle, Smartphone, TrendingUp } from "lucide-react";

interface MetricsCardsProps {
  totalSent: number;
  deliveryRate: number;
  chipsConnected: number;
  chipsTotal: number;
}

export function MetricsCards({
  totalSent,
  deliveryRate,
  chipsConnected,
  chipsTotal,
}: MetricsCardsProps) {
  const metrics = [
    {
      title: "Total Enviado Hoje",
      value: totalSent.toLocaleString("pt-BR"),
      icon: Send,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Taxa de Entrega",
      value: `${deliveryRate}%`,
      icon: CheckCircle,
      trend: "+2.3%",
      trendUp: true,
    },
    {
      title: "Chips Conectados",
      value: `${chipsConnected} de ${chipsTotal}`,
      icon: Smartphone,
      trend: chipsConnected === chipsTotal ? "100%" : `${Math.round((chipsConnected / chipsTotal) * 100)}%`,
      trendUp: chipsConnected === chipsTotal,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card
            key={metric.title}
            className="border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:border-border/80"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <TrendingUp
                  className={`h-4 w-4 ${
                    metric.trendUp ? "text-success" : "text-destructive"
                  }`}
                />
                <span
                  className={`text-sm ${
                    metric.trendUp ? "text-success" : "text-destructive"
                  }`}
                >
                  {metric.trend}
                </span>
                <span className="text-sm text-muted-foreground">vs ontem</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
