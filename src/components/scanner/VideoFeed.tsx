"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { ScannerOverlay } from "./ScannerOverlay";

interface VideoFeedProps {
  className?: string;
  isScanning: boolean;
}

export const VideoFeed = forwardRef<HTMLVideoElement, VideoFeedProps>(
  ({ className, isScanning }, ref) => (
    <div className={clsx("relative overflow-hidden rounded-xl bg-black", className)}>
      <video
        ref={ref}
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover"
      />
      {isScanning && <ScannerOverlay />}
    </div>
  )
);
VideoFeed.displayName = "VideoFeed";
