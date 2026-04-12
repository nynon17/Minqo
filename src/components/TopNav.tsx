import { Home, Save, Download, Undo2, Redo2, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TopNav = () => {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Home className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Minka
        </span>
        <span className="text-xs text-muted-foreground ml-1 font-medium tracking-wide uppercase">
          Room Planner
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Redo2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-2" />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Save className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-2" />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default TopNav;
