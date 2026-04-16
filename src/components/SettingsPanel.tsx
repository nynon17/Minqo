import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AppSettings } from "@/features/settings/types";

type SettingsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSettingsChange: (updater: (previous: AppSettings) => AppSettings) => void;
};

type SelectSettingRowProps = {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string) => void;
};

type ToggleSettingRowProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function SelectSettingRow({ id, label, value, options, onValueChange }: SelectSettingRowProps) {
  return (
    <div className="grid grid-cols-[1fr_130px] items-center gap-3">
      <Label htmlFor={id} className="text-xs text-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="h-8 text-xs bg-muted/30">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleSettingRow({ id, label, checked, onCheckedChange }: ToggleSettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-xs text-foreground">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5 rounded-md border border-border/70 bg-muted/20 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

const SettingsPanel = ({ open, onOpenChange, settings, onSettingsChange }: SettingsPanelProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[560px] p-4 sm:p-5">
      <DialogHeader>
        <DialogTitle className="font-display text-lg">Settings</DialogTitle>
        <DialogDescription className="text-xs">Small defaults for your current planner experience.</DialogDescription>
      </DialogHeader>
      <div className="max-h-[70vh] overflow-y-auto space-y-3 pr-1">
        <SettingsSection title="General">
          <SelectSettingRow
            id="settings-units"
            label="Units"
            value={settings.general.units}
            options={[
              { value: "cm", label: "cm" },
              { value: "m", label: "m" },
            ]}
            onValueChange={(value) =>
              onSettingsChange((previous) => ({
                ...previous,
                general: {
                  ...previous.general,
                  units: value === "cm" ? "cm" : "m",
                },
              }))
            }
          />
          <SelectSettingRow
            id="settings-theme"
            label="Theme"
            value={settings.general.theme}
            options={[
              { value: "light", label: "light" },
              { value: "warm", label: "warm" },
              { value: "dark", label: "dark" },
            ]}
            onValueChange={(value) =>
              onSettingsChange((previous) => ({
                ...previous,
                general: {
                  ...previous.general,
                  theme: value === "light" || value === "dark" ? value : "warm",
                },
              }))
            }
          />
          <ToggleSettingRow
            id="settings-autosave"
            label="Auto-save"
            checked={settings.general.autoSave}
            onCheckedChange={(checked) =>
              onSettingsChange((previous) => ({
                ...previous,
                general: {
                  ...previous.general,
                  autoSave: checked,
                },
              }))
            }
          />
        </SettingsSection>

        <SettingsSection title="View">
          <SelectSettingRow
            id="settings-default-view"
            label="Default startup view"
            value={settings.view.defaultStartupView}
            options={[
              { value: "perspective", label: "360 view" },
              { value: "side", label: "side view" },
              { value: "top", label: "top view" },
            ]}
            onValueChange={(value) =>
              onSettingsChange((previous) => ({
                ...previous,
                view: {
                  ...previous.view,
                  defaultStartupView: value === "side" || value === "top" ? value : "perspective",
                },
              }))
            }
          />
          <ToggleSettingRow
            id="settings-smooth-camera"
            label="Smooth camera transitions"
            checked={settings.view.smoothCameraTransitions}
            onCheckedChange={(checked) =>
              onSettingsChange((previous) => ({
                ...previous,
                view: {
                  ...previous.view,
                  smoothCameraTransitions: checked,
                },
              }))
            }
          />
          <ToggleSettingRow
            id="settings-autohide-walls"
            label="Auto-hide walls"
            checked={settings.view.autoHideWalls}
            onCheckedChange={(checked) =>
              onSettingsChange((previous) => ({
                ...previous,
                view: {
                  ...previous.view,
                  autoHideWalls: checked,
                },
              }))
            }
          />
          <ToggleSettingRow
            id="settings-show-grid"
            label="Show grid"
            checked={settings.view.showGrid}
            onCheckedChange={(checked) =>
              onSettingsChange((previous) => ({
                ...previous,
                view: {
                  ...previous.view,
                  showGrid: checked,
                },
              }))
            }
          />
        </SettingsSection>

        <SettingsSection title="Editing">
          <ToggleSettingRow
            id="settings-snap"
            label="Snap"
            checked={settings.editing.snap}
            onCheckedChange={(checked) =>
              onSettingsChange((previous) => ({
                ...previous,
                editing: {
                  ...previous.editing,
                  snap: checked,
                },
              }))
            }
          />
          <ToggleSettingRow
            id="settings-center-snap"
            label="Center snap"
            checked={settings.editing.centerSnap}
            onCheckedChange={(checked) =>
              onSettingsChange((previous) => ({
                ...previous,
                editing: {
                  ...previous.editing,
                  centerSnap: checked,
                },
              }))
            }
          />
          <ToggleSettingRow
            id="settings-collision-prevention"
            label="Collision prevention"
            checked={settings.editing.collisionPrevention}
            onCheckedChange={(checked) =>
              onSettingsChange((previous) => ({
                ...previous,
                editing: {
                  ...previous.editing,
                  collisionPrevention: checked,
                },
              }))
            }
          />
        </SettingsSection>

        <SettingsSection title="Measurements">
          <ToggleSettingRow
            id="settings-show-measurements"
            label="Show measurements"
            checked={settings.measurements.showMeasurements}
            onCheckedChange={(checked) =>
              onSettingsChange((previous) => ({
                ...previous,
                measurements: {
                  ...previous.measurements,
                  showMeasurements: checked,
                },
              }))
            }
          />
          <SelectSettingRow
            id="settings-measurement-style"
            label="Measurement style"
            value={settings.measurements.measurementStyle}
            options={[
              { value: "labels-only", label: "labels only" },
              { value: "lines-and-labels", label: "lines + labels" },
            ]}
            onValueChange={(value) =>
              onSettingsChange((previous) => ({
                ...previous,
                measurements: {
                  ...previous.measurements,
                  measurementStyle: value === "labels-only" ? "labels-only" : "lines-and-labels",
                },
              }))
            }
          />
          <SelectSettingRow
            id="settings-measure-from"
            label="Measure from"
            value={settings.measurements.measureFrom}
            options={[
              { value: "object-edges", label: "object edges" },
              { value: "object-center", label: "object center" },
            ]}
            onValueChange={(value) =>
              onSettingsChange((previous) => ({
                ...previous,
                measurements: {
                  ...previous.measurements,
                  measureFrom: value === "object-center" ? "object-center" : "object-edges",
                },
              }))
            }
          />
          <SelectSettingRow
            id="settings-rounding"
            label="Rounding"
            value={settings.measurements.rounding}
            options={[
              { value: "whole-cm", label: "whole cm" },
              { value: "half-cm", label: "0.5 cm" },
              { value: "one-decimal", label: "1 decimal" },
            ]}
            onValueChange={(value) =>
              onSettingsChange((previous) => ({
                ...previous,
                measurements: {
                  ...previous.measurements,
                  rounding:
                    value === "whole-cm" || value === "half-cm" ? value : "one-decimal",
                },
              }))
            }
          />
        </SettingsSection>
      </div>
    </DialogContent>
  </Dialog>
);

export default SettingsPanel;
