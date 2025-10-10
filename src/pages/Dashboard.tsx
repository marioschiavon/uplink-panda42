import { useState } from "react";
import { CheckCircle2, XCircle, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { wppApi } from "@/api/wppconnect";
import { useWppSocket } from "@/hooks/useWppSocket";
import { useSessionsStore } from "@/store/sessions";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Initialize socket connection
  const { sessionId } = useWppSocket({ sessionId: 'default', autoConnect: true });
  
  // Get session state from Zustand
  const session = useSessionsStore((state) => state.sessions[sessionId]);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      await wppApi.startSession();
      toast({
        title: "Sessão iniciada",
        description: "Aguarde a geração do QR Code...",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a sessão",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie sua conexão com o WhatsApp
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {session?.status === 'connected' ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Status da Conexão
            </CardTitle>
            <CardDescription>
              {session?.status === 'connected' ? "Conectado ao WhatsApp" : "Desconectado"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <span className="text-sm font-medium">Estado:</span>
              <span
                className={`text-sm font-bold ${
                  session?.status === 'connected' ? "text-primary" : "text-destructive"
                }`}
              >
                {session?.status === 'connected' ? "Online" : session?.status === 'qr-ready' ? 'QR Pronto' : session?.status === 'connecting' ? 'Conectando...' : 'Offline'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleStartSession}
                disabled={loading || session?.status === 'connected'}
                className="flex-1"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Iniciar Sessão
              </Button>
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
          <CardContent className="flex items-center justify-center">
            {session?.qr ? (
              <div className="rounded-lg border-4 border-primary/20 p-4 bg-white">
                <img
                  src={`data:image/png;base64,${session.qr}`}
                  alt="QR Code"
                  className="h-48 w-48"
                />
              </div>
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                <p className="text-center text-sm text-muted-foreground">
                  {session?.status === 'connecting' ? 'Gerando QR Code...' : 'Nenhum QR Code disponível'}
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
              Clique em "Iniciar Sessão" acima
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
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
