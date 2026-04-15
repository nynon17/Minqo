import { Download, Eye, HelpCircle, Home, Redo2, Save, Settings, Undo2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ViewMode } from "@/features/room-planner/types";
import { cn } from "@/lib/utils";

type TopNavProps = {
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  onBack: () => void;
  onForward: () => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onImportProject: () => void;
  onOpenAbout: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
};

const TopNav = ({
  viewMode,
  onToggleViewMode,
  onBack,
  onForward,
  onSaveProject,
  onExportProject,
  onImportProject,
  onOpenAbout,
  canGoBack,
  canGoForward,
}: TopNavProps) => {
  const isTopView = viewMode === "top";
  const activeViewLabel = isTopView ? "Top view" : "360 view";
  const nextViewLabel = isTopView ? "360 view" : "Top view";
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-3 sm:px-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Home className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display text-base sm:text-lg font-semibold tracking-tight text-foreground">
          Minqo
        </span>
        <span className="hidden md:inline text-xs text-muted-foreground ml-1 font-medium tracking-wide uppercase">
          Room Planner
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={!canGoBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onForward}
          disabled={!canGoForward}
          className="text-muted-foreground hover:text-foreground"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleViewMode}
          aria-label={`Switch to ${nextViewLabel}`}
          title={`Switch to ${nextViewLabel}`}
          className={cn(
            "h-9 px-2.5 text-muted-foreground hover:text-foreground",
            isTopView && "bg-accent/70 text-foreground",
          )}
        >
          <Eye className="w-4 h-4" />
          <span className="text-[11px] sm:text-xs font-medium">{activeViewLabel}</span>
        </Button>
        <div className="hidden sm:block w-px h-5 bg-border mx-2" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSaveProject}
              aria-label="Save project"
              title="Save project"
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground active:scale-95 active:bg-accent/80 transition-transform"
            >
              <Save className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save project</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExportProject}
              aria-label="Export project"
              title="Export project"
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground active:scale-95 active:bg-accent/80 transition-transform"
            >
              <Download className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export project</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onImportProject}
              aria-label="Import project"
              title="Import project"
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground active:scale-95 active:bg-accent/80 transition-transform"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import project</TooltipContent>
        </Tooltip>
        <div className="hidden md:block w-px h-5 bg-border mx-2" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenAbout}
          aria-label="Open help and about modal"
          title="Help / About"
          className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default TopNav;
