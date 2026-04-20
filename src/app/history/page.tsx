import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { ScanHistoryTable } from "@/components/history/ScanHistoryTable";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">スキャン履歴</h1>
      </div>

      <ScanHistoryTable scans={scans} />
    </div>
  );
}
