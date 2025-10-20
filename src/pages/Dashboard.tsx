import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, QrCode, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWppSocket } from "@/hooks/useWppSocket";
import { useSessionsStore } from "@/store/sessions";
import { Badge } from "@/components/ui/badge";

const SESSION_NAME = "default";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Initialize socket connection
  useWppSocket({ sessionId: SESSION_NAME, autoConnect: true });
  
  // Get session state from Zustand
  const session = useSessionsStore((state) => state.sessions[SESSION_NAME]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Online
          </Badge>
        );
      case 'qr-ready':
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            <QrCode className="mr-1 h-3 w-3" />
            QR Pronto
          </Badge>
        );
      case 'connecting':
      case 'starting':
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            Conectando
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <XCircle className="mr-1 h-3 w-3" />
            Offline
          </Badge>
        );
    }
  };

  const handleNavigateToSession = () => {
    navigate('/sessions');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Session Status Card - Clicável */}
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={handleNavigateToSession}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              WhatsApp
              {getStatusBadge(session?.status)}
            </CardTitle>
            <CardDescription>
              Clique para gerenciar a sessão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              {session?.status === 'connected' ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : session?.status === 'qr-ready' ? (
                <QrCode className="h-16 w-16 text-yellow-500" />
              ) : (
                <XCircle className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder para outras métricas futuras */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>Mensagens</CardTitle>
            <CardDescription>Em breve</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <span className="text-4xl font-bold text-muted-foreground">-</span>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>Contatos</CardTitle>
            <CardDescription>Em breve</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <span className="text-4xl font-bold text-muted-foreground">-</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
