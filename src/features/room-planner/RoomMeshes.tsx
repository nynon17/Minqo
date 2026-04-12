import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { DoubleSide, Plane, Vector3 } from "three";
import { Dimensions, FurnitureItem, RoomColors, WallId } from "./types";

type RoomShellProps = {
  room: Dimensions;
  colors: RoomColors;
  hiddenWalls: WallId[];
};

type WallSegment = {
  id: WallId;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
};

type FurnitureLayerProps = {
  items: FurnitureItem[];
  onMoveItem: (id: string, position: [number, number, number]) => void;
  onDragStateChange?: (isDragging: boolean) => void;
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

export function RoomShell({ room, colors, hiddenWalls }: RoomShellProps) {
  const hiddenSet = new Set(hiddenWalls);

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

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[room.width, room.length]} />
        <meshStandardMaterial color={colors.floor} />
      </mesh>

      {wallSegments.map((wall) =>
        hiddenSet.has(wall.id) ? null : (
          <mesh
            key={wall.id}
            position={wall.position}
            rotation={wall.rotation}
            receiveShadow
          >
            <planeGeometry args={wall.size} />
            <meshStandardMaterial color={colors.walls[wall.id]} side={DoubleSide} />
          </mesh>
        ),
      )}
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

export function FurnitureLayer({ items, onMoveItem, onDragStateChange }: FurnitureLayerProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const draggingItemIdRef = useRef<string | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const dragPlaneRef = useRef(new Plane());
  const dragIntersectionRef = useRef(new Vector3());
  const dragOffsetRef = useRef(new Vector3());
  const dragHeightRef = useRef(0);

  useEffect(() => {
    return () => {
      onDragStateChange?.(false);
    };
  }, [onDragStateChange]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>, item: FurnitureItem) => {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    setSelectedItemId(item.id);

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
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>, item: FurnitureItem) => {
    if (draggingItemIdRef.current !== item.id || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.stopPropagation();

    if (!event.ray.intersectPlane(dragPlaneRef.current, dragIntersectionRef.current)) {
      return;
    }

    onMoveItem(item.id, [
      dragIntersectionRef.current.x + dragOffsetRef.current.x,
      dragHeightRef.current,
      dragIntersectionRef.current.z + dragOffsetRef.current.z,
    ]);
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
  };

  return (
    <group>
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
