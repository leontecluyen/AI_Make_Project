import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createScanSchema, scanQuerySchema } from "@/lib/validations/scanSchema";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = scanQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { page, limit, type } = parsed.data;
  const where = type ? { barcodeType: { contains: type } } : undefined;
  const [scans, total] = await Promise.all([
    prisma.scan.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.scan.count({ where }),
  ]);
  return NextResponse.json({ data: scans, meta: { page, limit, total } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createScanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const scan = await prisma.scan.create({ data: parsed.data });
  return NextResponse.json({ data: scan }, { status: 201 });
}

export async function DELETE() {
  await prisma.scan.deleteMany();
  return NextResponse.json({ data: { cleared: true } });
}
