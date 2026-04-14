import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { PlannerCamera } from "./PlannerCamera";
import { FurnitureLayer, RoomShell } from "./RoomMeshes";
import { RoomPlannerState, SurfaceSelection, WallId } from "./types";

type RoomSceneProps = {
  state: RoomPlannerState;
  onHiddenWallsChange: (walls: WallId[]) => void;
  onFurniturePositionChange: (id: string, position: [number, number, number]) => void;
  onWallColorChange: (wall: WallId, color: string) => void;
  onApplyWallColorToAll: (color: string) => void;
  onFloorColorChange: (color: string) => void;
};
export function RoomScene({
  state,
  onHiddenWallsChange,
  onFurniturePositionChange,
  onWallColorChange,
  onApplyWallColorToAll,
  onFloorColorChange,
}: RoomSceneProps) {
  const [isDraggingFurniture, setIsDraggingFurniture] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState<SurfaceSelection>(null);

  useEffect(() => {
    if (selectedSurface?.kind === "wall" && state.hiddenWalls.includes(selectedSurface.wall)) {
      setSelectedSurface(null);
    }
  }, [selectedSurface, state.hiddenWalls]);
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [7, 4.5, 7], fov: 47, near: 0.1, far: 100 }}
      onPointerMissed={() => setSelectedSurface(null)}
    >
      <color attach="background" args={["#f7f2ea"]} />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#f8f1e6", "#cbb69c", 0.45]} />
      <directionalLight
        position={[8, 10, 6]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <PlannerCamera
        room={state.room}
        viewMode={state.viewMode}
        onHiddenWallsChange={onHiddenWallsChange}
        controlsEnabled={!isDraggingFurniture}
      />

      <RoomShell
        room={state.room}
        colors={state.colors}
        hiddenWalls={state.hiddenWalls}
        selectedSurface={selectedSurface}
        onSurfaceSelect={setSelectedSurface}
        onWallColorChange={onWallColorChange}
        onApplySelectedWallColorToAll={onApplyWallColorToAll}
        onFloorColorChange={onFloorColorChange}
      />
      <FurnitureLayer
        items={state.furniture}
        onMoveItem={onFurniturePositionChange}
        onDragStateChange={setIsDraggingFurniture}
        onItemPointerDown={() => setSelectedSurface(null)}
      />

      <gridHelper args={[20, 20, "#dccfbe", "#ece4d9"]} position={[0, 0.001, 0]} />
    </Canvas>
  );
}
