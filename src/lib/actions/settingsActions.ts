"use server";

import { prisma } from "@/lib/db/prisma";
import { updateSettingsSchema } from "@/lib/validations/settingsSchema";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const settings = await prisma.appSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return { data: settings };
}

export async function updateSettings(data: unknown) {
  const parsed = updateSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const settings = await prisma.appSetting.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });
  revalidatePath("/");
  return { data: settings };
}
