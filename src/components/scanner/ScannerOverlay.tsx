"use client";

export function ScannerOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Semi-transparent mask */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Viewfinder cutout */}
      <div className="relative z-10 h-52 w-72">
        {/* Corners */}
        {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((corner) => (
          <svg
            key={corner}
            className={`absolute h-8 w-8 text-white ${
              corner === "top-left" ? "left-0 top-0" :
              corner === "top-right" ? "right-0 top-0 rotate-90" :
              corner === "bottom-left" ? "bottom-0 left-0 -rotate-90" :
              "bottom-0 right-0 rotate-180"
            }`}
            viewBox="0 0 32 32"
            fill="none"
          >
            <path d="M2 30 L2 2 L30 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ))}

        {/* Scan line animation */}
        <div className="absolute left-1 right-1 top-0 h-0.5 animate-[scanline_2s_ease-in-out_infinite] bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.6)]" />
      </div>

      <style>{`
        @keyframes scanline {
          0%, 100% { top: 4px; }
          50% { top: calc(100% - 4px); }
        }
      `}</style>
    </div>
  );
}
