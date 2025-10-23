// src/components/layout/Header.tsx
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useOutletContext } from "react-router-dom";

interface HeaderProps {
  title: string;
}

interface OutletContext {
  toggleSidebar: () => void;
}

export function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useOutletContext<OutletContext>();

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Bouton menu hamburger pour mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
          
          <h1 className="text-lg font-semibold sm:text-xl md:text-2xl truncate">
            {title}
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
