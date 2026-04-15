import { ChangeEvent, useRef, useState } from "react";
import AboutModal from "@/components/AboutModal";
import TopNav from "@/components/TopNav";
import RoomPreview from "@/components/RoomPreview";
import SidePanel from "@/components/SidePanel";
import { toast } from "@/components/ui/sonner";
import { importProjectFromJsonText } from "@/features/room-planner/projectImport";
import { useRoomPlanner } from "@/features/room-planner/useRoomPlanner";

const Index = () => {
  const planner = useRoomPlanner();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleImportProjectClick = () => {
    importFileInputRef.current?.click();
  };

  const handleProjectFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    try {
      const fileContent = await selectedFile.text();
      const importResult = importProjectFromJsonText(fileContent);

      if (!importResult.ok) {
        toast.error("Invalid or unsupported project file");
        return;
      }

      planner.applyImportedProject(importResult.state);
      if (importResult.status === "partial") {
        toast.message("Project imported with some unsupported elements skipped");
      } else {
        toast.success("Project imported");
      }
    } catch {
      toast.error("Invalid or unsupported project file");
    }
  };
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
        onImportProject={handleImportProjectClick}
        onOpenAbout={() => setIsAboutOpen(true)}
        canGoBack={planner.canUndo}
        canGoForward={planner.canRedo}
      />
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        <RoomPreview planner={planner} />
        <SidePanel planner={planner} />
      </div>
      <input
        ref={importFileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleProjectFileChange}
      />
      <AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </div>
  );
};

export default Index;
