"use client";

import { Badge } from "@/components/ui/Badge";
import type { DecodeResult } from "@/lib/scanner/engines/barcodeDetector";

interface ScanResultProps {
  result: DecodeResult | null;
}

export function ScanResult({ result }: ScanResultProps) {
  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center text-sm text-gray-400">
        スキャン結果がここに表示されます
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <Badge>{result.barcodeType}</Badge>
        <span className="text-xs text-gray-400">via {result.engine}</span>
      </div>
      <p className="break-all font-mono text-sm text-gray-800">{result.rawValue}</p>
    </div>
  );
}
