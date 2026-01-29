"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepUpload } from "@/components/campaign/step-upload";
import { StepMessage } from "@/components/campaign/step-message";
import { StepConfig } from "@/components/campaign/step-config";
import { StepLaunch } from "@/components/campaign/step-launch";
import { startCampaign } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Upload,
  MessageSquare,
  Settings,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

const steps = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "Mensagem", icon: MessageSquare },
  { id: 3, label: "Configuração", icon: Settings },
  { id: 4, label: "Disparo", icon: Rocket },
];

interface CampaignViewProps {
  onRouteChange: (route: string) => void;
}

export function CampaignView({ onRouteChange }: CampaignViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [message, setMessage] = useState("");
  const [delayMin, setDelayMin] = useState(15);
  const [delayMax, setDelayMax] = useState(45);
  const [launching, setLaunching] = useState(false);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return file !== null;
      case 2:
        return message.trim().length > 0;
      case 3:
        return delayMin < delayMax;
      default:
        return true;
    }
  };

  const handleLaunch = async () => {
    if (!file) return;

    setLaunching(true);
    try {
      await startCampaign({
        file,
        message,
        delayMin,
        delayMax,
      });

      // Redirect to dashboard after successful launch
      onRouteChange("dashboard");
    } catch (error) {
      console.error("[v0] Error starting campaign:", error);
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Nova Campanha</h2>
        <p className="text-sm text-muted-foreground">
          Configure e inicie uma nova campanha de mensagens.
        </p>
      </div>

      {/* Step Indicator */}
      <Card className="border-border bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "flex items-center gap-2 transition-all duration-200",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                          ? "text-green-400"
                          : "text-muted-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                        isCurrent
                          ? "border-primary bg-primary/20"
                          : isCompleted
                            ? "border-green-500 bg-green-500/20"
                            : "border-border bg-secondary"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="hidden sm:inline font-medium text-sm">
                      {step.label}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-4 transition-all duration-200",
                        currentStep > step.id ? "bg-green-500" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border-border bg-card/50">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <StepUpload
              file={file}
              onFileChange={setFile}
              previewData={previewData}
              onPreviewChange={setPreviewData}
            />
          )}
          {currentStep === 2 && (
            <StepMessage message={message} onMessageChange={setMessage} />
          )}
          {currentStep === 3 && (
            <StepConfig
              delayMin={delayMin}
              delayMax={delayMax}
              onDelayMinChange={setDelayMin}
              onDelayMaxChange={setDelayMax}
            />
          )}
          {currentStep === 4 && (
            <StepLaunch
              file={file}
              message={message}
              delayMin={delayMin}
              delayMax={delayMax}
              onLaunch={handleLaunch}
              launching={launching}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
            disabled={!canProceed()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Próximo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
