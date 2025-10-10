import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { groupsApi } from "@/api/groups";

interface CreateGroupDialogProps {
  sessionName: string;
  onGroupCreated: () => void;
}

export function CreateGroupDialog({ sessionName, onGroupCreated }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [participants, setParticipants] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim() || !participants.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome do grupo e adicione participantes",
        variant: "destructive",
      });
      return;
    }

    const participantList = participants
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (participantList.length === 0) {
      toast({
        title: "Participantes necessários",
        description: "Adicione pelo menos um participante",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await groupsApi.create({
        session: sessionName,
        name: groupName,
        participants: participantList,
      });
      toast({
        title: "Grupo criado",
        description: `Grupo "${groupName}" criado com sucesso`,
      });
      setOpen(false);
      setGroupName("");
      setParticipants("");
      onGroupCreated();
    } catch (error) {
      toast({
        title: "Erro ao criar grupo",
        description: "Não foi possível criar o grupo",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Grupo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo grupo</DialogTitle>
          <DialogDescription>
            Crie um novo grupo do WhatsApp com participantes selecionados
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Nome do grupo</Label>
            <Input
              id="groupName"
              placeholder="Meu Grupo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="participants">Participantes</Label>
            <Textarea
              id="participants"
              placeholder="5511999999999, 5511888888888"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Separe os números por vírgula (,)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Criando..." : "Criar Grupo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
