import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCampaign, createCampaignItems } from "@/api/campaigns";
import { Template } from "@/api/templates";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import Papa from "papaparse";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  sessions: string[];
  onSuccess: () => void;
}

export function CampaignDialog({ open, onOpenChange, templates, sessions, onSuccess }: CampaignDialogProps) {
  const [name, setName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [rateLimit, setRateLimit] = useState("1");
  const [csvData, setCsvData] = useState<Array<{ phone: string; message: string }>>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as Array<Record<string, string>>;
        const items = data
          .filter((row) => row.to && row.message)
          .map((row) => ({
            phone: row.to,
            message: row.message,
          }));
        
        if (items.length === 0) {
          toast({ title: "Erro", description: "CSV deve conter colunas 'to' e 'message'", variant: "destructive" });
          return;
        }
        
        setCsvData(items);
        toast({ title: "Sucesso", description: `${items.length} mensagens carregadas` });
      },
      error: () => {
        toast({ title: "Erro", description: "Falha ao ler arquivo CSV", variant: "destructive" });
      },
    });
  };

  const handleCreate = async () => {
    if (!name.trim() || !sessionName || csvData.length === 0) {
      toast({ title: "Erro", description: "Preencha todos os campos e faça upload do CSV", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const campaign = await createCampaign({
        name,
        session_name: sessionName,
        template_id: templateId || undefined,
        rate_limit: parseInt(rateLimit),
      });

      const items = csvData.map((item) => ({
        campaign_id: campaign.id,
        phone: item.phone,
        message: item.message,
      }));

      await createCampaignItems(items);

      toast({ title: "Sucesso", description: "Campanha criada com sucesso" });
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao criar campanha", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSessionName("");
    setTemplateId("");
    setRateLimit("1");
    setCsvData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Campanha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Nome da Campanha</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Campanha de Lançamento"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session">Sessão WhatsApp</Label>
            <Select value={sessionName} onValueChange={setSessionName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sessão" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session} value={session}>
                    {session}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Template (opcional)</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate-limit">Rate Limit (msgs/segundo)</Label>
            <Input
              id="rate-limit"
              type="number"
              min="1"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Upload CSV (colunas: to, message)</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {csvData.length > 0 ? `${csvData.length} mensagens carregadas` : "Selecionar arquivo"}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Criando..." : "Criar Campanha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
