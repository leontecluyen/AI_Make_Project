import type { DecodeResult } from "./barcodeDetector";

let zbarReady: Promise<unknown> | null = null;

function getZBar() {
  if (!zbarReady) {
    zbarReady = import("@undecaf/zbar-wasm");
  }
  return zbarReady;
}

export async function decodeWithZBar(canvas: HTMLCanvasElement): Promise<DecodeResult | null> {
  try {
    const zbar = await getZBar() as {
      scanImageData: (data: ImageData) => Promise<Array<{ typeName: string; decode: () => string }>>;
    };
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const results = await zbar.scanImageData(imageData);
    if (results.length === 0) return null;
    const best = results[0];
    return {
      rawValue: best.decode(),
      barcodeType: best.typeName.toUpperCase().replace(/-/g, "_"),
      engine: "ZBar",
    };
  } catch {
    return null;
  }
}
