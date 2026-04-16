import { ChangeEvent, useEffect, useRef, useState } from "react";
import AboutModal from "@/components/AboutModal";
import SettingsPanel from "@/components/SettingsPanel";
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
import { ViewMode } from "@/features/room-planner/types";
import { useRoomPlanner } from "@/features/room-planner/useRoomPlanner";
import { useAppSettings } from "@/features/settings/useAppSettings";

const Index = () => {
  const planner = useRoomPlanner();
  const plannerState = planner.state;
  const { setViewMode } = planner;
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const { settings, updateSettings } = useAppSettings();
  const lastAppliedStartupViewRef = useRef<ViewMode | null>(null);

  const handleImportProjectClick = () => {
    importFileInputRef.current?.click();
  };
  const handleSaveProject = () => {
    if (saveProjectToLocalStorage(plannerState)) {
      toast.message("Project saved");
      return;
    }

    toast.error("Unable to save project");
  };

  const handleExportProject = () => {
    if (exportProjectAsJson(plannerState)) {
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
    setViewMode(plannerState.viewMode === "top" ? "perspective" : "top");
  };

  useEffect(() => {
    if (lastAppliedStartupViewRef.current === settings.view.defaultStartupView) {
      return;
    }
    if (plannerState.viewMode !== settings.view.defaultStartupView) {
      setViewMode(settings.view.defaultStartupView);
    }
    lastAppliedStartupViewRef.current = settings.view.defaultStartupView;
  }, [plannerState.viewMode, setViewMode, settings.view.defaultStartupView]);

  useEffect(() => {
    if (!settings.general.autoSave) {
      return;
    }

    saveProjectToLocalStorage(plannerState);
  }, [plannerState, settings.general.autoSave]);
  return (
    <div className="h-dvh min-h-screen flex flex-col bg-background">
      <TopNav
        viewMode={plannerState.viewMode}
        onToggleViewMode={handleToggleViewMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
        <RoomPreview planner={planner} settings={settings} />
        <SidePanel planner={planner} settings={settings} />
      </div>
      <input
        ref={importFileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleProjectFileChange}
      />
      <AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />
      <SettingsPanel
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSettingsChange={updateSettings}
      />
    </div>
  );
};

export default Index;
