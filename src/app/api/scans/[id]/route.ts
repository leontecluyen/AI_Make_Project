import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.scan.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
