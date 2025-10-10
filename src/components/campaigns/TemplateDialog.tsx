import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTemplate, updateTemplate, extractVariables, Template } from "@/api/templates";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template;
  onSuccess: () => void;
}

export function TemplateDialog({ open, onOpenChange, template, onSuccess }: TemplateDialogProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setMessage(template.message);
      setVariables(template.variables);
    } else {
      setName("");
      setMessage("");
      setVariables([]);
    }
  }, [template, open]);

  useEffect(() => {
    setVariables(extractVariables(message));
  }, [message]);

  const handleSave = async () => {
    if (!name.trim() || !message.trim()) {
      toast({ title: "Erro", description: "Nome e mensagem são obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (template) {
        await updateTemplate(template.id, { name, message, variables });
        toast({ title: "Sucesso", description: "Template atualizado com sucesso" });
      } else {
        await createTemplate({ name, message, variables });
        toast({ title: "Sucesso", description: "Template criado com sucesso" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar template", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{template ? "Editar Template" : "Novo Template"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mensagem de Boas-vindas"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Olá {{name}}, bem-vindo!"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Use {'{{variavel}}'} para inserir variáveis na mensagem
            </p>
          </div>
          {variables.length > 0 && (
            <div className="space-y-2">
              <Label>Variáveis detectadas</Label>
              <div className="flex flex-wrap gap-2">
                {variables.map((v) => (
                  <Badge key={v} variant="secondary">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
