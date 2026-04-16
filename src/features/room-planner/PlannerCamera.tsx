import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import { Camera, Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Dimensions, ViewMode, WallId } from "./types";
import { getHiddenWalls } from "./useAutoHideWalls";

type PlannerCameraProps = {
  room: Dimensions;
  viewMode: ViewMode;
  onHiddenWallsChange: (walls: WallId[]) => void;
  controlsEnabled: boolean;
  smoothTransitions: boolean;
  autoHideWalls: boolean;
};

function sameWalls(a: WallId[], b: WallId[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
const CAMERA_TRANSITION_DURATION_MS = 420;
const MIN_POLAR_ANGLE = 0.001;
const MAX_POLAR_ANGLE = Math.PI - 0.001;
const DEFAULT_CAMERA_ZOOM = 1;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function lerpNumber(start: number, end: number, t: number) {
  return start + (end - start) * t;
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
    zoom: DEFAULT_CAMERA_ZOOM,
  };
}

function flushControlMotion(controls: OrbitControlsImpl | null) {
  if (!controls) {
    return;
  }

  const previousDamping = controls.enableDamping;
  controls.enableDamping = false;
  controls.update();
  controls.enableDamping = previousDamping;
}

function applyCameraState(camera: Camera, position: Vector3, target: Vector3, zoom: number) {
  camera.position.copy(position);

  if ("zoom" in camera && typeof camera.zoom === "number") {
    const clampedZoom = Number.isFinite(zoom) ? zoom : camera.zoom;
    if (camera.zoom !== clampedZoom) {
      camera.zoom = clampedZoom;
      camera.updateProjectionMatrix();
    }
  }

  camera.lookAt(target);
}

function getPresetWithZoom(room: Dimensions, viewMode: ViewMode) {
  const preset = getPreset(room, viewMode);
  return {
    ...preset,
    zoom: DEFAULT_CAMERA_ZOOM,
  };
}

export function PlannerCamera({
  room,
  viewMode,
  onHiddenWallsChange,
  controlsEnabled,
  smoothTransitions,
  autoHideWalls,
}: PlannerCameraProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const transitionFromPositionRef = useRef(new Vector3());
  const transitionToPositionRef = useRef(new Vector3());
  const transitionFromTargetRef = useRef(new Vector3());
  const transitionToTargetRef = useRef(new Vector3());
  const currentTargetRef = useRef(new Vector3());
  const transitionFromZoomRef = useRef(DEFAULT_CAMERA_ZOOM);
  const transitionToZoomRef = useRef(DEFAULT_CAMERA_ZOOM);
  const transitionStartMsRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const initializedRef = useRef(false);
  const lastHiddenWallsRef = useRef<WallId[]>([]);
  const lastViewModeRef = useRef<ViewMode>(viewMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setTransitioning = (value: boolean) => {
    if (isTransitioningRef.current === value) {
      return;
    }

    isTransitioningRef.current = value;
    setIsTransitioning(value);
  };

  useLayoutEffect(() => {
    const preset = getPresetWithZoom(room, viewMode);
    const controls = controlsRef.current;
    const nowMs = performance.now();
    flushControlMotion(controls);

    if (!initializedRef.current) {
      camera.up.set(0, 1, 0);
      applyCameraState(camera, preset.position, preset.target, preset.zoom);
      if (controls) {
        controls.target.copy(preset.target);
      }
      currentTargetRef.current.copy(preset.target);

      initializedRef.current = true;
      lastViewModeRef.current = viewMode;
      setTransitioning(false);
      return;
    }

    if (!smoothTransitions) {
      applyCameraState(camera, preset.position, preset.target, preset.zoom);
      if (controls) {
        controls.target.copy(preset.target);
      }
      currentTargetRef.current.copy(preset.target);
      lastViewModeRef.current = viewMode;
      setTransitioning(false);
      return;
    }

    transitionFromPositionRef.current.copy(camera.position);
    transitionToPositionRef.current.copy(preset.position);
    transitionFromTargetRef.current.copy(controls?.target ?? currentTargetRef.current);
    transitionToTargetRef.current.copy(preset.target);
    transitionFromZoomRef.current =
      "zoom" in camera && typeof camera.zoom === "number" ? camera.zoom : DEFAULT_CAMERA_ZOOM;
    transitionToZoomRef.current = preset.zoom;
    transitionStartMsRef.current = nowMs;
    lastViewModeRef.current = viewMode;
    setTransitioning(true);
  }, [camera, room, smoothTransitions, viewMode]);

  useFrame(() => {
    const controls = controlsRef.current;
    camera.up.set(0, 1, 0);

    if (isTransitioningRef.current) {
      const elapsedMs = performance.now() - transitionStartMsRef.current;
      const progress = clamp01(elapsedMs / CAMERA_TRANSITION_DURATION_MS);
      const easedProgress = easeInOutCubic(progress);

      camera.position.lerpVectors(
        transitionFromPositionRef.current,
        transitionToPositionRef.current,
        easedProgress,
      );
      currentTargetRef.current.lerpVectors(
        transitionFromTargetRef.current,
        transitionToTargetRef.current,
        easedProgress,
      );
      const nextZoom = lerpNumber(
        transitionFromZoomRef.current,
        transitionToZoomRef.current,
        easedProgress,
      );

      applyCameraState(camera, camera.position, currentTargetRef.current, nextZoom);
      if (controls) {
        controls.target.copy(currentTargetRef.current);
      }

      if (progress >= 1) {
        applyCameraState(
          camera,
          transitionToPositionRef.current,
          transitionToTargetRef.current,
          transitionToZoomRef.current,
        );

        if (controls) {
          controls.target.copy(transitionToTargetRef.current);
          controls.update();
        }

        currentTargetRef.current.copy(transitionToTargetRef.current);
        setTransitioning(false);
      }
    } else if (controls) {
      controls.update();
      currentTargetRef.current.copy(controls.target);
    }

    const hiddenWalls = autoHideWalls ? getHiddenWalls(camera.position, viewMode) : [];
    if (!sameWalls(lastHiddenWallsRef.current, hiddenWalls)) {
      lastHiddenWallsRef.current = hiddenWalls;
      onHiddenWallsChange(hiddenWalls);
    }
  });

  const allowOrbitRotation = viewMode === "perspective";
  const isTopView = viewMode === "top";
  const hasPendingViewModeChange = lastViewModeRef.current !== viewMode;
  const controlsLockedForTransition = isTransitioning || hasPendingViewModeChange;
  const minPolarAngle =
    viewMode === "perspective" && !controlsLockedForTransition ? 0.2 : MIN_POLAR_ANGLE;
  const maxPolarAngle =
    viewMode === "perspective" && !controlsLockedForTransition
      ? Math.PI / 2.02
      : MAX_POLAR_ANGLE;

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={controlsEnabled && !controlsLockedForTransition}
      enableDamping={!controlsLockedForTransition}
      dampingFactor={0.12}
      enableRotate={allowOrbitRotation && !controlsLockedForTransition}
      enablePan={!isTopView && !controlsLockedForTransition}
      enableZoom
      minDistance={2.5}
      maxDistance={35}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
    />
  );
}
