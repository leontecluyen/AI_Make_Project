"use server";

import { prisma } from "@/lib/db/prisma";
import { createScanSchema } from "@/lib/validations/scanSchema";
import { revalidatePath } from "next/cache";

export async function saveScan(data: unknown) {
  const parsed = createScanSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const scan = await prisma.scan.create({ data: parsed.data });
  revalidatePath("/history");
  return { data: scan };
}

export async function deleteScan(id: string) {
  try {
    await prisma.scan.delete({ where: { id } });
  } catch {
    return { error: "Record not found" };
  }
  revalidatePath("/history");
  return { data: { id } };
}

export async function clearHistory() {
  await prisma.scan.deleteMany();
  revalidatePath("/history");
  return { data: { cleared: true } };
}
