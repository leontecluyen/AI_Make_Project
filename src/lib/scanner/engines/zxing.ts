import type { DecodeResult } from "./barcodeDetector";

let readerPromise: Promise<unknown> | null = null;

async function getReader() {
  if (!readerPromise) {
    readerPromise = import("@zxing/library").then(({ MultiFormatReader, DecodeHintType, BarcodeFormat }) => {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.AZTEC,
        BarcodeFormat.PDF_417, BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93, BarcodeFormat.CODABAR, BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8, BarcodeFormat.ITF, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      const reader = new MultiFormatReader();
      reader.setHints(hints);
      return reader;
    });
  }
  return readerPromise;
}

export async function decodeWithZXing(canvas: HTMLCanvasElement): Promise<DecodeResult | null> {
  try {
    const { BinaryBitmap, HybridBinarizer, HTMLCanvasElementLuminanceSource } =
      await import("@zxing/library");
    const reader = await getReader() as { decode: (bmp: unknown) => { getText: () => string; getBarcodeFormat: () => unknown } };

    const source = new HTMLCanvasElementLuminanceSource(canvas);
    const bitmap = new BinaryBitmap(new HybridBinarizer(source));
    const result = reader.decode(bitmap);

    const { BarcodeFormat } = await import("@zxing/library");
    const formatKey = Object.entries(BarcodeFormat).find(
      ([, v]) => v === result.getBarcodeFormat()
    )?.[0] ?? "UNKNOWN";

    return {
      rawValue: result.getText(),
      barcodeType: formatKey,
      engine: "ZXing",
    };
  } catch {
    return null;
  }
}
