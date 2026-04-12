import { ComponentType, useEffect, useState } from "react";
import {
  Armchair,
  ArrowDown,
  ArrowUp,
  BedDouble,
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
import {
  Dimensions,
  FurnitureType,
  RoomPlannerController,
  ViewMode,
  WallId,
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

const WALL_ORDER: WallId[] = ["front", "back", "left", "right"];

const COLOR_PRESETS = [
  "#f5eee5",
  "#efe7dc",
  "#e2d9cb",
  "#d6cab9",
  "#d5dfd2",
  "#c9baa5",
  "#d9cdc0",
  "#f2e9dc",
];

const FURNITURE_ACTIONS: Array<{
  label: string;
  type: FurnitureType;
  icon: ComponentType<{ className?: string }>;
}> = [
  { label: "Chair", type: "chair", icon: Armchair },
  { label: "Table", type: "table", icon: Square },
  { label: "Sofa", type: "sofa", icon: Sofa },
  { label: "Lamp", type: "lamp", icon: Lamp },
  { label: "Bed", type: "bed", icon: BedDouble },
  { label: "Plant", type: "plant", icon: Flower2 },
];

const FURNITURE_HEIGHT_STEP = 0.1;

const toDimensionDrafts = (room: Dimensions): Record<keyof Dimensions, string> => ({
  width: room.width.toString(),
  length: room.length.toString(),
  height: room.height.toString(),
});

const SidePanel = ({ planner }: SidePanelProps) => {
  const [selectedWall, setSelectedWall] = useState<WallId>("front");
  const {
    state: { room, colors, viewMode, furniture, hiddenWalls },
    setDimension,
    setWallColor,
    setAllWallsColor,
    setFloorColor,
    setViewMode,
    setFurniturePosition,
    removeFurniture,
    addFurniture,
    clearFurniture,
  } = planner;

  const hiddenWallText = hiddenWalls.length > 0 ? hiddenWalls.join(", ") : "none";
  const allWallsColor =
    colors.walls.front === colors.walls.back &&
    colors.walls.front === colors.walls.left &&
    colors.walls.front === colors.walls.right
      ? colors.walls.front
      : colors.walls[selectedWall];
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
        <TabsList className="grid grid-cols-4 mx-3 mt-3 bg-muted/60 h-10 rounded-lg">
          <TabsTrigger
            value="dimensions"
            className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md"
          >
            <Ruler className="w-3.5 h-3.5" />
          </TabsTrigger>
          <TabsTrigger
            value="furniture"
            className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md"
          >
            <Sofa className="w-3.5 h-3.5" />
          </TabsTrigger>
          <TabsTrigger
            value="colors"
            className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md"
          >
            <Palette className="w-3.5 h-3.5" />
          </TabsTrigger>
          <TabsTrigger
            value="view"
            className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md"
          >
            <Eye className="w-3.5 h-3.5" />
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
            <h3 className="font-display text-sm font-semibold text-foreground mb-1">Quick Add Furniture</h3>
            <p className="text-xs text-muted-foreground mb-3">Simple primitives for prototype layout testing</p>
            <div className="grid grid-cols-3 gap-2">
              {FURNITURE_ACTIONS.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addFurniture(item.type)}
                  className="aspect-square rounded-lg bg-muted/40 border border-border/50 flex flex-col items-center justify-center gap-1.5 hover:shadow-soft hover:border-border transition-all"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-foreground">Scene Objects</h3>
              <span className="text-xs text-muted-foreground">{furniture.length} total</span>
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

            {furniture.length === 0 ? (
              <p className="text-xs text-muted-foreground">No objects yet. Add furniture above.</p>
            ) : (
              <div className="space-y-2">
                {furniture.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium capitalize text-foreground">
                          {item.type} {index + 1}
                        </p>
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
          </div>
        </TabsContent>

        <TabsContent value="colors" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Wall Colors</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {WALL_ORDER.map((wall) => (
                <button
                  key={wall}
                  onClick={() => setSelectedWall(wall)}
                  className={`h-8 rounded-md border text-[11px] font-medium capitalize transition-all ${
                    selectedWall === wall
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border"
                  }`}
                >
                  {wall}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={colors.walls[selectedWall]}
                onChange={(event) => setWallColor(selectedWall, event.target.value)}
                className="h-9 w-16 p-1 bg-muted/40 border-border/60"
              />
              <p className="text-xs text-muted-foreground capitalize">
                Editing <span className="font-medium text-foreground">{selectedWall}</span> wall
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Input
                type="color"
                value={allWallsColor}
                onChange={(event) => setAllWallsColor(event.target.value)}
                className="h-9 w-16 p-1 bg-muted/40 border-border/60"
              />
              <p className="text-xs text-muted-foreground">
                Change <span className="font-medium text-foreground">all walls</span> at once
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2.5 mt-3">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => setWallColor(selectedWall, color)}
                  className="w-12 h-12 rounded-xl border-2 border-border/50 hover:border-border hover:scale-105 transition-all"
                  style={{ backgroundColor: color }}
                  aria-label={`Set ${selectedWall} wall color`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs bg-muted/30 mt-3"
              onClick={() => setAllWallsColor(colors.walls[selectedWall])}
            >
              Apply selected wall color to all walls
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Floor Color</h3>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={colors.floor}
                onChange={(event) => setFloorColor(event.target.value)}
                className="h-9 w-16 p-1 bg-muted/40 border-border/60"
              />
              <p className="text-xs text-muted-foreground">Japandi wood tone / material placeholder</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="view" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Camera View</h3>
            <div className="space-y-2">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setViewMode(option.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    viewMode === option.id
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      viewMode === option.id ? "bg-primary/10" : "bg-muted/60"
                    }`}
                  >
                    <Eye className={`w-3.5 h-3.5 ${viewMode === option.id ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${viewMode === option.id ? "text-foreground" : "text-foreground/80"}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-display text-sm font-semibold text-foreground">Wall Visibility Debug</h3>
            <p className="text-xs text-muted-foreground">
              Hidden walls (auto): <span className="font-medium text-foreground">{hiddenWallText}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Perspective mode allows full 360° orbit. Side/corner angles auto-hide nearest wall(s).
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SidePanel;
