import { getSettings } from "@/lib/actions/settingsActions";
import { ScannerContainer } from "@/components/scanner/ScannerContainer";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default async function ScannerPage() {
  const { data: settings } = await getSettings();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">スキャナー</h1>
        <SettingsPanel
          initialDeviceId={settings?.cameraDeviceId}
          initialZoom={settings?.zoomLevel}
        />
      </div>

      <ScannerContainer
        initialSettings={{
          continuousScan: settings?.continuousScan ?? false,
          waitIntervalMs: settings?.waitIntervalMs ?? 0,
          cameraDeviceId: settings?.cameraDeviceId ?? null,
          zoomLevel: settings?.zoomLevel ?? 1,
        }}
      />
    </div>
  );
}
