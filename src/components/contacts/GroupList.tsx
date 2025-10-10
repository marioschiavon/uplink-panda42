import { useState } from "react";
import { Users, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Group, groupsApi } from "@/api/groups";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface GroupListProps {
  groups: Group[];
  isLoading: boolean;
  sessionName: string;
  onUpdate: () => void;
}

export function GroupList({ groups, isLoading, sessionName, onUpdate }: GroupListProps) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [action, setAction] = useState<"add" | "remove" | null>(null);
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddParticipant = async () => {
    if (!selectedGroup || !phone.trim()) return;

    setIsProcessing(true);
    try {
      await groupsApi.addParticipant({
        session: sessionName,
        groupId: selectedGroup.id,
        participantPhone: phone
      });
      toast({
        title: "Participante adicionado",
        description: `${phone} foi adicionado ao grupo`,
      });
      setSelectedGroup(null);
      setPhone("");
      setAction(null);
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o participante",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveParticipant = async () => {
    if (!selectedGroup || !phone.trim()) return;

    setIsProcessing(true);
    try {
      await groupsApi.removeParticipant({
        session: sessionName,
        groupId: selectedGroup.id,
        participantPhone: phone
      });
      toast({
        title: "Participante removido",
        description: `${phone} foi removido do grupo`,
      });
      setSelectedGroup(null);
      setPhone("");
      setAction(null);
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o participante",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    <Users className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{group.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mt-1">
                      {group.participants.length} participantes
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedGroup(group);
                    setAction("add");
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedGroup(group);
                    setAction("remove");
                  }}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedGroup && !!action}
        onOpenChange={() => {
          setSelectedGroup(null);
          setAction(null);
          setPhone("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "add" ? "Adicionar participante" : "Remover participante"}
            </DialogTitle>
            <DialogDescription>
              {action === "add"
                ? `Adicionar um novo participante ao grupo ${selectedGroup?.name}`
                : `Remover um participante do grupo ${selectedGroup?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="5511999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedGroup(null);
                setAction(null);
                setPhone("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={action === "add" ? handleAddParticipant : handleRemoveParticipant}
              disabled={isProcessing || !phone.trim()}
            >
              {isProcessing ? "Processando..." : action === "add" ? "Adicionar" : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
