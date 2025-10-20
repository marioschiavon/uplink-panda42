import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, QrCode, AlertCircle, Eye, EyeOff, Copy, RotateCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { sessionsApi } from "@/api/sessions";
import { organizationApi } from "@/api/organization";
import { useSessionsStore } from "@/store/sessions";
import { useWppSocket } from "@/hooks/useWppSocket";
import { Input } from "@/components/ui/input";

const SESSION_NAME = "default"; // Single session por organização

export default function Sessions() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [apiToken, setApiToken] = useState<string>("");
  const [showToken, setShowToken] = useState(false);
  const [rotating, setRotating] = useState(false);
  const { toast } = useToast();
  
  const session = useSessionsStore((state) => state.sessions[SESSION_NAME]);
  const initSession = useSessionsStore((state) => state.initSession);

  // Connect socket
  useWppSocket({ sessionId: SESSION_NAME, autoConnect: true });

  // Load session and API token on mount
  useEffect(() => {
    loadSession();
    loadApiToken();
  }, []);

  const loadApiToken = async () => {
    try {
      const token = await organizationApi.getApiToken();
      setApiToken(token);
    } catch (error) {
      console.error("Erro ao carregar API token:", error);
    }
  };

  const loadSession = async () => {
    setLoading(true);
    try {
      const data = await sessionsApi.list();
      
      if (data.sessions && data.sessions.length > 0) {
        // Já existe sessão
        const existingSession = data.sessions[0];
        initSession(SESSION_NAME);
        
        // Atualiza status no store
        useSessionsStore.getState().updateSessionStatus(
          SESSION_NAME, 
          existingSession.status as any
        );
        
        if (existingSession.qr) {
          useSessionsStore.getState().updateSessionQr(SESSION_NAME, existingSession.qr);
        }
      } else {
        // Não existe sessão, inicializa vazia
        initSession(SESSION_NAME);
      }
    } catch (error) {
      console.error("Erro ao carregar sessão:", error);
      initSession(SESSION_NAME);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    setCreating(true);
    try {
      const result = await sessionsApi.create(SESSION_NAME);
      
      if (result.ok) {
        toast({
          title: "Sessão criada",
          description: "Aguarde a geração do QR Code...",
        });
        
        // Atualiza estado
        initSession(SESSION_NAME);
        useSessionsStore.getState().updateSessionStatus(SESSION_NAME, 'connecting');
        
        // Recarrega para pegar status atualizado
        setTimeout(() => loadSession(), 2000);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar sessão",
        description: error.response?.data?.error || "Não foi possível iniciar a sessão.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleReconnect = async () => {
    await handleCreateSession();
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    toast({
      title: "Token copiado",
      description: "O token foi copiado para a área de transferência.",
    });
  };

  const handleRotateToken = async () => {
    setRotating(true);
    try {
      const result = await organizationApi.rotateApiToken();
      setApiToken(result.api_token);
      toast({
        title: "Token rotacionado",
        description: "Um novo token foi gerado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao rotacionar token",
        description: error.response?.data?.error || "Não foi possível rotacionar o token.",
        variant: "destructive",
      });
    } finally {
      setRotating(false);
    }
  };

  const maskToken = (token: string) => {
    if (!token) return "";
    return "•".repeat(token.length);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'qr-ready': return 'text-yellow-500';
      case 'connecting':
      case 'starting': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'qr-ready': return 'QR Pronto';
      case 'connecting': return 'Conectando...';
      case 'starting': return 'Iniciando...';
      default: return 'Desconectado';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'qr-ready':
        return <QrCode className="h-6 w-6 text-yellow-500" />;
      case 'connecting':
      case 'starting':
        return <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessão WhatsApp</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie sua conexão com o WhatsApp
          </p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = session?.status || 'disconnected';
  const qr = session?.qr;
  const hasSession = status !== 'disconnected';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sessão WhatsApp</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie sua conexão com o WhatsApp
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon(status)}
              Status da Conexão
            </CardTitle>
            <CardDescription className={getStatusColor(status)}>
              {getStatusLabel(status)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <span className="text-sm font-medium">Estado:</span>
              <span className={`text-sm font-bold ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>

            <div className="space-y-2">
              {!hasSession ? (
                <Button
                  onClick={handleCreateSession}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Criando Sessão...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Criar Sessão
                    </>
                  )}
                </Button>
              ) : status === 'connected' ? (
                <Button
                  onClick={loadSession}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar Status
                </Button>
              ) : (
                <Button
                  onClick={handleReconnect}
                  disabled={creating || status === 'connecting' || status === 'starting'}
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${(creating || status === 'connecting' || status === 'starting') ? 'animate-spin' : ''}`} />
                  Reconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
            <CardDescription>
              Escaneie com seu WhatsApp para conectar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px]">
            {qr ? (
              <div className="rounded-lg border-4 border-primary/20 p-4 bg-white">
                <img
                  src={`data:image/png;base64,${qr}`}
                  alt="QR Code"
                  className="h-56 w-56"
                />
              </div>
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                <p className="text-center text-sm text-muted-foreground px-4">
                  {status === 'connecting' || status === 'starting'
                    ? 'Gerando QR Code...'
                    : status === 'connected'
                    ? 'Conectado ✓'
                    : 'Crie uma sessão para gerar o QR Code'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Como conectar</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              {hasSession ? "Aguarde a geração do QR Code" : "Clique em 'Criar Sessão'"}
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              Abra o WhatsApp no seu celular
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              Vá em Configurações → Aparelhos conectados
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">4.</span>
              Escaneie o QR Code que aparecerá acima
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">5.</span>
              Aguarde a confirmação de conexão
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* API Token Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Token de API
          </CardTitle>
          <CardDescription>
            Use este token para integrar com a API da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Seu Token</label>
            <div className="flex gap-2">
              <Input
                value={showToken ? apiToken : maskToken(apiToken)}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowToken(!showToken)}
                title={showToken ? "Ocultar token" : "Mostrar token"}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyToken}
                title="Copiar token"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Rotacionar Token</p>
            <p className="text-sm text-muted-foreground">
              Gere um novo token de API. O token anterior será invalidado imediatamente.
            </p>
            <Button
              variant="destructive"
              onClick={handleRotateToken}
              disabled={rotating}
              className="w-full"
            >
              {rotating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rotacionando...
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Rotacionar Token
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              <strong>⚠️ Atenção:</strong> Mantenha seu token seguro. Não o compartilhe publicamente ou o exponha em código frontend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
