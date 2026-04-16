import { Html, Line } from "@react-three/drei";
import { MeasureFrom, MeasurementRounding, MeasurementStyle, Units } from "@/features/settings/types";
import { Dimensions, FurnitureItem, WallObjectItem } from "./types";
import {
  getFloorObjectMeasurementGuides,
  getWallObjectMeasurementGuides,
  MeasurementGuide,
} from "./measurementGuides";

type MeasurementGuideLayerProps = {
  room: Dimensions;
  selectedFurniture: FurnitureItem | null;
  selectedWallObject: WallObjectItem | null;
  style: MeasurementStyle;
  measureFrom: MeasureFrom;
  units: Units;
  rounding: MeasurementRounding;
};

function MeasurementGuideLine({ guide, style }: { guide: MeasurementGuide; style: MeasurementStyle }) {
  return (
    <group>
      {style === "lines-and-labels" ? (
        <Line points={[guide.start, guide.end]} color={"#7f9dff"} transparent opacity={0.72} />
      ) : null}
      <Html position={guide.labelPosition} center style={{ pointerEvents: "none" }}>
        <div className="rounded bg-card/90 border border-border/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-soft whitespace-nowrap">
          {guide.label}
        </div>
      </Html>
    </group>
  );
}

export function MeasurementGuideLayer({
  room,
  selectedFurniture,
  selectedWallObject,
  style,
  measureFrom,
  units,
  rounding,
}: MeasurementGuideLayerProps) {
  const guides = selectedFurniture
    ? getFloorObjectMeasurementGuides(room, selectedFurniture, measureFrom, units, rounding)
    : selectedWallObject
      ? getWallObjectMeasurementGuides(room, selectedWallObject, measureFrom, units, rounding)
      : [];

  if (guides.length === 0) {
    return null;
  }

  return (
    <group>
      {guides.map((guide) => (
        <MeasurementGuideLine key={guide.id} guide={guide} style={style} />
      ))}
    </group>
  );
}
