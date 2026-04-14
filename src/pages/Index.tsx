import { useState } from "react";
import AboutModal from "@/components/AboutModal";
import TopNav from "@/components/TopNav";
import RoomPreview from "@/components/RoomPreview";
import SidePanel from "@/components/SidePanel";
import { useRoomPlanner } from "@/features/room-planner/useRoomPlanner";

const Index = () => {
  const planner = useRoomPlanner();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const handleToggleViewMode = () => {
    planner.setViewMode(planner.state.viewMode === "top" ? "perspective" : "top");
  };
  return (
    <div className="h-dvh min-h-screen flex flex-col bg-background">
      <TopNav
        viewMode={planner.state.viewMode}
        onToggleViewMode={handleToggleViewMode}
        onBack={planner.undo}
        onForward={planner.redo}
        onOpenAbout={() => setIsAboutOpen(true)}
        canGoBack={planner.canUndo}
        canGoForward={planner.canRedo}
      />
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        <RoomPreview planner={planner} />
        <SidePanel planner={planner} />
      </div>
      <AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </div>
  );
};

export default Index;
