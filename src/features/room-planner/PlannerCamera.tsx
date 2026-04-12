import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Dimensions, ViewMode, WallId } from "./types";
import { getHiddenWalls } from "./useAutoHideWalls";

type PlannerCameraProps = {
  room: Dimensions;
  viewMode: ViewMode;
  onHiddenWallsChange: (walls: WallId[]) => void;
  controlsEnabled: boolean;
};

function sameWalls(a: WallId[], b: WallId[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function getPreset(room: Dimensions, viewMode: ViewMode) {
  const target = new Vector3(0, room.height * 0.45, 0);
  const maxRoomSpan = Math.max(room.width, room.length, room.height);

  if (viewMode === "top") {
    return {
      position: new Vector3(0, Math.max(6, maxRoomSpan * 2.4), 0.001),
      target,
    };
  }

  if (viewMode === "side") {
    return {
      position: new Vector3(room.width * 1.85, room.height * 0.8, 0.001),
      target,
    };
  }

  const orbitDistance = Math.max(room.width, room.length) * 1.6 + 1;
  return {
    position: new Vector3(orbitDistance, room.height * 0.95, orbitDistance),
    target,
  };
}

export function PlannerCamera({
  room,
  viewMode,
  onHiddenWallsChange,
  controlsEnabled,
}: PlannerCameraProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const desiredPositionRef = useRef(new Vector3());
  const desiredTargetRef = useRef(new Vector3());
  const isTransitioningRef = useRef(true);
  const initializedRef = useRef(false);
  const lastHiddenWallsRef = useRef<WallId[]>([]);

  useEffect(() => {
    const preset = getPreset(room, viewMode);
    desiredPositionRef.current.copy(preset.position);
    desiredTargetRef.current.copy(preset.target);

    if (!initializedRef.current) {
      camera.position.copy(preset.position);

      if (controlsRef.current) {
        controlsRef.current.target.copy(preset.target);
        controlsRef.current.update();
      } else {
        camera.lookAt(preset.target);
      }

      initializedRef.current = true;
    }

    isTransitioningRef.current = true;
  }, [camera, room, viewMode]);

  useFrame(() => {
    if (isTransitioningRef.current) {
      camera.position.lerp(desiredPositionRef.current, 0.16);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(desiredTargetRef.current, 0.16);
        controlsRef.current.update();

        const reachedPosition =
          camera.position.distanceToSquared(desiredPositionRef.current) < 0.0004;
        const reachedTarget =
          controlsRef.current.target.distanceToSquared(desiredTargetRef.current) < 0.0004;

        if (reachedPosition && reachedTarget) {
          camera.position.copy(desiredPositionRef.current);
          controlsRef.current.target.copy(desiredTargetRef.current);
          controlsRef.current.update();
          isTransitioningRef.current = false;
        }
      } else {
        camera.lookAt(desiredTargetRef.current);
      }
    } else if (controlsRef.current) {
      controlsRef.current.update();
    }

    const hiddenWalls = getHiddenWalls(camera.position, viewMode);
    if (!sameWalls(lastHiddenWallsRef.current, hiddenWalls)) {
      lastHiddenWallsRef.current = hiddenWalls;
      onHiddenWallsChange(hiddenWalls);
    }
  });

  const allowOrbitRotation = viewMode === "perspective";
  const isTopView = viewMode === "top";

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={controlsEnabled}
      enableDamping
      dampingFactor={0.12}
      enableRotate={allowOrbitRotation}
      enablePan={!isTopView}
      enableZoom
      minDistance={2.5}
      maxDistance={35}
      minPolarAngle={isTopView ? 0.001 : 0.2}
      maxPolarAngle={isTopView ? 0.001 : Math.PI / 2.02}
    />
  );
}
