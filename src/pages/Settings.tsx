import { useState, useEffect } from "react";
import { Save, Server, Check, X, Copy, Download, Upload, Palette, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getConfig, setConfig } from "@/utils/storage";
import { WppConfig } from "@/types";
import { api } from "@/lib/axios";

interface AppSettings {
  appName: string;
  appLogo: string;
  theme: "light" | "dark" | "system";
}

export default function Settings() {
  const [config, setConfigState] = useState<WppConfig>({
    baseURL: "",
    sessionName: "",
  });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appName: import.meta.env.VITE_APP_NAME || "WPPConnect",
    appLogo: "",
    theme: "dark",
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  const webhookUrl = config.baseURL ? `${config.baseURL}/webhook` : "Configure a URL base primeiro";

  useEffect(() => {
    const savedConfig = getConfig();
    setConfigState(savedConfig);

    // Load app settings from localStorage
    const savedAppSettings = localStorage.getItem("appSettings");
    if (savedAppSettings) {
      setAppSettings(JSON.parse(savedAppSettings));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!config.baseURL.trim() || !config.sessionName.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setConfig(config);
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso!",
    });
  };

  const handleTestConnection = async () => {
    if (!config.baseURL.trim()) {
      toast({
        title: "URL não configurada",
        description: "Configure a URL base antes de testar a conexão.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus("idle");

    try {
      const response = await fetch(`${config.baseURL}/api/health`);
      const data = await response.json();

      if (response.ok && data.status === 'ok') {
        setConnectionStatus("success");
        toast({
          title: "Conexão bem-sucedida",
          description: "O servidor está respondendo corretamente!",
        });
      } else {
        setConnectionStatus("error");
        toast({
          title: "Erro na conexão",
          description: "O servidor não está respondendo corretamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus("error");
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "A URL do webhook foi copiada para a área de transferência.",
    });
  };

  const handleSaveAppSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(appSettings));
    toast({
      title: "Configurações salvas",
      description: "As personalizações foram salvas com sucesso!",
    });
  };

  const handleExportSettings = () => {
    const settings = {
      config,
      appSettings,
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wppconnect-settings.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Configurações exportadas",
      description: "Arquivo JSON baixado com sucesso!",
    });
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const settings = JSON.parse(event.target?.result as string);
        if (settings.config) {
          setConfigState(settings.config);
          setConfig(settings.config);
        }
        if (settings.appSettings) {
          setAppSettings(settings.appSettings);
          localStorage.setItem("appSettings", JSON.stringify(settings.appSettings));
        }
        toast({
          title: "Configurações importadas",
          description: "As configurações foram restauradas com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro ao importar",
          description: "Arquivo JSON inválido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Configure a conexão com o WPPConnect e personalize o painel
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api">API WPPConnect</TabsTrigger>
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
        </TabsList>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Configurações da API
              </CardTitle>
              <CardDescription>
                Configure a URL base e o nome da sessão do WPPConnect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="baseURL">URL Base da API</Label>
                  <Input
                    id="baseURL"
                    type="url"
                    placeholder="http://localhost:21465"
                    value={config.baseURL}
                    onChange={(e) =>
                      setConfigState({ ...config, baseURL: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Exemplo: http://localhost:21465 ou https://api.seuservidor.com
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionName">Nome da Sessão</Label>
                  <Input
                    id="sessionName"
                    type="text"
                    placeholder="default"
                    value={config.sessionName}
                    onChange={(e) =>
                      setConfigState({ ...config, sessionName: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Nome da sessão configurada no WPPConnect
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="flex-1"
                  >
                    {isTestingConnection ? (
                      <>Testando...</>
                    ) : (
                      <>
                        <Server className="mr-2 h-4 w-4" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>

                {connectionStatus !== "idle" && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    connectionStatus === "success" 
                      ? "bg-green-500/10 text-green-500" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {connectionStatus === "success" ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span>Conexão OK - Servidor respondendo</span>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5" />
                        <span>Erro - Não foi possível conectar</span>
                      </>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Variáveis de Ambiente</CardTitle>
              <CardDescription>
                Valores configurados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>VITE_APP_NAME</Label>
                <div className="flex items-center gap-2">
                  <Input value={import.meta.env.VITE_APP_NAME || "WPPConnect"} readOnly />
                  <Badge variant="secondary">Painel</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>VITE_SUPABASE_URL</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={import.meta.env.VITE_SUPABASE_URL || "Não configurado"} 
                    readOnly 
                    type="password"
                  />
                  <Badge variant="secondary">Backend</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>VITE_SUPABASE_PUBLISHABLE_KEY</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "••••••••••••••••" : "Não configurado"} 
                    readOnly 
                    type="password"
                  />
                  <Badge variant="secondary">Backend</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhook URL */}
          <Card>
            <CardHeader>
              <CardTitle>URL do Webhook</CardTitle>
              <CardDescription>
                Use esta URL para receber notificações de eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={webhookUrl} readOnly />
                <Button variant="outline" size="icon" onClick={handleCopyWebhook}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Configure este webhook no seu sistema para receber eventos do WhatsApp
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
              <CardDescription>
                Detalhes sobre a configuração do WPPConnect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • As configurações são salvas localmente no seu navegador
              </p>
              <p>
                • Certifique-se de que o servidor WPPConnect está rodando na URL configurada
              </p>
              <p>
                • O nome da sessão deve corresponder ao configurado no servidor
              </p>
              <p>
                • Use "Testar Conexão" para verificar se o servidor está acessível
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Personalization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalização
              </CardTitle>
              <CardDescription>
                Customize a aparência do painel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName">Nome da Aplicação</Label>
                <Input
                  id="appName"
                  value={appSettings.appName}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, appName: e.target.value })
                  }
                  placeholder="WPPConnect"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appLogo">URL do Logo</Label>
                <Input
                  id="appLogo"
                  value={appSettings.appLogo}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, appLogo: e.target.value })
                  }
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <select
                  id="theme"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={appSettings.theme}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, theme: e.target.value as "light" | "dark" | "system" })
                  }
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>

              <Button onClick={handleSaveAppSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Personalização
              </Button>
            </CardContent>
          </Card>

          {/* Export/Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Backup de Configurações
              </CardTitle>
              <CardDescription>
                Exporte ou importe suas configurações em formato JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={handleExportSettings} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Configurações
                </Button>

                <Button variant="outline" className="flex-1" asChild>
                  <label htmlFor="import-settings" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Configurações
                  </label>
                </Button>
                <input
                  id="import-settings"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportSettings}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                O arquivo JSON contém todas as suas configurações e pode ser usado para restaurar o sistema em outra máquina.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
