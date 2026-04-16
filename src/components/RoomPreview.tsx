import { RoomScene } from "@/features/room-planner/RoomScene";
import { RoomPlannerController } from "@/features/room-planner/types";
import { formatDimensionValue } from "@/features/settings/formatting";
import { AppSettings } from "@/features/settings/types";

type RoomPreviewProps = {
  planner: RoomPlannerController;
  settings: AppSettings;
};

const RoomPreview = ({ planner, settings }: RoomPreviewProps) => {
  const {
    state: { room },
    setHiddenWalls,
    setFurniturePosition,
    setWallObjectPlacement,
    setWallColor,
    setAllWallsColor,
    setFloorColor,
  } = planner;


  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col relative">
      <div className="flex-1 min-h-[280px] bg-sand/40 rounded-xl m-2 sm:m-3 border border-border/50 relative overflow-hidden">
        <RoomScene
          state={planner.state}
          settings={settings}
          onHiddenWallsChange={setHiddenWalls}
          onFurniturePositionChange={setFurniturePosition}
          onWallObjectPlacementChange={setWallObjectPlacement}
          onWallColorChange={setWallColor}
          onApplyWallColorToAll={setAllWallsColor}
          onFloorColorChange={setFloorColor}
        />

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-card/85 backdrop-blur-sm rounded-lg shadow-soft border px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-muted-foreground">
          Drag to orbit camera · click wall/floor to edit color · drag objects to move
        </div>

        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col md:flex-row justify-between md:items-center gap-2">
          <div className="bg-card/85 backdrop-blur-sm rounded-lg shadow-soft border px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-muted-foreground">
            Room: {formatDimensionValue(room.width, settings.general.units)} ×{" "}
            {formatDimensionValue(room.length, settings.general.units)} ×{" "}
            {formatDimensionValue(room.height, settings.general.units)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPreview;
