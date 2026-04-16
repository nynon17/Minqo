import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { DoubleSide, Plane, Vector3 } from "three";
import { Dimensions, FurnitureItem, RoomColors, SurfaceSelection, WallId } from "./types";
import { applyAxisSnap, getFloorSnapTargets } from "./objectSnapping";
import { getObjectBounds } from "./objectMeasurements";
import { SURFACE_COLOR_PRESETS, WALL_LABELS } from "./wallColors";

type RoomShellProps = {
  room: Dimensions;
  colors: RoomColors;
  hiddenWalls: WallId[];
  selectedSurface: SurfaceSelection;
  onSurfaceSelect: (surface: SurfaceSelection) => void;
  onWallColorChange: (wall: WallId, color: string) => void;
  onApplySelectedWallColorToAll: (color: string) => void;
  onFloorColorChange: (color: string) => void;
};

type WallSegment = {
  id: WallId;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
};

type FurnitureLayerProps = {
  room: Dimensions;
  items: FurnitureItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onMoveItem: (id: string, position: [number, number, number]) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  onItemPointerDown?: () => void;
  snapEnabled: boolean;
  centerSnapEnabled: boolean;
  collisionPreventionEnabled: boolean;
};

type FurnitureObjectProps = {
  item: FurnitureItem;
  selected: boolean;
  onPointerDown: (event: ThreeEvent<PointerEvent>, item: FurnitureItem) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>, item: FurnitureItem) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>, item: FurnitureItem) => void;
};

type PointerCaptureTarget = {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
};

const FLOOR_UP = new Vector3(0, 1, 0);

export function RoomShell({
  room,
  colors,
  hiddenWalls,
  selectedSurface,
  onSurfaceSelect,
  onWallColorChange,
  onApplySelectedWallColorToAll,
  onFloorColorChange,
}: RoomShellProps) {
  const hiddenSet = new Set(hiddenWalls);
  const selectedWall = selectedSurface?.kind === "wall" ? selectedSurface.wall : null;
  const isFloorSelected = selectedSurface?.kind === "floor";

  const wallSegments: WallSegment[] = [
    {
      id: "front",
      position: [0, room.height / 2, -room.length / 2],
      rotation: [0, 0, 0],
      size: [room.width, room.height],
    },
    {
      id: "back",
      position: [0, room.height / 2, room.length / 2],
      rotation: [0, Math.PI, 0],
      size: [room.width, room.height],
    },
    {
      id: "left",
      position: [-room.width / 2, room.height / 2, 0],
      rotation: [0, Math.PI / 2, 0],
      size: [room.length, room.height],
    },
    {
      id: "right",
      position: [room.width / 2, room.height / 2, 0],
      rotation: [0, -Math.PI / 2, 0],
      size: [room.length, room.height],
    },
  ];

  const selectedWallSegment =
    selectedWall && !hiddenSet.has(selectedWall)
      ? wallSegments.find((wall) => wall.id === selectedWall) ?? null
      : null;
  const selectedWallColor = selectedWall ? colors.walls[selectedWall] : null;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onSurfaceSelect({ kind: "floor" });
        }}
      >
        <planeGeometry args={[room.width, room.length]} />
        <meshStandardMaterial
          color={colors.floor}
          emissive={"#8da7ff"}
          emissiveIntensity={isFloorSelected ? 0.16 : 0}
        />
      </mesh>

      {wallSegments.map((wall) =>
        hiddenSet.has(wall.id) ? null : (
          <mesh
            key={wall.id}
            position={wall.position}
            rotation={wall.rotation}
            receiveShadow
            onPointerDown={(event) => {
              event.stopPropagation();
              onSurfaceSelect({ kind: "wall", wall: wall.id });
            }}
          >
            <planeGeometry args={wall.size} />
            <meshStandardMaterial
              color={colors.walls[wall.id]}
              side={DoubleSide}
              emissive={"#8da7ff"}
              emissiveIntensity={selectedWall === wall.id ? 0.24 : 0}
            />
          </mesh>
        ),
      )}

      {selectedWallSegment && selectedWallColor ? (
        <group position={selectedWallSegment.position} rotation={selectedWallSegment.rotation}>
          <Html position={[0, 0.2, 0.08]} distanceFactor={8} style={{ pointerEvents: "auto" }}>
            <div
              className="w-[188px] rounded-lg border border-border/80 bg-card/95 shadow-soft backdrop-blur-sm p-2.5 space-y-2"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-foreground">
                  {WALL_LABELS[selectedWallSegment.id]} wall
                </p>
                <span className="h-2 w-2 rounded-full bg-primary/80" />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {SURFACE_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onWallColorChange(selectedWallSegment.id, color)}
                    className={`h-6 w-6 rounded-md border transition-all ${
                      selectedWallColor === color
                        ? "border-primary ring-2 ring-primary/35"
                        : "border-border/60 hover:border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Set ${WALL_LABELS[selectedWallSegment.id]} wall color`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">Custom</span>
                <input
                  type="color"
                  value={selectedWallColor}
                  onChange={(event) => onWallColorChange(selectedWallSegment.id, event.target.value)}
                  className="h-7 w-9 rounded border border-border/70 bg-transparent p-0.5"
                  aria-label={`Set custom ${WALL_LABELS[selectedWallSegment.id]} wall color`}
                />
              </div>

              <button
                onClick={() => onApplySelectedWallColorToAll(selectedWallColor)}
                className="w-full h-7 rounded-md border border-border/70 bg-muted/40 text-[11px] text-foreground hover:bg-muted/70 transition-colors"
              >
                Apply to all walls
              </button>
            </div>
          </Html>
        </group>
      ) : null}

      {isFloorSelected ? (
        <Html position={[0, 0.05, 0]} distanceFactor={10} style={{ pointerEvents: "auto" }}>
          <div
            className="w-[188px] rounded-lg border border-border/80 bg-card/95 shadow-soft backdrop-blur-sm p-2.5 space-y-2"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-foreground">Floor</p>
              <span className="h-2 w-2 rounded-full bg-primary/80" />
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {SURFACE_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => onFloorColorChange(color)}
                  className={`h-6 w-6 rounded-md border transition-all ${
                    colors.floor === color
                      ? "border-primary ring-2 ring-primary/35"
                      : "border-border/60 hover:border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label="Set floor color"
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">Custom</span>
              <input
                type="color"
                value={colors.floor}
                onChange={(event) => onFloorColorChange(event.target.value)}
                className="h-7 w-9 rounded border border-border/70 bg-transparent p-0.5"
                aria-label="Set custom floor color"
              />
            </div>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function FurnitureObject({
  item,
  selected,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: FurnitureObjectProps) {
  const [width, height, depth] = item.size;
  const highlightColor = "#89a5ff";
  const highlightIntensity = selected ? 0.25 : 0;

  return (
    <group
      position={item.position}
      rotation={[0, item.rotationY ?? 0, 0]}
      onPointerDown={(event) => onPointerDown(event, item)}
      onPointerMove={(event) => onPointerMove(event, item)}
      onPointerUp={(event) => onPointerUp(event, item)}
      onPointerCancel={(event) => onPointerUp(event, item)}
    >
      {item.type === "plant" ? (
        <>
          <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[width * 0.35, width * 0.45, 0.35, 20]} />
            <meshStandardMaterial color={"#8a6a4e"} />
          </mesh>
          <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
            <sphereGeometry args={[width * 0.45, 16, 16]} />
            <meshStandardMaterial
              color={item.color}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
        </>
      ) : item.type === "lamp" ? (
        <>
          <mesh position={[0, height * 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, height * 0.7, 16]} />
            <meshStandardMaterial color={"#d9cfbf"} />
          </mesh>
          <mesh position={[0, height * 0.78, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.32, 18]} />
            <meshStandardMaterial
              color={item.color}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
        </>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={item.color}
            emissive={highlightColor}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
      )}
    </group>
  );
}

export function FurnitureLayer({
  room,
  items,
  selectedItemId,
  onSelectItem,
  onMoveItem,
  onDragStateChange,
  onItemPointerDown,
  snapEnabled,
  centerSnapEnabled,
  collisionPreventionEnabled,
}: FurnitureLayerProps) {
  const draggingItemIdRef = useRef<string | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const dragPlaneRef = useRef(new Plane());
  const dragIntersectionRef = useRef(new Vector3());
  const dragOffsetRef = useRef(new Vector3());
  const dragHeightRef = useRef(0);
  const [snappedAxes, setSnappedAxes] = useState<{ x: boolean; z: boolean }>({ x: false, z: false });

  useEffect(() => {
    return () => {
      onDragStateChange?.(false);
    };
  }, [onDragStateChange]);

  useEffect(() => {
    if (draggingItemIdRef.current) {
      return;
    }

    setSnappedAxes((current) => (current.x || current.z ? { x: false, z: false } : current));
  }, [selectedItemId]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>, item: FurnitureItem) => {
    if (event.button !== 0) {
      return;
    }
    onItemPointerDown?.();

    event.stopPropagation();
    onSelectItem(item.id);

    draggingItemIdRef.current = item.id;
    activePointerIdRef.current = event.pointerId;
    dragHeightRef.current = item.position[1];
    dragPlaneRef.current.set(FLOOR_UP, -dragHeightRef.current);

    if (event.ray.intersectPlane(dragPlaneRef.current, dragIntersectionRef.current)) {
      dragOffsetRef.current.set(
        item.position[0] - dragIntersectionRef.current.x,
        0,
        item.position[2] - dragIntersectionRef.current.z,
      );
    } else {
      dragOffsetRef.current.set(0, 0, 0);
    }

    const captureTarget = event.target as unknown as PointerCaptureTarget;
    captureTarget.setPointerCapture?.(event.pointerId);
    onDragStateChange?.(true);
    setSnappedAxes({ x: false, z: false });
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>, item: FurnitureItem) => {
    if (draggingItemIdRef.current !== item.id || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.stopPropagation();

    if (!event.ray.intersectPlane(dragPlaneRef.current, dragIntersectionRef.current)) {
      return;
    }

    const rawX = dragIntersectionRef.current.x + dragOffsetRef.current.x;
    const rawZ = dragIntersectionRef.current.z + dragOffsetRef.current.z;
    const snapTargets = getFloorSnapTargets();
    const shouldApplyCenterSnap = snapEnabled && centerSnapEnabled;
    const snappedX = shouldApplyCenterSnap
      ? applyAxisSnap(rawX, snapTargets.x)
      : { value: rawX, snapped: false };
    const snappedZ = shouldApplyCenterSnap
      ? applyAxisSnap(rawZ, snapTargets.z)
      : { value: rawZ, snapped: false };

    setSnappedAxes((current) =>
      current.x === snappedX.snapped && current.z === snappedZ.snapped
        ? current
        : { x: snappedX.snapped, z: snappedZ.snapped },
    );

    const nextPosition: [number, number, number] = [snappedX.value, dragHeightRef.current, snappedZ.value];
    if (collisionPreventionEnabled) {
      const nextBounds = getObjectBounds({ ...item, position: nextPosition });
      const hasCollision = items.some((other) => {
        if (other.id === item.id) {
          return false;
        }

        const otherBounds = getObjectBounds(other);
        const overlapsX = nextBounds.minX < otherBounds.maxX && nextBounds.maxX > otherBounds.minX;
        const overlapsY = nextBounds.minY < otherBounds.maxY && nextBounds.maxY > otherBounds.minY;
        const overlapsZ = nextBounds.minZ < otherBounds.maxZ && nextBounds.maxZ > otherBounds.minZ;
        return overlapsX && overlapsY && overlapsZ;
      });
      if (hasCollision) {
        return;
      }
    }

    onMoveItem(item.id, nextPosition);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>, item: FurnitureItem) => {
    if (draggingItemIdRef.current !== item.id || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.stopPropagation();
    draggingItemIdRef.current = null;
    activePointerIdRef.current = null;

    const captureTarget = event.target as unknown as PointerCaptureTarget;
    captureTarget.releasePointerCapture?.(event.pointerId);
    onDragStateChange?.(false);
    setSnappedAxes({ x: false, z: false });
  };

  return (
    <group>
      {snappedAxes.x ? (
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[0.012, 0.012, room.length]} />
          <meshBasicMaterial color={"#7f9dff"} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ) : null}
      {snappedAxes.z ? (
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[room.width, 0.012, 0.012]} />
          <meshBasicMaterial color={"#7f9dff"} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ) : null}
      {items.map((item) => (
        <FurnitureObject
          key={item.id}
          item={item}
          selected={selectedItemId === item.id}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      ))}
    </group>
  );
}
