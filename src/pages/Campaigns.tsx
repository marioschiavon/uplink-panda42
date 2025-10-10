import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import { getTemplates, deleteTemplate, Template } from "@/api/templates";
import { getCampaigns, deleteCampaign, updateCampaign, getCampaignItems } from "@/api/campaigns";
import { useCampaignsStore } from "@/store/campaigns";
import { toast } from "@/hooks/use-toast";
import { TemplateDialog } from "@/components/campaigns/TemplateDialog";
import { CampaignDialog } from "@/components/campaigns/CampaignDialog";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { supabase } from "@/integrations/supabase/client";
import { getSocket } from "@/lib/socket";

export default function Campaigns() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>();
  const { campaigns, setCampaigns, updateCampaign: updateCampaignStore } = useCampaignsStore();

  useEffect(() => {
    loadTemplates();
    loadCampaigns();
    setupRealtimeSubscriptions();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar templates", variant: "destructive" });
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar campanhas", variant: "destructive" });
    }
  };

  const setupRealtimeSubscriptions = () => {
    const campaignsChannel = supabase
      .channel("campaigns-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaigns" } as any,
        (payload: any) => {
          if (payload.eventType === "UPDATE") {
            updateCampaignStore(payload.new.id, payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(campaignsChannel);
    };
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      toast({ title: "Sucesso", description: "Template excluído" });
      loadTemplates();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao excluir template", variant: "destructive" });
    }
  };

  const handleStartCampaign = async (id: string) => {
    try {
      await updateCampaign(id, { status: "running", started_at: new Date().toISOString() });
      
      const socket = getSocket();
      if (!socket.connected) socket.connect();
      
      socket.emit("start-campaign", { campaignId: id });
      
      toast({ title: "Sucesso", description: "Campanha iniciada" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao iniciar campanha", variant: "destructive" });
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      await updateCampaign(id, { status: "paused" });
      
      const socket = getSocket();
      socket.emit("pause-campaign", { campaignId: id });
      
      toast({ title: "Sucesso", description: "Campanha pausada" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao pausar campanha", variant: "destructive" });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaign(id);
      toast({ title: "Sucesso", description: "Campanha excluída" });
      loadCampaigns();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao excluir campanha", variant: "destructive" });
    }
  };

  const handleExportCampaign = async (id: string) => {
    try {
      const items = await getCampaignItems(id);
      const csv = [
        "phone,message,status,sent_at,error_message",
        ...items.map((item) =>
          [item.phone, item.message, item.status, item.sent_at || "", item.error_message || ""].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign-${id}.csv`;
      a.click();
      
      toast({ title: "Sucesso", description: "Resultados exportados" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao exportar resultados", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campanhas</h1>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Button onClick={() => setCampaignDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onStart={handleStartCampaign}
                onPause={handlePauseCampaign}
                onDelete={handleDeleteCampaign}
                onExport={handleExportCampaign}
              />
            ))}
          </div>

          {campaigns.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Nenhuma campanha criada ainda</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Button onClick={() => { setEditingTemplate(undefined); setTemplateDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{template.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingTemplate(template); setTemplateDialogOpen(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{template.message}</p>
                  {template.variables.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.variables.map((v) => (
                        <span key={v} className="text-xs bg-secondary px-2 py-1 rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Nenhum template criado ainda</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <TemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={editingTemplate}
        onSuccess={loadTemplates}
      />

      <CampaignDialog
        open={campaignDialogOpen}
        onOpenChange={setCampaignDialogOpen}
        templates={templates}
        sessions={["default"]}
        onSuccess={loadCampaigns}
      />
    </div>
  );
}
