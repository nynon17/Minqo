import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { PlannerCamera } from "./PlannerCamera";
import { FurnitureLayer, RoomShell } from "./RoomMeshes";
import { RoomPlannerState, WallId } from "./types";

type RoomSceneProps = {
  state: RoomPlannerState;
  onHiddenWallsChange: (walls: WallId[]) => void;
  onFurniturePositionChange: (id: string, position: [number, number, number]) => void;
};
export function RoomScene({
  state,
  onHiddenWallsChange,
  onFurniturePositionChange,
}: RoomSceneProps) {
  const [isDraggingFurniture, setIsDraggingFurniture] = useState(false);
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [7, 4.5, 7], fov: 47, near: 0.1, far: 100 }}
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

      <RoomShell room={state.room} colors={state.colors} hiddenWalls={state.hiddenWalls} />
      <FurnitureLayer
        items={state.furniture}
        onMoveItem={onFurniturePositionChange}
        onDragStateChange={setIsDraggingFurniture}
      />

      <gridHelper args={[20, 20, "#dccfbe", "#ece4d9"]} position={[0, 0.001, 0]} />
    </Canvas>
  );
}
