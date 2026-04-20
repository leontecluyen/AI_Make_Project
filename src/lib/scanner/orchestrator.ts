import { decodeWithBarcodeDetector, type DecodeResult } from "./engines/barcodeDetector";
import { decodeWithZXing } from "./engines/zxing";
import { decodeWithZBar } from "./engines/zbarWasm";

type EngineKey = "BarcodeDetector" | "ZXing" | "ZBar";

export interface OrchestratorOptions {
  continuousScan: boolean;
  waitIntervalMs: number;
  onResult: (result: DecodeResult) => void;
  onError?: (err: unknown) => void;
}

export class ScanOrchestrator {
  private rafId: number | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private frameCount = 0;
  private lastEngine: EngineKey | null = null;
  private lastScanTime = 0;
  private opts: OrchestratorOptions;
  private running = false;

  constructor(video: HTMLVideoElement, opts: OrchestratorOptions) {
    this.video = video;
    this.opts = opts;
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Could not get 2D canvas context");
    this.ctx = ctx;
  }

  start() {
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  updateOptions(opts: Partial<OrchestratorOptions>) {
    this.opts = { ...this.opts, ...opts };
  }

  private loop() {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(async () => {
      await this.processFrame();
      if (this.running) this.loop();
    });
  }

  private async processFrame() {
    const { continuousScan, waitIntervalMs } = this.opts;
    this.frameCount++;

    // In single-scan mode, skip every 2nd frame for performance
    if (!continuousScan && this.frameCount % 3 !== 0) return;

    // Enforce wait interval in continuous mode
    if (continuousScan && waitIntervalMs > 0) {
      if (Date.now() - this.lastScanTime < waitIntervalMs) return;
    }

    if (this.video.readyState < 2) return;

    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.ctx.drawImage(this.video, 0, 0);

    const result = await this.runEngines();
    if (result) {
      this.lastEngine = result.engine as EngineKey;
      this.lastScanTime = Date.now();
      this.opts.onResult(result);
    }
  }

  private async runEngines(): Promise<DecodeResult | null> {
    const engines: Array<() => Promise<DecodeResult | null>> = [];

    // Preferred engine first
    if (this.lastEngine === "BarcodeDetector") {
      engines.push(() => decodeWithBarcodeDetector(this.canvas));
      engines.push(() => decodeWithZXing(this.canvas));
      engines.push(() => decodeWithZBar(this.canvas));
    } else if (this.lastEngine === "ZXing") {
      engines.push(() => decodeWithZXing(this.canvas));
      engines.push(() => decodeWithBarcodeDetector(this.canvas));
      engines.push(() => decodeWithZBar(this.canvas));
    } else if (this.lastEngine === "ZBar") {
      engines.push(() => decodeWithZBar(this.canvas));
      engines.push(() => decodeWithBarcodeDetector(this.canvas));
      engines.push(() => decodeWithZXing(this.canvas));
    } else {
      engines.push(() => decodeWithBarcodeDetector(this.canvas));
      engines.push(() => decodeWithZXing(this.canvas));
      engines.push(() => decodeWithZBar(this.canvas));
    }

    for (const engine of engines) {
      try {
        const result = await engine();
        if (result) return result;
      } catch (e) {
        this.opts.onError?.(e);
      }
    }
    return null;
  }
}
