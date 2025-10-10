import { Home, Network, MessageCircle, MessageSquare, Users, Send, BarChart3, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Sessões", url: "/sessions", icon: Network },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Mensagens", url: "/messages", icon: MessageSquare },
  { title: "Contatos", url: "/contacts", icon: Users },
  { title: "Campanhas", url: "/campaigns", icon: Send },
  { title: "Métricas e Planos", url: "/metrics", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    toast({
      title: "Desconectado",
      description: "Você saiu da sua conta com sucesso.",
    });
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {import.meta.env.VITE_APP_NAME || "WPPConnect"}
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
