import { Box, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const RoomPreview = () => {
  return (
    <div className="flex-1 flex flex-col relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg shadow-card border p-1 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-border" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Room Placeholder */}
      <div className="flex-1 bg-sand/50 rounded-xl m-3 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(hsl(30 10% 30%) 1px, transparent 1px), linear-gradient(90deg, hsl(30 10% 30%) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
            <Box className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <div>
            <p className="font-display text-lg text-foreground/70">3D Room Preview</p>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your room dimensions and start adding furniture
            </p>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-soft border px-3 py-1.5 text-xs text-muted-foreground">
            Room: 4.0m × 3.5m × 2.8m
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-soft border px-3 py-1.5 text-xs text-muted-foreground">
            Perspective View
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPreview;
