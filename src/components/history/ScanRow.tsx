"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AITable } from "@/components/scanner/AITable";
import type { AIRow } from "@/lib/scanner/gs1Parser";
import { deleteScan } from "@/lib/actions/scanActions";

interface Scan {
  id: string;
  rawValue: string;
  barcodeType: string;
  aiData: string | null;
  engine: string;
  createdAt: Date;
}

export function ScanRow({ scan }: { scan: Scan }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const aiRows: AIRow[] = scan.aiData ? JSON.parse(scan.aiData) : [];
  const hasAI = aiRows.length > 0;

  const handleDelete = async () => {
    setDeleting(true);
    await deleteScan(scan.id);
  };

  const formattedDate = new Date(scan.createdAt).toLocaleString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${deleting ? "opacity-50" : ""}`}>
        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formattedDate}</td>
        <td className="px-4 py-3">
          <Badge>{scan.barcodeType}</Badge>
        </td>
        <td className="px-4 py-3 font-mono text-sm text-gray-800 max-w-xs truncate">
          {scan.rawValue}
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">{scan.engine}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {hasAI && (
              <Button variant="ghost" size="sm" onClick={() => setExpanded((p) => !p)}>
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </td>
      </tr>
      {expanded && hasAI && (
        <tr>
          <td colSpan={5} className="px-4 pb-3">
            <AITable rows={aiRows} />
          </td>
        </tr>
      )}
    </>
  );
}
