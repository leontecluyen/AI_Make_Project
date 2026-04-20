"use client";

import { useState, useTransition } from "react";
import { Trash2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScanRow } from "./ScanRow";
import { clearHistory } from "@/lib/actions/scanActions";

interface Scan {
  id: string;
  rawValue: string;
  barcodeType: string;
  aiData: string | null;
  engine: string;
  createdAt: Date;
}

interface ScanHistoryTableProps {
  scans: Scan[];
}

export function ScanHistoryTable({ scans }: ScanHistoryTableProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = scans.filter(
    (s) =>
      s.rawValue.toLowerCase().includes(query.toLowerCase()) ||
      s.barcodeType.toLowerCase().includes(query.toLowerCase())
  );

  const handleClear = () => {
    if (!confirm("すべてのスキャン履歴を削除しますか？")) return;
    startTransition(async () => {
      await clearHistory();
    });
  };

  const handleExportCSV = () => {
    const header = "ID,日時,バーコードタイプ,値,エンジン\n";
    const rows = filtered
      .map((s) =>
        [
          s.id,
          new Date(s.createdAt).toISOString(),
          s.barcodeType,
          `"${s.rawValue.replace(/"/g, '""')}"`,
          s.engine,
        ].join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
        <Button variant="danger" size="sm" onClick={handleClear} disabled={isPending}>
          <Trash2 className="h-3.5 w-3.5" /> 全削除
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-sm text-gray-400">
          {scans.length === 0 ? "スキャン履歴がありません" : "検索結果なし"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">日時</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">タイプ</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">値</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">エンジン</th>
                <th className="px-4 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((scan) => (
                <ScanRow key={scan.id} scan={scan} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-right text-xs text-gray-400">{filtered.length} 件</p>
    </div>
  );
}
