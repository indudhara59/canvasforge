"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const PRESETS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#ffffff",
  "#0e0e10",
];

type HSL = { h: number; s: number; l: number };

function hexToHsl(hex: string): HSL {
  const clean = hex.replace("#", "");
  const bigint = parseInt(
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean,
    16,
  );
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex({ h, s, l }: HSL): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isValidHex(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [hex, setHex] = React.useState(value);
  const [hsl, setHsl] = React.useState<HSL>(() => hexToHsl(value));

  React.useEffect(() => {
    setHex(value);
    setHsl(hexToHsl(value));
  }, [value]);

  const commit = (nextHsl: HSL) => {
    setHsl(nextHsl);
    const nextHex = hslToHex(nextHsl);
    setHex(nextHex);
    onChange(nextHex);
  };

  const handleHexInput = (raw: string) => {
    const next = raw.startsWith("#") ? raw : `#${raw}`;
    setHex(next);
    if (isValidHex(next)) {
      setHsl(hexToHsl(next));
      onChange(next);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors duration-200 ease-out hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-glass-border/20"
            style={{ backgroundColor: hex }}
          />
          <span className="font-mono text-xs uppercase text-muted-foreground">{hex}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-4" align="start">
        <motion.div
          key={hex}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="h-16 w-full rounded-md border border-glass-border/10"
          style={{ backgroundColor: hex }}
        />

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Hue</Label>
              <span className="text-xs tabular-nums text-muted-foreground">{hsl.h}°</span>
            </div>
            <Slider
              value={[hsl.h]}
              max={360}
              step={1}
              onValueChange={([h]) => commit({ ...hsl, h })}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Saturation</Label>
              <span className="text-xs tabular-nums text-muted-foreground">{hsl.s}%</span>
            </div>
            <Slider
              value={[hsl.s]}
              max={100}
              step={1}
              onValueChange={([s]) => commit({ ...hsl, s })}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Lightness</Label>
              <span className="text-xs tabular-nums text-muted-foreground">{hsl.l}%</span>
            </div>
            <Slider
              value={[hsl.l]}
              max={100}
              step={1}
              onValueChange={([l]) => commit({ ...hsl, l })}
            />
          </div>
        </div>

        <Input
          value={hex}
          onChange={(e) => handleHexInput(e.target.value)}
          className="font-mono text-xs uppercase"
          maxLength={7}
        />

        <div className="grid grid-cols-6 gap-2">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset}
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => {
                setHex(preset);
                setHsl(hexToHsl(preset));
                onChange(preset);
              }}
              className={cn(
                "h-6 w-6 rounded-full border border-glass-border/20",
                preset.toLowerCase() === hex.toLowerCase() && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: preset }}
              aria-label={`Set color to ${preset}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
