export interface DecodeResult {
  rawValue: string;
  barcodeType: string;
  engine: string;
}

export async function decodeWithBarcodeDetector(
  source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap
): Promise<DecodeResult | null> {
  if (!("BarcodeDetector" in window)) return null;
  try {
    // @ts-expect-error BarcodeDetector is not in TS lib yet
    const detector = new window.BarcodeDetector({
      formats: [
        "qr_code", "aztec", "code_128", "code_39", "code_93",
        "codabar", "data_matrix", "ean_13", "ean_8",
        "itf", "pdf417", "upc_a", "upc_e",
      ],
    });
    const results: Array<{ rawValue: string; format: string }> = await detector.detect(source);
    if (results.length === 0) return null;
    const best = results[0];
    return {
      rawValue: best.rawValue,
      barcodeType: best.format.toUpperCase().replace(/-/g, "_"),
      engine: "BarcodeDetector",
    };
  } catch {
    return null;
  }
}
