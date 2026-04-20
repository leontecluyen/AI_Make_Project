"use client";

import type { AIRow } from "@/lib/scanner/gs1Parser";

interface AITableProps {
  rows: AIRow[];
}

export function AITable({ rows }: AITableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center text-sm text-gray-400">
        GS1 AIデータなし
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-600 w-24">AI Code</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">AI値</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">備考</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-gray-700">{row.aiCode}</td>
              <td className="px-4 py-2 font-mono break-all text-gray-800">{row.value}</td>
              <td className="px-4 py-2 text-gray-500">{row.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
