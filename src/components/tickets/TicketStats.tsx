import { Clock, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTicketsStore } from "@/store/tickets";

export const TicketStats = () => {
  const { waitingTickets, myTickets, tickets } = useTicketsStore();

  const inProgressCount = myTickets.filter((t) => t.status === "in_progress").length;
  const closedTodayCount = tickets.filter((t) => {
    if (t.status !== "closed") return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const ticketDate = new Date(t.updated_at).setHours(0, 0, 0, 0);
    return ticketDate === today;
  }).length;

  const stats = [
    {
      title: "Na Fila",
      value: waitingTickets.length,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Em Atendimento",
      value: inProgressCount,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Finalizados Hoje",
      value: closedTodayCount,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} rounded-full p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
