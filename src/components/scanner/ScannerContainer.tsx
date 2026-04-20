"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { VideoFeed } from "./VideoFeed";
import { ZoomControl } from "./ZoomControl";
import { ScannerControls } from "./ScannerControls";
import { ScanResult } from "./ScanResult";
import { AITable } from "./AITable";
import { ScanOrchestrator } from "@/lib/scanner/orchestrator";
import type { DecodeResult } from "@/lib/scanner/engines/barcodeDetector";
import { parseGS1, isGS1Barcode } from "@/lib/scanner/gs1Parser";
import type { AIRow } from "@/lib/scanner/gs1Parser";
import { saveScan } from "@/lib/actions/scanActions";

interface AppSettingProps {
  continuousScan: boolean;
  waitIntervalMs: number;
  cameraDeviceId: string | null;
  zoomLevel: number;
}

export function ScannerContainer({ initialSettings }: { initialSettings: AppSettingProps }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const orchestratorRef = useRef<ScanOrchestrator | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [continuousScan, setContinuousScan] = useState(initialSettings.continuousScan);
  const [waitIntervalMs, setWaitIntervalMs] = useState(initialSettings.waitIntervalMs);
  const [zoom, setZoom] = useState(initialSettings.zoomLevel);
  const [lastResult, setLastResult] = useState<DecodeResult | null>(null);
  const [aiRows, setAiRows] = useState<AIRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stopScanning = useCallback(() => {
    orchestratorRef.current?.stop();
    orchestratorRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
  }, []);

  const handleResult = useCallback(async (result: DecodeResult) => {
    setLastResult(result);
    const gs1Rows = isGS1Barcode(result.barcodeType) ? parseGS1(result.rawValue) : [];
    setAiRows(gs1Rows);
    await saveScan({
      rawValue: result.rawValue,
      barcodeType: result.barcodeType,
      engine: result.engine,
      aiData: gs1Rows.length > 0 ? JSON.stringify(gs1Rows) : undefined,
    });
    if (!continuousScan) {
      stopScanning();
    }
  }, [continuousScan, stopScanning]);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: initialSettings.cameraDeviceId
            ? { ideal: initialSettings.cameraDeviceId }
            : undefined,
          facingMode: initialSettings.cameraDeviceId ? undefined : { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Apply zoom via track constraints if supported (Chrome/Edge)
      if (zoom !== 1) {
        try {
          const track = stream.getVideoTracks()[0];
          await track.applyConstraints({ advanced: [{ zoom } as MediaTrackConstraintSet] });
        } catch { /* zoom not supported — ignored */ }
      }

      orchestratorRef.current = new ScanOrchestrator(videoRef.current!, {
        continuousScan,
        waitIntervalMs,
        onResult: handleResult,
        onError: (e) => console.error("Scanner error:", e),
      });
      orchestratorRef.current.start();
      setIsScanning(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "カメラの起動に失敗しました");
    }
  }, [continuousScan, waitIntervalMs, zoom, initialSettings.cameraDeviceId, handleResult]);

  // Keep orchestrator in sync with settings changes
  useEffect(() => {
    orchestratorRef.current?.updateOptions({ continuousScan, waitIntervalMs });
  }, [continuousScan, waitIntervalMs]);

  // Cleanup on unmount
  useEffect(() => () => stopScanning(), [stopScanning]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="relative">
        <VideoFeed
          ref={videoRef}
          isScanning={isScanning}
          className="aspect-video w-full max-h-72 md:max-h-96"
        />
        <div className="absolute bottom-3 right-3">
          <ZoomControl zoom={zoom} onZoomChange={setZoom} />
        </div>
      </div>

      <ScannerControls
        isScanning={isScanning}
        continuousScan={continuousScan}
        waitIntervalMs={waitIntervalMs}
        onToggleScan={isScanning ? stopScanning : startScanning}
        onContinuousChange={setContinuousScan}
        onWaitIntervalChange={setWaitIntervalMs}
      />

      <ScanResult result={lastResult} />

      <AITable rows={aiRows} />
    </div>
  );
}
