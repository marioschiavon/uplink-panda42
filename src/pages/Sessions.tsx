"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Loader2, RefreshCw, QrCode, Link2, Power } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SessionsPage() {
  const { toast } = useToast();

  const [status, setStatus] = useState<string>("desconectado");
  const [apiToken, setApiToken] = useState<string>("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionName, setSessionName] = useState<string>("session_default");

  const WPP_BASE_URL = "https://wpp.panda42.com.br/api";

  /** Carrega status atual da sessão */
  const loadSessionStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${WPP_BASE_URL}/${sessionName}/status-session`);
      const data = await res.json();

      if (data?.connected) {
        setStatus("conectado");
        setQrCode(null);
      } else if (data?.qrcode) {
        setStatus("aguardando conexão");
        setQrCode(data.qrcode);
      } else {
        setStatus("desconectado");
      }

      if (data?.apikey) {
        setApiToken(data.apikey);
      }
    } catch (error) {
      console.error("Erro ao carregar status:", error);
      setStatus("erro");
    } finally {
      setLoading(false);
    }
  };

  /** Inicia sessão (ou reconecta) */
  const handleStartSession = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${WPP_BASE_URL}/${sessionName}/start-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data?.qrcode) {
        setQrCode(data.qrcode);
        setStatus("aguardando conexão");
      } else {
        toast({
          title: "Sessão iniciada",
          description: "Verificando status...",
        });
        loadSessionStatus();
      }
    } catch (error) {
      console.error("Erro ao iniciar sessão:", error);
      toast({
        title: "Erro ao iniciar sessão",
        description: "Verifique o servidor WPPConnect.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /** Rotacionar token */
  const handleRotateToken = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${WPP_BASE_URL}/${sessionName}/refresh-token`, {
        method: "POST",
      });

      const data = await res.json();
      if (data?.apikey) {
        setApiToken(data.apikey);
        toast({
          title: "Novo token gerado",
          description: "API Key atualizada com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível gerar novo token.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao rotacionar token:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Copiar token */
  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    toast({
      title: "Copiado!",
      description: "API Key copiada para a área de transferência.",
    });
  };

  useEffect(() => {
    loadSessionStatus();
    const interval = setInterval(loadSessionStatus, 8000); // atualiza a cada 8s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="border-primary shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Link2 size={20} /> Sessão WhatsApp
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              Status:{" "}
              <span
                className={`${
                  status === "conectado"
                    ? "text-green-600"
                    : status === "aguardando conexão"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </p>

            <Button
              onClick={handleStartSession}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {status === "conectado" ? "Reconectar" : "Iniciar sessão"}
            </Button>
          </div>

          {qrCode && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <QrCode className="w-6 h-6 text-primary" />
              <img
                src={qrCode}
                alt="QR Code"
                className="w-64 h-64 border rounded-lg"
              />
              <p className="text-sm text-gray-500 text-center">
                Escaneie este QR code com o WhatsApp para conectar.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-medium text-sm text-gray-700">
              API Key
            </label>
            <div className="flex gap-2">
              <Input readOnly value={apiToken || "—"} />
              <Button
                onClick={handleCopyToken}
                variant="outline"
                size="icon"
                disabled={!apiToken}
              >
                <Copy size={16} />
              </Button>
              <Button
                onClick={handleRotateToken}
                variant="outline"
                size="icon"
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use este token nas suas integrações com a API.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
