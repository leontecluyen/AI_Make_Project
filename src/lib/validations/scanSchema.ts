import { z } from "zod";

export const createScanSchema = z.object({
  rawValue: z.string().min(1),
  barcodeType: z.string().min(1),
  aiData: z.string().optional(),
  sessionTag: z.string().optional(),
  engine: z.string().min(1),
});

export const scanQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.string().optional(),
});

export type CreateScanInput = z.infer<typeof createScanSchema>;
export type ScanQuery = z.infer<typeof scanQuerySchema>;
