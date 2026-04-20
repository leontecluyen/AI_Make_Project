"use client";

import { Button } from "@/components/ui/Button";
import { Minus, Plus } from "lucide-react";

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function ZoomControl({ zoom, onZoomChange, min = 1, max = 5, step = 0.5 }: ZoomControlProps) {
  const decrease = () => onZoomChange(Math.max(min, parseFloat((zoom - step).toFixed(1))));
  const increase = () => onZoomChange(Math.min(max, parseFloat((zoom + step).toFixed(1))));

  const pct = Math.round(((zoom - min) / (max - min)) * 100);

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={decrease} aria-label="ズームアウト">
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-10 text-center text-xs font-mono text-gray-600">{pct}%</span>
      <Button variant="ghost" size="sm" onClick={increase} aria-label="ズームイン">
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
