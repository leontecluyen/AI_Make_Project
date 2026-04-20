"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";

const WAIT_OPTIONS = [
  { value: 0, label: "0s" },
  { value: 500, label: "0.5s" },
  { value: 1000, label: "1s" },
  { value: 2000, label: "2s" },
  { value: 3000, label: "3s" },
  { value: 5000, label: "5s" },
];

interface ScannerControlsProps {
  isScanning: boolean;
  continuousScan: boolean;
  waitIntervalMs: number;
  onToggleScan: () => void;
  onContinuousChange: (v: boolean) => void;
  onWaitIntervalChange: (ms: number) => void;
}

export function ScannerControls({
  isScanning,
  continuousScan,
  waitIntervalMs,
  onToggleScan,
  onContinuousChange,
  onWaitIntervalChange,
}: ScannerControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <Checkbox
        id="continuous"
        label="連続読取"
        checked={continuousScan}
        onChange={(e) => onContinuousChange(e.target.checked)}
      />
      <Select
        id="wait"
        label="待機"
        value={waitIntervalMs}
        options={WAIT_OPTIONS}
        onChange={(e) => onWaitIntervalChange(Number(e.target.value))}
        disabled={!continuousScan}
        className="min-w-[70px]"
      />
      <div className="ml-auto">
        <Button
          variant={isScanning ? "danger" : "primary"}
          size="md"
          onClick={onToggleScan}
          className="min-w-[90px]"
        >
          {isScanning ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
}
