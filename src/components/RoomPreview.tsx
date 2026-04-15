import { RoomScene } from "@/features/room-planner/RoomScene";
import { RoomPlannerController, ViewMode } from "@/features/room-planner/types";

type RoomPreviewProps = {
  planner: RoomPlannerController;
};
const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  perspective: "360 view",
  side: "Side view",
  top: "Top view",
};

const RoomPreview = ({ planner }: RoomPreviewProps) => {
  const {
    state: { room, hiddenWalls },
    setHiddenWalls,
    setFurniturePosition,
    setWallObjectPlacement,
    setWallColor,
    setAllWallsColor,
    setFloorColor,
  } = planner;

  const hiddenWallLabel = hiddenWalls.length > 0 ? hiddenWalls.join(", ") : "none";

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col relative">
      <div className="flex-1 min-h-[280px] bg-sand/40 rounded-xl m-2 sm:m-3 border border-border/50 relative overflow-hidden">
        <RoomScene
          state={planner.state}
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
            Room: {room.width.toFixed(1)}m × {room.length.toFixed(1)}m × {room.height.toFixed(1)}m
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPreview;
