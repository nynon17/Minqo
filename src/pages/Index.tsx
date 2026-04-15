import { ChangeEvent, useRef, useState } from "react";
import AboutModal from "@/components/AboutModal";
import TopNav from "@/components/TopNav";
import RoomPreview from "@/components/RoomPreview";
import SidePanel from "@/components/SidePanel";
import { toast } from "@/components/ui/sonner";
import {
  applyProjectData,
  exportProjectAsJson,
  importProjectFromJson,
  saveProjectToLocalStorage,
} from "@/features/room-planner/projectPersistence";
import { useRoomPlanner } from "@/features/room-planner/useRoomPlanner";

const Index = () => {
  const planner = useRoomPlanner();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleImportProjectClick = () => {
    importFileInputRef.current?.click();
  };
  const handleSaveProject = () => {
    if (saveProjectToLocalStorage(planner.state)) {
      toast.message("Project saved");
      return;
    }

    toast.error("Unable to save project");
  };

  const handleExportProject = () => {
    if (exportProjectAsJson(planner.state)) {
      toast.message("Project exported");
      return;
    }

    toast.error("Unable to export project");
  };

  const handleProjectFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }
    const importResult = await importProjectFromJson(selectedFile);
    if (!importResult.ok) {
      toast.error("Invalid project file");
      return;
    }

    applyProjectData(importResult.state, planner.applyImportedProject);
    if (importResult.status === "partial") {
      toast.message("Project imported with some unsupported elements skipped");
      return;
    }

    toast.success("Project imported");
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
        onSaveProject={handleSaveProject}
        onExportProject={handleExportProject}
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
