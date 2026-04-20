import { z } from "zod";

export const updateSettingsSchema = z.object({
  continuousScan: z.boolean().optional(),
  waitIntervalMs: z.number().int().min(0).optional(),
  cameraDeviceId: z.string().nullable().optional(),
  zoomLevel: z.number().min(1).max(10).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
