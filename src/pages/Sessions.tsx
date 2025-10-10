import { useState, useEffect } from "react";
import { Plus, RefreshCw, XCircle, Copy, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { sessionsApi } from "@/api/sessions";
import { useSessionsStore } from "@/store/sessions";
import { useWppSocket } from "@/hooks/useWppSocket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Sessions() {
  const [loading, setLoading] = useState(true);
  const [sessionList, setSessionList] = useState<string[]>([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const sessions = useSessionsStore((state) => state.sessions);
  const initSession = useSessionsStore((state) => state.initSession);
  const clearSession = useSessionsStore((state) => state.clearSession);

  // Load sessions list on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionsApi.list();
      const names = data.map(s => s.name);
      setSessionList(names);
      
      // Initialize sessions in store
      names.forEach(name => {
        if (!sessions[name]) {
          initSession(name);
        }
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar sessões",
        description: "Não foi possível listar as sessões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast({
        title: "Nome inválido",
        description: "Digite um nome para a sessão.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sessionsApi.start(newSessionName);
      initSession(newSessionName);
      setSessionList([...sessionList, newSessionName]);
      setNewSessionName("");
      setDialogOpen(false);
      
      toast({
        title: "Sessão criada",
        description: `Sessão "${newSessionName}" foi iniciada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao criar sessão",
        description: "Não foi possível iniciar a sessão.",
        variant: "destructive",
      });
    }
  };

  const handleCloseSession = async (sessionName: string) => {
    try {
      await sessionsApi.close(sessionName);
      clearSession(sessionName);
      setSessionList(sessionList.filter(s => s !== sessionName));
      
      toast({
        title: "Sessão encerrada",
        description: `Sessão "${sessionName}" foi encerrada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao encerrar sessão",
        description: "Não foi possível encerrar a sessão.",
        variant: "destructive",
      });
    }
  };

  const handleCopyId = (sessionName: string) => {
    navigator.clipboard.writeText(sessionName);
    toast({
      title: "ID copiado",
      description: `ID "${sessionName}" copiado para área de transferência.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'qr-ready': return 'text-yellow-500';
      case 'connecting': return 'text-blue-500';
      default: return 'text-destructive';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'qr-ready': return 'QR Pronto';
      case 'connecting': return 'Conectando...';
      default: return 'Desconectado';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessões</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas sessões do WhatsApp
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Sessão</DialogTitle>
              <DialogDescription>
                Digite um nome único para a nova sessão do WhatsApp.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="session-name">Nome da Sessão</Label>
                <Input
                  id="session-name"
                  placeholder="ex: session-01"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSession}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessionList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma sessão encontrada</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Clique em "Nova Sessão" para começar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessionList.map((sessionName) => (
            <SessionCard
              key={sessionName}
              sessionName={sessionName}
              session={sessions[sessionName]}
              onReload={loadSessions}
              onClose={() => handleCloseSession(sessionName)}
              onCopyId={() => handleCopyId(sessionName)}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SessionCardProps {
  sessionName: string;
  session: any;
  onReload: () => void;
  onClose: () => void;
  onCopyId: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

function SessionCard({
  sessionName,
  session,
  onReload,
  onClose,
  onCopyId,
  getStatusColor,
  getStatusLabel,
}: SessionCardProps) {
  // Connect socket for this session
  useWppSocket({ sessionId: sessionName, autoConnect: true });

  const status = session?.status || 'disconnected';
  const qr = session?.qr;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{sessionName}</span>
          {status === 'connected' ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className={`h-5 w-5 ${getStatusColor(status)} flex-shrink-0`} />
          )}
        </CardTitle>
        <CardDescription className={getStatusColor(status)}>
          {getStatusLabel(status)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex items-center justify-center">
          {qr ? (
            <div className="rounded-lg border-4 border-primary/20 p-2 bg-white">
              <img
                src={`data:image/png;base64,${qr}`}
                alt="QR Code"
                className="h-40 w-40"
              />
            </div>
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
              <p className="text-center text-xs text-muted-foreground px-2">
                {status === 'connecting' ? 'Gerando QR...' : 'Sem QR Code'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReload}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyId}
            className="text-xs"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            <XCircle className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
