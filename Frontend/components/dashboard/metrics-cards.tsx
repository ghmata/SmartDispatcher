"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle, Smartphone, TrendingUp } from "lucide-react";

interface MetricsCardsProps {
  totalSent: number;
  deliveryRate: number;
  chipsConnected: number;
  chipsTotal: number;
  comparisons?: {
    total_sent: number;
    delivery_rate: number;
    connections: number;
  };
}

export function MetricsCards({
  totalSent,
  deliveryRate,
  chipsConnected,
  chipsTotal,
  comparisons,
}: MetricsCardsProps) {
  const getTrend = (val: number) => {
    const sign = val >= 0 ? "+" : "";
    return `${sign}${val}%`;
  };

  const metrics = [
    {
      title: "Total Enviado Hoje",
      value: totalSent.toLocaleString("pt-BR"),
      icon: Send,
      trend: getTrend(comparisons?.total_sent ?? 0),
      trendUp: (comparisons?.total_sent ?? 0) >= 0,
    },
    {
      title: "Taxa de Entrega",
      value: `${deliveryRate}%`,
      icon: CheckCircle,
      trend: getTrend(comparisons?.delivery_rate ?? 0),
      trendUp: (comparisons?.delivery_rate ?? 0) >= 0,
    },
    {
      title: "Chips Conectados",
      value: `${chipsConnected} de ${chipsTotal}`,
      icon: Smartphone,
      trend: chipsConnected === chipsTotal ? "100%" : (chipsTotal > 0 ? `${Math.round((chipsConnected / chipsTotal) * 100)}%` : "0%"), 
      // User asked for "comparativos em % com o dia anterior -> funcional" inside the cards.
      // The 3rd card in screenshot says "Chips Conectados / 1 de 1 / +100% vs ontem".
      // So I should use the comparison logic here too if available, OR keep the capacity logic + comparison?
      // The current code used capacity as "trend" (100% capacity).
      // But the screenshot showed "+100% vs ontem".
      // I will prioritize "vs Yesterday" to align with the user request.
      trend: getTrend(comparisons?.connections ?? 0),
      trendUp: (comparisons?.connections ?? 0) >= 0,
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
