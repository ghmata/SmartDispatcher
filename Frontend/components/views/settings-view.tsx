"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Bell,
  Shield,
  Save,
  CheckCircle,
  Globe,
} from "lucide-react";

export function SettingsView() {
  const [apiUrl, setApiUrl] = useState("http://localhost:3001");
  const [notifications, setNotifications] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie as configurações do sistema.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Server Settings */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Conexão com Servidor</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url">URL da API</Label>
              <div className="flex gap-2">
                <Input
                  id="api-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:3001"
                  className="bg-secondary/50 border-border"
                />
                <Badge
                  variant="outline"
                  className="bg-green-500/20 text-green-400 border-green-500/30 whitespace-nowrap"
                >
                  Conectado
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Endereço do servidor backend Node.js
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="socket-url">WebSocket URL</Label>
              <Input
                id="socket-url"
                value={apiUrl.replace("http", "ws")}
                disabled
                className="bg-secondary/30 border-border"
              />
              <p className="text-xs text-muted-foreground">
                Conexão Socket.io para eventos em tempo real
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Notificações</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações do Sistema</Label>
                <p className="text-xs text-muted-foreground">
                  Receba alertas sobre envios e conexões
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Avançado</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reconexão Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Reconectar chips automaticamente ao perder conexão
                </p>
              </div>
              <Switch checked={autoReconnect} onCheckedChange={setAutoReconnect} />
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Sobre o Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versão</span>
                <span className="text-foreground font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frontend</span>
                <span className="text-foreground font-medium">React + Next.js</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend</span>
                <span className="text-foreground font-medium">Node.js</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {saved ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Salvo com Sucesso!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
