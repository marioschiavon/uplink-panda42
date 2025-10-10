import { User } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {import.meta.env.VITE_APP_NAME || "WPPConnect Console"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="flex items-center gap-3 rounded-full bg-muted px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {user?.username || "Usuário"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
