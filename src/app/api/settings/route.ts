import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { updateSettingsSchema } from "@/lib/validations/settingsSchema";

export async function GET() {
  const settings = await prisma.appSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json({ data: settings });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const settings = await prisma.appSetting.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });
  return NextResponse.json({ data: settings });
}
