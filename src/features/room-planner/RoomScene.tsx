import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import { MeasurementGuideLayer } from "./MeasurementGuideLayer";
import { PlannerCamera } from "./PlannerCamera";
import { FurnitureLayer, RoomShell } from "./RoomMeshes";
import { WallObjectLayer } from "./WallObjectLayer";
import { getFurnitureTypeLabel, getWallObjectTypeLabel } from "./furnitureNaming";
import {
  formatDistanceCentimeters,
  getFloorObjectMeasurements,
  getWallObjectMeasurements,
  ObjectMeasurement,
} from "./objectMeasurements";
import { RoomPlannerState, SurfaceSelection, WallId } from "./types";

type RoomSceneProps = {
  state: RoomPlannerState;
  onHiddenWallsChange: (walls: WallId[]) => void;
  onFurniturePositionChange: (id: string, position: [number, number, number]) => void;
  onWallObjectPlacementChange: (
    id: string,
    updates: { wallId?: WallId; offsetX?: number; bottom?: number },
  ) => void;
  onWallColorChange: (wall: WallId, color: string) => void;
  onApplyWallColorToAll: (color: string) => void;
  onFloorColorChange: (color: string) => void;
};

type ObjectMeasurementPanelProps = {
  title: string;
  measurements: ObjectMeasurement[];
};

function ObjectMeasurementPanel({ title, measurements }: ObjectMeasurementPanelProps) {
  return (
    <Html fullscreen style={{ pointerEvents: "none" }}>
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-[196px] rounded-lg border border-border/80 bg-card/90 shadow-soft backdrop-blur-sm p-2.5 space-y-2">
        <p className="text-[11px] font-medium text-foreground">{title}</p>
        <div className="space-y-1.5">
          {measurements.map((measurement) => (
            <div key={measurement.label} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">{measurement.label}</span>
              <span className="font-medium text-foreground">
                {formatDistanceCentimeters(measurement.distanceMeters)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Html>
  );
}
export function RoomScene({
  state,
  onHiddenWallsChange,
  onFurniturePositionChange,
  onWallObjectPlacementChange,
  onWallColorChange,
  onApplyWallColorToAll,
  onFloorColorChange,
}: RoomSceneProps) {
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState<SurfaceSelection>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [selectedWallObjectId, setSelectedWallObjectId] = useState<string | null>(null);

  const clearObjectSelection = () => {
    setSelectedFurnitureId(null);
    setSelectedWallObjectId(null);
  };

  useEffect(() => {
    if (selectedSurface?.kind === "wall" && state.hiddenWalls.includes(selectedSurface.wall)) {
      setSelectedSurface(null);
    }
  }, [selectedSurface, state.hiddenWalls]);

  useEffect(() => {
    if (!selectedFurnitureId) {
      return;
    }

    if (!state.furniture.some((item) => item.id === selectedFurnitureId)) {
      setSelectedFurnitureId(null);
    }
  }, [selectedFurnitureId, state.furniture]);

  useEffect(() => {
    if (!selectedWallObjectId) {
      return;
    }

    const selectedWallObject = state.wallObjects.find((item) => item.id === selectedWallObjectId);
    if (!selectedWallObject) {
      setSelectedWallObjectId(null);
      return;
    }

    if (!isDraggingObject && state.hiddenWalls.includes(selectedWallObject.wallId)) {
      setSelectedWallObjectId(null);
    }
  }, [isDraggingObject, selectedWallObjectId, state.hiddenWalls, state.wallObjects]);

  const handleSurfaceSelect = (surface: SurfaceSelection) => {
    setSelectedSurface(surface);
    clearObjectSelection();
  };

  const handlePointerMissed = () => {
    setSelectedSurface(null);
    clearObjectSelection();
  };

  const selectedFurniture = selectedFurnitureId
    ? state.furniture.find((item) => item.id === selectedFurnitureId) ?? null
    : null;
  const selectedWallObject = selectedWallObjectId
    ? state.wallObjects.find((item) => item.id === selectedWallObjectId) ?? null
    : null;
  const selectedObjectMeasurementPanel = selectedFurniture
    ? {
        title: `${getFurnitureTypeLabel(selectedFurniture.type)} measurements`,
        measurements: getFloorObjectMeasurements(state.room, selectedFurniture),
      }
    : selectedWallObject
      ? {
          title: `${getWallObjectTypeLabel(selectedWallObject.type)} measurements`,
          measurements: getWallObjectMeasurements(state.room, selectedWallObject),
        }
      : null;
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [7, 4.5, 7], fov: 47, near: 0.1, far: 100 }}
      onPointerMissed={handlePointerMissed}
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
        controlsEnabled={!isDraggingObject}
      />

      <RoomShell
        room={state.room}
        colors={state.colors}
        hiddenWalls={state.hiddenWalls}
        selectedSurface={selectedSurface}
        onSurfaceSelect={handleSurfaceSelect}
        onWallColorChange={onWallColorChange}
        onApplySelectedWallColorToAll={onApplyWallColorToAll}
        onFloorColorChange={onFloorColorChange}
      />
      <FurnitureLayer
        room={state.room}
        items={state.furniture}
        selectedItemId={selectedFurnitureId}
        onSelectItem={setSelectedFurnitureId}
        onMoveItem={onFurniturePositionChange}
        onDragStateChange={setIsDraggingObject}
        onItemPointerDown={() => {
          setSelectedSurface(null);
          setSelectedWallObjectId(null);
        }}
      />
      <WallObjectLayer
        room={state.room}
        hiddenWalls={state.hiddenWalls}
        items={state.wallObjects}
        selectedItemId={selectedWallObjectId}
        onSelectItem={setSelectedWallObjectId}
        onMoveItem={onWallObjectPlacementChange}
        onDragStateChange={setIsDraggingObject}
        onItemPointerDown={() => {
          setSelectedSurface(null);
          setSelectedFurnitureId(null);
        }}
      />
      <MeasurementGuideLayer
        room={state.room}
        selectedFurniture={selectedFurniture}
        selectedWallObject={selectedWallObject}
      />
      {selectedObjectMeasurementPanel ? (
        <ObjectMeasurementPanel
          title={selectedObjectMeasurementPanel.title}
          measurements={selectedObjectMeasurementPanel.measurements}
        />
      ) : null}

      <gridHelper args={[20, 20, "#dccfbe", "#ece4d9"]} position={[0, 0.001, 0]} />
    </Canvas>
  );
}
