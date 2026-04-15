import { ComponentType, useEffect, useState } from "react";
import {
  AppWindow,
  Armchair,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BedDouble,
  DoorOpen,
  Eye,
  Flower2,
  Lamp,
  Palette,
  Ruler,
  Sofa,
  Square,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  getFurnitureDisplayNames,
  getFurnitureTypeLabel,
  getWallObjectDisplayNames,
  getWallObjectTypeLabel,
} from "@/features/room-planner/furnitureNaming";
import {
  Dimensions,
  FurnitureType,
  RoomPlannerController,
  ViewMode,
  WallObjectType,
} from "@/features/room-planner/types";

type SidePanelProps = {
  planner: RoomPlannerController;
};

const DIMENSION_FIELDS: Array<{ key: keyof Dimensions; label: string; step: number }> = [
  { key: "width", label: "Width", step: 0.1 },
  { key: "length", label: "Length", step: 0.1 },
  { key: "height", label: "Height", step: 0.1 },
];

const VIEW_OPTIONS: Array<{ id: ViewMode; label: string; description: string }> = [
  { id: "perspective", label: "Perspective", description: "360° orbit camera" },
  { id: "side", label: "Side", description: "Orthographic-style side framing" },
  { id: "top", label: "Top", description: "Bird's-eye plan view" },
];


const FURNITURE_ACTIONS: Array<{
  type: FurnitureType;
  icon: ComponentType<{ className?: string }>;
}> = [
  { type: "chair", icon: Armchair },
  { type: "table", icon: Square },
  { type: "sofa", icon: Sofa },
  { type: "lamp", icon: Lamp },
  { type: "bed", icon: BedDouble },
  { type: "plant", icon: Flower2 },
];

const WALL_OBJECT_ACTIONS: Array<{
  type: WallObjectType;
  icon: ComponentType<{ className?: string }>;
}> = [
  { type: "window", icon: AppWindow },
  { type: "door", icon: DoorOpen },
];

const FURNITURE_HEIGHT_STEP = 0.1;
const WALL_OBJECT_HORIZONTAL_STEP = 0.1;
const WALL_OBJECT_VERTICAL_STEP = 0.1;

const toDimensionDrafts = (room: Dimensions): Record<keyof Dimensions, string> => ({
  width: room.width.toString(),
  length: room.length.toString(),
  height: room.height.toString(),
});

const SidePanel = ({ planner }: SidePanelProps) => {
  const {
    state: { room, viewMode, furniture, wallObjects, hiddenWalls },
    setDimension,
    setViewMode,
    setFurniturePosition,
    removeFurniture,
    addFurniture,
    clearFurniture,
    addWallObject,
    setWallObjectPlacement,
    removeWallObject,
    clearWallObjects,
  } = planner;

  const hiddenWallText = hiddenWalls.length > 0 ? hiddenWalls.join(", ") : "none";
  const furnitureDisplayNames = getFurnitureDisplayNames(furniture);
  const wallObjectDisplayNames = getWallObjectDisplayNames(wallObjects);
  const [activeDimension, setActiveDimension] = useState<keyof Dimensions | null>(null);
  const [dimensionDrafts, setDimensionDrafts] = useState<Record<keyof Dimensions, string>>(() =>
    toDimensionDrafts(room),
  );

  useEffect(() => {
    setDimensionDrafts((previous) => ({
      width: activeDimension === "width" ? previous.width : room.width.toString(),
      length: activeDimension === "length" ? previous.length : room.length.toString(),
      height: activeDimension === "height" ? previous.height : room.height.toString(),
    }));
  }, [activeDimension, room.height, room.length, room.width]);

  const handleDimensionInputChange = (key: keyof Dimensions, rawValue: string) => {
    setDimensionDrafts((previous) => ({ ...previous, [key]: rawValue }));

    if (rawValue === "" || rawValue === "-" || rawValue === "." || rawValue === "-.") {
      return;
    }

    const value = Number(rawValue);
    if (Number.isFinite(value)) {
      setDimension(key, value);
    }
  };

  const handleDimensionInputBlur = (key: keyof Dimensions) => {
    setActiveDimension((current) => (current === key ? null : current));

    const rawValue = dimensionDrafts[key].trim();

    if (rawValue === "") {
      setDimensionDrafts((previous) => ({
        ...previous,
        [key]: room[key].toString(),
      }));
      return;
    }

    const value = Number(rawValue);
    if (Number.isFinite(value)) {
      setDimension(key, value);
      return;
    }

    setDimensionDrafts((previous) => ({
      ...previous,
      [key]: room[key].toString(),
    }));
  };

  return (
    <div className="w-full max-w-full lg:w-[clamp(260px,30vw,360px)] lg:min-w-[260px] lg:max-w-[380px] lg:shrink-0 border-t lg:border-t-0 lg:border-l bg-card flex flex-col overflow-hidden h-[46vh] md:h-[42vh] lg:h-full min-h-[260px]">
      <Tabs defaultValue="dimensions" className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <TabsList className="grid grid-cols-2 mx-3 mt-3 bg-muted/60 h-11 rounded-lg">
          <TabsTrigger
            value="dimensions"
            className="h-full w-full px-0 text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md"
          >
            <Ruler className="w-3.5 h-3.5" />
          </TabsTrigger>
          <TabsTrigger
            value="furniture"
            className="h-full w-full px-0 text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md"
          >
            <Sofa className="w-3.5 h-3.5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dimensions" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Room Dimensions</h3>
            <div className="space-y-3">
              {DIMENSION_FIELDS.map((dim) => (
                <div key={dim.key} className="flex items-center gap-3">
                  <Label className="w-14 text-xs text-muted-foreground font-medium">{dim.label}</Label>
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      step={dim.step}
                      value={dimensionDrafts[dim.key]}
                      onFocus={() => setActiveDimension(dim.key)}
                      onChange={(event) => handleDimensionInputChange(dim.key, event.target.value)}
                      onBlur={() => handleDimensionInputBlur(dim.key)}
                      className="h-9 text-sm pr-8 bg-muted/40 border-border/60 focus:bg-card"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-display text-sm font-semibold text-foreground">Quick Presets</h3>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs bg-muted/30"
              onClick={() => {
                setDimension("width", 4);
                setDimension("length", 3.5);
                setDimension("height", 2.8);
              }}
            >
              Reset to 4.0 × 3.5 × 2.8
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs bg-muted/30"
              onClick={() => {
                setDimension("width", 5.2);
                setDimension("length", 4.3);
                setDimension("height", 3.1);
              }}
            >
              Studio preset
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="furniture" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-1">Quick Add Items</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Floor furniture and wall-mounted elements
            </p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Furniture</p>
            <div className="grid grid-cols-3 gap-2">
              {FURNITURE_ACTIONS.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addFurniture(item.type)}
                  className="aspect-square rounded-lg bg-muted/40 border border-border/50 flex flex-col items-center justify-center gap-1.5 hover:shadow-soft hover:border-border transition-all"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {getFurnitureTypeLabel(item.type)}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Wall elements</p>
              <div className="grid grid-cols-2 gap-2">
                {WALL_OBJECT_ACTIONS.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => {
                      if (!addWallObject(item.type)) {
                        toast.message("No visible wall available for placement");
                      }
                    }}
                    className="h-14 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center gap-2 hover:shadow-soft hover:border-border transition-all"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {getWallObjectTypeLabel(item.type)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-foreground">Scene Objects</h3>
              <span className="text-xs text-muted-foreground">{furniture.length + wallObjects.length} total</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs bg-muted/30"
              onClick={clearFurniture}
              disabled={furniture.length === 0}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear all furniture
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs bg-muted/30"
              onClick={clearWallObjects}
              disabled={wallObjects.length === 0}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear all wall elements
            </Button>

            {furniture.length === 0 ? (
              <p className="text-xs text-muted-foreground">No objects yet. Add furniture above.</p>
            ) : (
              <div className="space-y-2">
                {furniture.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-foreground">{furnitureDisplayNames[item.id]}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Height: {item.position[1].toFixed(2)}m
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card/80"
                          onClick={() =>
                            setFurniturePosition(item.id, [
                              item.position[0],
                              item.position[1] + FURNITURE_HEIGHT_STEP,
                              item.position[2],
                            ])
                          }
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card/80"
                          onClick={() =>
                            setFurniturePosition(item.id, [
                              item.position[0],
                              item.position[1] - FURNITURE_HEIGHT_STEP,
                              item.position[2],
                            ])
                          }
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card/80 text-destructive hover:text-destructive"
                          onClick={() => removeFurniture(item.id)}
                          title="Remove object"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {wallObjects.length === 0 ? (
              <p className="text-xs text-muted-foreground">No wall elements yet. Add windows or doors above.</p>
            ) : (
              <div className="space-y-2">
                {wallObjects.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-foreground">{wallObjectDisplayNames[item.id]}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.wallId} wall · {item.bottom.toFixed(2)}m from floor
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card/80"
                          onClick={() =>
                            setWallObjectPlacement(item.id, {
                              offsetX: item.offsetX - WALL_OBJECT_HORIZONTAL_STEP,
                            })
                          }
                          title="Move left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card/80"
                          onClick={() =>
                            setWallObjectPlacement(item.id, {
                              offsetX: item.offsetX + WALL_OBJECT_HORIZONTAL_STEP,
                            })
                          }
                          title="Move right"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card/80"
                          onClick={() =>
                            setWallObjectPlacement(item.id, {
                              bottom: item.bottom + WALL_OBJECT_VERTICAL_STEP,
                            })
                          }
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card/80"
                          onClick={() =>
                            setWallObjectPlacement(item.id, {
                              bottom: item.bottom - WALL_OBJECT_VERTICAL_STEP,
                            })
                          }
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card/80 text-destructive hover:text-destructive"
                          onClick={() => removeWallObject(item.id)}
                          title="Remove wall element"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default SidePanel;
