import { useState } from "react";
import {
  Ruler,
  Sofa,
  Palette,
  Eye,
  Layers,
  RotateCw,
  ChevronRight,
  Armchair,
  Lamp,
  BedDouble,
  UtensilsCrossed,
  Bath,
  Flower2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const wallColors = [
  { name: "Warm White", hsl: "40 30% 95%" },
  { name: "Linen", hsl: "35 25% 90%" },
  { name: "Sage", hsl: "140 12% 78%" },
  { name: "Clay", hsl: "15 30% 75%" },
  { name: "Stone", hsl: "30 5% 70%" },
  { name: "Charcoal", hsl: "30 5% 30%" },
  { name: "Sand", hsl: "38 35% 85%" },
  { name: "Blush", hsl: "10 25% 85%" },
];

const furnitureCategories = [
  { name: "Seating", icon: Armchair, count: 12 },
  { name: "Lighting", icon: Lamp, count: 8 },
  { name: "Bedroom", icon: BedDouble, count: 15 },
  { name: "Dining", icon: UtensilsCrossed, count: 10 },
  { name: "Bathroom", icon: Bath, count: 6 },
  { name: "Decor", icon: Flower2, count: 20 },
];

const materials = [
  { name: "Light Oak", color: "30 40% 70%" },
  { name: "Walnut", color: "25 30% 38%" },
  { name: "Bamboo", color: "45 35% 65%" },
  { name: "White Oak", color: "38 20% 82%" },
  { name: "Teak", color: "28 35% 48%" },
  { name: "Maple", color: "35 25% 75%" },
];

const SidePanel = () => {
  const [activeColor, setActiveColor] = useState(0);
  const [activeView, setActiveView] = useState("perspective");
  const [activeMaterial, setActiveMaterial] = useState(0);

  return (
    <div className="w-[320px] border-l bg-card flex flex-col overflow-hidden">
      <Tabs defaultValue="dimensions" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="grid grid-cols-5 mx-3 mt-3 bg-muted/60 h-10 rounded-lg">
          <TabsTrigger value="dimensions" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md">
            <Ruler className="w-3.5 h-3.5" />
          </TabsTrigger>
          <TabsTrigger value="furniture" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md">
            <Sofa className="w-3.5 h-3.5" />
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md">
            <Palette className="w-3.5 h-3.5" />
          </TabsTrigger>
          <TabsTrigger value="view" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md">
            <Eye className="w-3.5 h-3.5" />
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-md">
            <Layers className="w-3.5 h-3.5" />
          </TabsTrigger>
        </TabsList>

        {/* DIMENSIONS */}
        <TabsContent value="dimensions" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Room Dimensions</h3>
            <div className="space-y-3">
              {[
                { label: "Width", unit: "m", value: "4.0" },
                { label: "Length", unit: "m", value: "3.5" },
                { label: "Height", unit: "m", value: "2.8" },
              ].map((dim) => (
                <div key={dim.label} className="flex items-center gap-3">
                  <Label className="w-14 text-xs text-muted-foreground font-medium">{dim.label}</Label>
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      defaultValue={dim.value}
                      step="0.1"
                      className="h-9 text-sm pr-8 bg-muted/40 border-border/60 focus:bg-card"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{dim.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Room Shape</h3>
            <div className="grid grid-cols-3 gap-2">
              {["Rectangle", "L-Shape", "Custom"].map((shape, i) => (
                <button
                  key={shape}
                  className={`h-16 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-all ${
                    i === 0
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <div className={`${i === 0 ? "w-8 h-5" : i === 1 ? "w-8 h-5" : "w-6 h-6"} rounded-sm border-2 ${
                    i === 0 ? "border-primary/40" : "border-muted-foreground/30"
                  } ${i === 1 ? "border-l-0 border-b-0 w-6 h-6" : ""}`} />
                  {shape}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Rotate Room</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-9 text-xs bg-muted/30">
                <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                90° CW
              </Button>
              <Button variant="outline" size="sm" className="flex-1 h-9 text-xs bg-muted/30">
                <RotateCw className="w-3.5 h-3.5 mr-1.5 scale-x-[-1]" />
                90° CCW
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* FURNITURE */}
        <TabsContent value="furniture" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Furniture Categories</h3>
            <div className="space-y-1.5">
              {furnitureCategories.map((cat) => (
                <button
                  key={cat.name}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <cat.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} items</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-2">Quick Add</h3>
            <p className="text-xs text-muted-foreground mb-3">Drag items into the room preview</p>
            <div className="grid grid-cols-3 gap-2">
              {["Chair", "Table", "Sofa", "Shelf", "Rug", "Plant"].map((item) => (
                <div
                  key={item}
                  className="aspect-square rounded-lg bg-muted/40 border border-border/50 flex flex-col items-center justify-center gap-1 cursor-grab hover:shadow-soft hover:border-border transition-all"
                >
                  <div className="w-6 h-6 rounded bg-accent/40" />
                  <span className="text-[10px] text-muted-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* COLORS */}
        <TabsContent value="colors" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Wall Color</h3>
            <div className="grid grid-cols-4 gap-2.5">
              {wallColors.map((color, i) => (
                <button
                  key={color.name}
                  onClick={() => setActiveColor(i)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl border-2 transition-all ${
                      activeColor === i
                        ? "border-primary shadow-soft scale-105"
                        : "border-border/50 hover:border-border hover:scale-105"
                    }`}
                    style={{ backgroundColor: `hsl(${color.hsl})` }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Ceiling</h3>
            <div className="flex gap-2">
              {["White", "Off-White", "Match Walls"].map((opt, i) => (
                <button
                  key={opt}
                  className={`flex-1 h-9 rounded-lg border text-xs font-medium transition-all ${
                    i === 0
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Floor</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Wood", color: "30 40% 65%" },
                { name: "Tile", color: "30 5% 80%" },
                { name: "Concrete", color: "30 3% 60%" },
              ].map((floor, i) => (
                <button
                  key={floor.name}
                  className={`h-14 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    i === 0
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border"
                  }`}
                >
                  <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: `hsl(${floor.color})` }} />
                  {floor.name}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* VIEW */}
        <TabsContent value="view" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Camera View</h3>
            <div className="space-y-2">
              {[
                { id: "perspective", label: "Perspective", desc: "3D free camera" },
                { id: "top", label: "Top View", desc: "Floor plan layout" },
                { id: "front", label: "Front View", desc: "Elevation view" },
                { id: "side", label: "Side View", desc: "Side elevation" },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    activeView === view.id
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeView === view.id ? "bg-primary/10" : "bg-muted/60"
                  }`}>
                    <Eye className={`w-3.5 h-3.5 ${activeView === view.id ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${activeView === view.id ? "text-foreground" : "text-foreground/80"}`}>
                      {view.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{view.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Display Options</h3>
            <div className="space-y-2.5">
              {["Show Grid", "Show Dimensions", "Show Shadows", "Ambient Occlusion"].map((opt, i) => (
                <label key={opt} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-foreground/80">{opt}</span>
                  <div className={`w-9 h-5 rounded-full transition-colors relative ${
                    i < 2 ? "bg-primary" : "bg-muted"
                  }`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform ${
                      i < 2 ? "left-[18px]" : "left-0.5"
                    }`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* MATERIALS */}
        <TabsContent value="materials" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Wood Finishes</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {materials.map((mat, i) => (
                <button
                  key={mat.name}
                  onClick={() => setActiveMaterial(i)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-full aspect-square rounded-xl border-2 transition-all ${
                      activeMaterial === i
                        ? "border-primary shadow-soft scale-105"
                        : "border-border/40 hover:border-border hover:scale-105"
                    }`}
                    style={{ backgroundColor: `hsl(${mat.color})` }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{mat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Style Presets</h3>
            <div className="space-y-2">
              {["Japandi Minimal", "Scandinavian", "Wabi-Sabi", "Modern Zen"].map((style, i) => (
                <button
                  key={style}
                  className={`w-full px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                    i === 0
                      ? "bg-primary/5 border border-primary/20 font-medium text-foreground"
                      : "border border-transparent hover:bg-muted/50 text-foreground/70"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SidePanel;
