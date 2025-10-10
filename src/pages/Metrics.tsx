import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { CheckCircle, XCircle, Send, Download, TrendingUp, Users, MessageSquare, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data for metrics
const dailyData = [
  { date: "01/04", sent: 120, received: 98, errors: 5 },
  { date: "02/04", sent: 150, received: 142, errors: 3 },
  { date: "03/04", sent: 180, received: 175, errors: 2 },
  { date: "04/04", sent: 200, received: 195, errors: 4 },
  { date: "05/04", sent: 165, received: 160, errors: 1 },
  { date: "06/04", sent: 210, received: 205, errors: 3 },
  { date: "07/04", sent: 190, received: 185, errors: 2 },
];

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    limits: {
      sessions: 1,
      messages: 100,
    },
    features: [
      "1 sessão ativa",
      "100 mensagens/mês",
      "Suporte básico",
      "Dashboard básico",
    ],
  },
  {
    name: "Pro",
    price: "R$ 99",
    period: "/mês",
    limits: {
      sessions: 5,
      messages: 5000,
    },
    features: [
      "5 sessões ativas",
      "5.000 mensagens/mês",
      "Suporte prioritário",
      "Dashboard avançado",
      "Campanhas ilimitadas",
      "Relatórios detalhados",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "R$ 499",
    period: "/mês",
    limits: {
      sessions: -1, // unlimited
      messages: -1, // unlimited
    },
    features: [
      "Sessões ilimitadas",
      "Mensagens ilimitadas",
      "Suporte 24/7",
      "Dashboard personalizado",
      "API dedicada",
      "Webhooks customizados",
      "Gerente de conta",
    ],
  },
];

export default function Metrics() {
  const [currentPlan] = useState("Free");
  const [usage] = useState({
    sessions: 1,
    messages: 347,
  });

  // Calculate metrics
  const totalSent = dailyData.reduce((acc, day) => acc + day.sent, 0);
  const totalReceived = dailyData.reduce((acc, day) => acc + day.received, 0);
  const totalErrors = dailyData.reduce((acc, day) => acc + day.errors, 0);
  const successRate = ((totalSent - totalErrors) / totalSent * 100).toFixed(1);

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Upgrade de Plano",
      description: `Você será redirecionado para o checkout do plano ${planName}.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Exportando Relatório",
      description: "Seu relatório será baixado em instantes.",
    });
  };

  // Check if usage exceeds limits
  const currentPlanData = plans.find(p => p.name === currentPlan);
  const sessionsLimitReached = currentPlanData && currentPlanData.limits.sessions !== -1 && usage.sessions >= currentPlanData.limits.sessions;
  const messagesLimitReached = currentPlanData && currentPlanData.limits.messages !== -1 && usage.messages >= currentPlanData.limits.messages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Métricas e Planos</h1>
          <p className="text-muted-foreground">Acompanhe seu uso e gerencie seu plano</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {/* Usage Warning */}
          {(sessionsLimitReached || messagesLimitReached) && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Limite Atingido</CardTitle>
                <CardDescription>
                  Você atingiu o limite do seu plano. Faça upgrade para continuar usando.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleUpgrade("Pro")}>
                  Fazer Upgrade
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSent}</div>
                <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Recebidas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReceived}</div>
                <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {totalErrors} erros
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentPlan}</div>
                <p className="text-xs text-muted-foreground">
                  {usage.messages}/{currentPlanData?.limits.messages === -1 ? '∞' : currentPlanData?.limits.messages} mensagens
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens Diárias</CardTitle>
                <CardDescription>Enviadas vs. Recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="sent" fill="hsl(var(--primary))" name="Enviadas" />
                    <Bar dataKey="received" fill="hsl(var(--secondary))" name="Recebidas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendência de Erros</CardTitle>
                <CardDescription>Erros ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="errors" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      name="Erros"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Usage Details */}
          <Card>
            <CardHeader>
              <CardTitle>Uso do Plano</CardTitle>
              <CardDescription>Monitoramento de limites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sessões Ativas</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.sessions}/{currentPlanData?.limits.sessions === -1 ? '∞' : currentPlanData?.limits.sessions}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${sessionsLimitReached ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ 
                      width: currentPlanData?.limits.sessions === -1 ? '50%' : `${(usage.sessions / currentPlanData!.limits.sessions) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mensagens Enviadas</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.messages}/{currentPlanData?.limits.messages === -1 ? '∞' : currentPlanData?.limits.messages}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${messagesLimitReached ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ 
                      width: currentPlanData?.limits.messages === -1 ? '50%' : `${(usage.messages / currentPlanData!.limits.messages) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Mais Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={currentPlan === plan.name ? "outline" : "default"}
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={currentPlan === plan.name}
                  >
                    {currentPlan === plan.name ? "Plano Atual" : "Escolher Plano"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Planos</CardTitle>
              <CardDescription>Veja todos os recursos lado a lado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Recurso</th>
                      {plans.map(plan => (
                        <th key={plan.name} className="text-center py-3 px-4">{plan.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Sessões Ativas</td>
                      {plans.map(plan => (
                        <td key={plan.name} className="text-center py-3 px-4">
                          {plan.limits.sessions === -1 ? '∞' : plan.limits.sessions}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Mensagens/mês</td>
                      {plans.map(plan => (
                        <td key={plan.name} className="text-center py-3 px-4">
                          {plan.limits.messages === -1 ? '∞' : plan.limits.messages.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Campanhas</td>
                      {plans.map(plan => (
                        <td key={plan.name} className="text-center py-3 px-4">
                          {plan.name === 'Free' ? <XCircle className="h-5 w-5 text-muted-foreground mx-auto" /> : <CheckCircle className="h-5 w-5 text-primary mx-auto" />}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">API Dedicada</td>
                      {plans.map(plan => (
                        <td key={plan.name} className="text-center py-3 px-4">
                          {plan.name === 'Enterprise' ? <CheckCircle className="h-5 w-5 text-primary mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
