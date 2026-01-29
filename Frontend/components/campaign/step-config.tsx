"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Clock, Timer } from "lucide-react";

interface StepConfigProps {
  delayMin: number;
  delayMax: number;
  onDelayMinChange: (value: number) => void;
  onDelayMaxChange: (value: number) => void;
}

export function StepConfig({
  delayMin,
  delayMax,
  onDelayMinChange,
  onDelayMaxChange,
}: StepConfigProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Configurações de Envio
        </h3>
        <p className="text-sm text-muted-foreground">
          Ajuste os intervalos entre os envios para uma campanha mais natural.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Delay Mínimo */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Delay Mínimo</p>
                <p className="text-sm text-muted-foreground">
                  Intervalo mínimo entre envios
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Slider
                value={[delayMin]}
                onValueChange={([value]) => onDelayMinChange(value)}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">5s</span>
                <span className="text-xl font-bold text-primary">
                  {delayMin}s
                </span>
                <span className="text-muted-foreground">60s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delay Máximo */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Delay Máximo</p>
                <p className="text-sm text-muted-foreground">
                  Intervalo máximo entre envios
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Slider
                value={[delayMax]}
                onValueChange={([value]) => onDelayMaxChange(value)}
                min={10}
                max={120}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">10s</span>
                <span className="text-xl font-bold text-primary">
                  {delayMax}s
                </span>
                <span className="text-muted-foreground">120s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-foreground mb-2">
            Resumo da Configuração
          </p>
          <p className="text-sm text-muted-foreground">
            Os envios serão realizados com um intervalo aleatório entre{" "}
            <span className="text-primary font-medium">{delayMin} segundos</span>{" "}
            e{" "}
            <span className="text-primary font-medium">{delayMax} segundos</span>.
            Isso ajuda a evitar bloqueios e torna os envios mais naturais.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
