import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Campaign } from "@/api/campaigns";
import { Play, Pause, Trash2, Download } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

export function CampaignCard({ campaign, onStart, onPause, onDelete, onExport }: CampaignCardProps) {
  const progress = campaign.total_items > 0 
    ? ((campaign.sent_items + campaign.failed_items) / campaign.total_items) * 100 
    : 0;

  const getStatusBadge = () => {
    const variants = {
      draft: "secondary",
      running: "default",
      paused: "outline",
      completed: "default",
      failed: "destructive",
    } as const;

    const labels = {
      draft: "Rascunho",
      running: "Em execução",
      paused: "Pausado",
      completed: "Concluído",
      failed: "Falhou",
    };

    return (
      <Badge variant={variants[campaign.status]}>
        {labels[campaign.status]}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{campaign.name}</CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">{campaign.total_items}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Enviadas</p>
            <p className="text-lg font-semibold text-green-600">{campaign.sent_items}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Falhadas</p>
            <p className="text-lg font-semibold text-red-600">{campaign.failed_items}</p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Sessão: {campaign.session_name}</p>
          <p>Rate Limit: {campaign.rate_limit} msg/s</p>
        </div>

        <div className="flex gap-2">
          {campaign.status === "draft" || campaign.status === "paused" ? (
            <Button size="sm" onClick={() => onStart(campaign.id)} className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
          ) : campaign.status === "running" ? (
            <Button size="sm" variant="outline" onClick={() => onPause(campaign.id)} className="flex-1">
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </Button>
          ) : null}
          
          <Button size="sm" variant="outline" onClick={() => onExport(campaign.id)}>
            <Download className="h-4 w-4" />
          </Button>
          
          <Button size="sm" variant="destructive" onClick={() => onDelete(campaign.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
