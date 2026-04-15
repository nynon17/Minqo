import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Plane, Ray, Vector3 } from "three";
import { Dimensions, WallId, WallObjectItem } from "./types";
import { applyAxisSnap, getWallObjectSnapTargets } from "./objectSnapping";
import {
  getWallDragPlane,
  getWallObjectWorldTransform,
  getWallSpan,
  worldPointToWallPlacement,
} from "./wallObjectPlacement";
import { getVisibleWalls } from "./wallVisibility";

type WallObjectLayerProps = {
  room: Dimensions;
  hiddenWalls: WallId[];
  items: WallObjectItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onMoveItem: (
    id: string,
    updates: Partial<Pick<WallObjectItem, "wallId" | "offsetX" | "bottom">>,
  ) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  onItemPointerDown?: () => void;
};

type WallObjectMeshProps = {
  item: WallObjectItem;
  room: Dimensions;
  selected: boolean;
  onPointerDown: (event: ThreeEvent<PointerEvent>, item: WallObjectItem) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>, item: WallObjectItem) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>, item: WallObjectItem) => void;
};

type PointerCaptureTarget = {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
};

const X_AXIS = new Vector3(1, 0, 0);
const Z_AXIS = new Vector3(0, 0, 1);
const WALL_SWITCH_MARGIN = 0.45;

type WallDragTarget = {
  wallId: WallId;
  localPlacement: { offsetX: number; bottom: number };
  score: number;
};

type WallSnapState = {
  horizontal: boolean;
  vertical: boolean;
  wallId: WallId | null;
};

function getWallDragTarget(
  ray: Ray,
  room: Dimensions,
  item: WallObjectItem,
  preferredWallId: WallId,
  interactiveWalls: WallId[],
  allowPreferredWallFallback: boolean,
): WallDragTarget | null {
  const orderedWalls: WallId[] = [];
  if (interactiveWalls.includes(preferredWallId)) {
    orderedWalls.push(preferredWallId);
  }
  orderedWalls.push(...interactiveWalls.filter((wallId) => wallId !== preferredWallId));
  const probePlane = new Plane();
  const intersection = new Vector3();

  let bestTarget: WallDragTarget | null = null;

  for (let orderIndex = 0; orderIndex < orderedWalls.length; orderIndex += 1) {
    const wallId = orderedWalls[orderIndex];
    const dragPlane = getWallDragPlane(room, wallId, item.depth);
    probePlane.set(dragPlane.axis === "x" ? X_AXIS : Z_AXIS, -dragPlane.value);

    if (!ray.intersectPlane(probePlane, intersection)) {
      continue;
    }

    const span = getWallSpan(room, wallId);
    const halfSpan = span / 2;
    const horizontal = wallId === "front" || wallId === "back" ? intersection.x : intersection.z;
    const centerY = intersection.y;
    const minCenterY = item.height / 2;
    const maxCenterY = room.height - item.height / 2;

    if (
      horizontal < -halfSpan - WALL_SWITCH_MARGIN ||
      horizontal > halfSpan + WALL_SWITCH_MARGIN ||
      centerY < minCenterY - WALL_SWITCH_MARGIN ||
      centerY > maxCenterY + WALL_SWITCH_MARGIN
    ) {
      continue;
    }

    const localPlacement = worldPointToWallPlacement(
      room,
      wallId,
      { width: item.width, height: item.height, depth: item.depth },
      intersection,
    );
    const score = ray.origin.distanceTo(intersection) + orderIndex * 0.001;

    if (!bestTarget || score < bestTarget.score) {
      bestTarget = {
        wallId,
        localPlacement,
        score,
      };
    }
  }

  if (bestTarget) {
    return bestTarget;
  }
  const canFallbackToPreferredWall =
    interactiveWalls.includes(preferredWallId) || allowPreferredWallFallback;
  if (!canFallbackToPreferredWall) {
    return null;
  }

  const fallbackPlane = getWallDragPlane(room, preferredWallId, item.depth);
  probePlane.set(fallbackPlane.axis === "x" ? X_AXIS : Z_AXIS, -fallbackPlane.value);
  if (!ray.intersectPlane(probePlane, intersection)) {
    return null;
  }

  return {
    wallId: preferredWallId,
    localPlacement: worldPointToWallPlacement(
      room,
      preferredWallId,
      { width: item.width, height: item.height, depth: item.depth },
      intersection,
    ),
    score: ray.origin.distanceTo(intersection),
  };
}

function WallObjectMesh({
  item,
  room,
  selected,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: WallObjectMeshProps) {
  const transform = getWallObjectWorldTransform(room, item);
  const highlightColor = "#89a5ff";
  const highlightIntensity = selected ? 0.2 : 0;

  return (
    <group
      position={transform.position}
      rotation={[0, transform.rotationY, 0]}
      onPointerDown={(event) => onPointerDown(event, item)}
      onPointerMove={(event) => onPointerMove(event, item)}
      onPointerUp={(event) => onPointerUp(event, item)}
      onPointerCancel={(event) => onPointerUp(event, item)}
    >
      {item.type === "window" ? (
        <>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[item.width, item.height, item.depth]} />
            <meshStandardMaterial
              color={item.color}
              metalness={0.05}
              roughness={0.65}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          <mesh position={[0, 0, item.depth * 0.18]}>
            <boxGeometry args={[item.width * 0.82, item.height * 0.78, item.depth * 0.2]} />
            <meshStandardMaterial color={"#d7e8f4"} metalness={0.05} roughness={0.25} opacity={0.88} transparent />
          </mesh>
          <mesh position={[0, 0, item.depth * 0.24]}>
            <boxGeometry args={[item.width * 0.04, item.height * 0.78, item.depth * 0.08]} />
            <meshStandardMaterial color={"#f5f0e8"} />
          </mesh>
          <mesh position={[0, 0, item.depth * 0.24]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[item.height * 0.04, item.width * 0.82, item.depth * 0.08]} />
            <meshStandardMaterial color={"#f5f0e8"} />
          </mesh>
        </>
      ) : (
        <>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[item.width, item.height, item.depth * 0.62]} />
            <meshStandardMaterial
              color={item.color}
              metalness={0.06}
              roughness={0.7}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          <mesh position={[item.width * 0.36, 0.02, item.depth * 0.36]}>
            <sphereGeometry args={[Math.max(0.02, item.width * 0.018), 10, 10]} />
            <meshStandardMaterial color={"#cfb690"} metalness={0.2} roughness={0.4} />
          </mesh>
        </>
      )}

      {selected ? (
        <mesh>
          <boxGeometry args={[item.width * 1.04, item.height * 1.04, Math.max(item.depth * 1.4, 0.03)]} />
          <meshBasicMaterial color={highlightColor} wireframe transparent opacity={0.65} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

type WallObjectSnapGuidesProps = {
  room: Dimensions;
  wallId: WallId;
  depth: number;
  showHorizontalSnap: boolean;
  showVerticalSnap: boolean;
};

function WallObjectSnapGuides({
  room,
  wallId,
  depth,
  showHorizontalSnap,
  showVerticalSnap,
}: WallObjectSnapGuidesProps) {
  const plane = getWallDragPlane(room, wallId, depth);
  const span = getWallSpan(room, wallId);
  const centerPosition: [number, number, number] =
    plane.axis === "z" ? [0, room.height / 2, plane.value] : [plane.value, room.height / 2, 0];
  const wallSpanGuideSize: [number, number, number] =
    plane.axis === "z" ? [span, 0.012, 0.012] : [0.012, 0.012, span];

  return (
    <group>
      {showHorizontalSnap ? (
        <mesh position={centerPosition}>
          <boxGeometry args={[0.012, room.height, 0.012]} />
          <meshBasicMaterial color={"#7f9dff"} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ) : null}
      {showVerticalSnap ? (
        <mesh position={centerPosition}>
          <boxGeometry args={wallSpanGuideSize} />
          <meshBasicMaterial color={"#7f9dff"} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

export function WallObjectLayer({
  room,
  hiddenWalls,
  items,
  selectedItemId,
  onSelectItem,
  onMoveItem,
  onDragStateChange,
  onItemPointerDown,
}: WallObjectLayerProps) {
  const draggingItemIdRef = useRef<string | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const dragOffsetXRef = useRef(0);
  const dragOffsetBottomRef = useRef(0);
  const dragWallIdRef = useRef<WallId | null>(null);
  const dragPlacementRef = useRef<{ wallId: WallId; offsetX: number; bottom: number } | null>(null);
  const [snapState, setSnapState] = useState<WallSnapState>({
    horizontal: false,
    vertical: false,
    wallId: null,
  });
  const interactiveWalls = getVisibleWalls(hiddenWalls);
  const selectedItem = selectedItemId ? items.find((item) => item.id === selectedItemId) ?? null : null;

  useEffect(() => {
    return () => {
      onDragStateChange?.(false);
    };
  }, [onDragStateChange]);

  useEffect(() => {
    if (draggingItemIdRef.current) {
      return;
    }

    setSnapState((current) =>
      current.horizontal || current.vertical || current.wallId
        ? { horizontal: false, vertical: false, wallId: null }
        : current,
    );
  }, [selectedItemId]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>, item: WallObjectItem) => {
    if (event.button !== 0) {
      return;
    }

    onItemPointerDown?.();
    event.stopPropagation();
    const target = getWallDragTarget(
      event.ray,
      room,
      item,
      item.wallId,
      interactiveWalls,
      false,
    );
    if (target) {
      const localPlacement = target.localPlacement;
      dragOffsetXRef.current = item.offsetX - localPlacement.offsetX;
      dragOffsetBottomRef.current = item.bottom - localPlacement.bottom;
    } else {
      dragOffsetXRef.current = 0;
      dragOffsetBottomRef.current = 0;
    }

    onSelectItem(item.id);
    draggingItemIdRef.current = item.id;
    activePointerIdRef.current = event.pointerId;
    dragWallIdRef.current = item.wallId;
    dragPlacementRef.current = {
      wallId: item.wallId,
      offsetX: item.offsetX,
      bottom: item.bottom,
    };
    setSnapState({ horizontal: false, vertical: false, wallId: item.wallId });

    const captureTarget = event.target as unknown as PointerCaptureTarget;
    captureTarget.setPointerCapture?.(event.pointerId);
    onDragStateChange?.(true);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>, item: WallObjectItem) => {
    if (draggingItemIdRef.current !== item.id || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.stopPropagation();
    const currentPlacement = dragPlacementRef.current ?? {
      wallId: item.wallId,
      offsetX: item.offsetX,
      bottom: item.bottom,
    };
    const preferredWallId = dragWallIdRef.current ?? currentPlacement.wallId;
    const target = getWallDragTarget(
      event.ray,
      room,
      {
        ...item,
        wallId: currentPlacement.wallId,
        offsetX: currentPlacement.offsetX,
        bottom: currentPlacement.bottom,
      },
      preferredWallId,
      interactiveWalls,
      true,
    );
    if (!target) {
      return;
    }
    if (target.wallId !== preferredWallId) {
      const currentWorld = getWallObjectWorldTransform(room, {
        ...item,
        wallId: currentPlacement.wallId,
        offsetX: currentPlacement.offsetX,
        bottom: currentPlacement.bottom,
      }).position;
      const remappedPlacement = worldPointToWallPlacement(
        room,
        target.wallId,
        { width: item.width, height: item.height, depth: item.depth },
        { x: currentWorld[0], y: currentWorld[1], z: currentWorld[2] },
      );
      dragOffsetXRef.current = remappedPlacement.offsetX - target.localPlacement.offsetX;
      dragOffsetBottomRef.current = remappedPlacement.bottom - target.localPlacement.bottom;
      dragWallIdRef.current = target.wallId;
    }

    const nextWallId = dragWallIdRef.current ?? target.wallId;
    const rawOffsetX = target.localPlacement.offsetX + dragOffsetXRef.current;
    const rawBottom = target.localPlacement.bottom + dragOffsetBottomRef.current;
    const snapTargets = getWallObjectSnapTargets(room, item);
    const snappedOffsetX = applyAxisSnap(rawOffsetX, snapTargets.offsetX);
    const snappedBottom = applyAxisSnap(rawBottom, snapTargets.bottom);
    const nextOffsetX = snappedOffsetX.value;
    const nextBottom = snappedBottom.value;
    setSnapState((current) =>
      current.horizontal === snappedOffsetX.snapped &&
      current.vertical === snappedBottom.snapped &&
      current.wallId === nextWallId
        ? current
        : {
            horizontal: snappedOffsetX.snapped,
            vertical: snappedBottom.snapped,
            wallId: nextWallId,
          },
    );
    onMoveItem(item.id, {
      wallId: nextWallId,
      offsetX: nextOffsetX,
      bottom: nextBottom,
    });
    dragPlacementRef.current = {
      wallId: nextWallId,
      offsetX: nextOffsetX,
      bottom: nextBottom,
    };
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>, item: WallObjectItem) => {
    if (draggingItemIdRef.current !== item.id || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.stopPropagation();
    draggingItemIdRef.current = null;
    activePointerIdRef.current = null;
    dragWallIdRef.current = null;
    dragPlacementRef.current = null;

    const captureTarget = event.target as unknown as PointerCaptureTarget;
    captureTarget.releasePointerCapture?.(event.pointerId);
    onDragStateChange?.(false);
    setSnapState({ horizontal: false, vertical: false, wallId: null });
  };

  return (
    <group>
      {snapState.wallId && (snapState.horizontal || snapState.vertical) ? (
        <WallObjectSnapGuides
          room={room}
          wallId={snapState.wallId}
          depth={selectedItem?.depth ?? 0.12}
          showHorizontalSnap={snapState.horizontal}
          showVerticalSnap={snapState.vertical}
        />
      ) : null}
      {items
        .filter((item) => draggingItemIdRef.current === item.id || !hiddenWalls.includes(item.wallId))
        .map((item) => (
          <WallObjectMesh
            key={item.id}
            item={item}
            room={room}
            selected={selectedItemId === item.id}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        ))}
    </group>
  );
}
