"use client";

import { useState, useEffect } from "react";
import { X, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { updateSettings } from "@/lib/actions/settingsActions";

interface SettingsPanelProps {
  initialDeviceId?: string | null;
  initialZoom?: number;
}

export function SettingsPanel({ initialDeviceId }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState(initialDeviceId ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => setCameras(devices.filter((d) => d.kind === "videoinput")))
      .catch(() => {});
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ cameraDeviceId: selectedCamera || null });
    setSaving(false);
    setOpen(false);
  };

  const cameraOptions = [
    { value: "", label: "デフォルト (背面カメラ)" },
    ...cameras.map((c) => ({ value: c.deviceId, label: c.label || `カメラ ${c.deviceId.slice(0, 6)}` })),
  ];

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label="設定">
        <Settings className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">設定</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Select
                id="camera-select"
                label="カメラデバイス"
                value={selectedCamera}
                options={cameraOptions}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>キャンセル</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
