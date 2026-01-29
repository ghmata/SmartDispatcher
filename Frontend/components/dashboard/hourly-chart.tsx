"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { HourlyData } from "@/lib/api";

interface HourlyChartProps {
  data: HourlyData[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Envios por Hora (Últimas 24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(145, 70%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(145, 70%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(0, 0%, 20%)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                stroke="hsl(0, 0%, 45%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(0, 0%, 45%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 10%)",
                  border: "1px solid hsl(0, 0%, 22%)",
                  borderRadius: "8px",
                  color: "hsl(0, 0%, 95%)",
                }}
                labelStyle={{ color: "hsl(0, 0%, 60%)" }}
                formatter={(value: number) => [`${value} envios`, "Enviados"]}
              />
              <Area
                type="monotone"
                dataKey="sent"
                stroke="hsl(145, 70%, 45%)"
                strokeWidth={2}
                fill="url(#colorSent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
