import React, { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import {
  DEVICE_SPECS,
  GRID_PRESETS,
  NETWORK_SPECS,
  PRESET_PROFILES,
} from '../lib/carbonModel.ts';
import {
  DeviceTierId,
  NetworkMixId,
  OptimizationLevers,
  SimulationConfig,
} from '../types/carbon.ts';

interface CalibrationSidebarProps {
  config: SimulationConfig;
  activePresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  onChangeConfig: (next: SimulationConfig) => void;
  onParseUsage: (rawText: string) => Promise<void>;
  isParsingUsage: boolean;
  parseError: string | null;
  parseSuccessNote: string | null;
  onResetDefaults: () => void;
}

const LEVER_OPTIONS: Array<{
  key: keyof OptimizationLevers;
  label: string;
  effectText: string;
}> = [
  {
    key: 'capVideo720p',
    label: 'Cap Mobile Video at 720p',
    effectText: '-56% stream data & -35% transcode',
  },
  {
    key: 'oledDarkMode',
    label: 'OLED Dark Mode UI',
    effectText: '-24% display draw on UI apps',
  },
  {
    key: 'disableAutoplay',
    label: 'Disable Feed Autoplay',
    effectText: '-18% passive media prefetch',
  },
  {
    key: 'restrictBackgroundSync',
    label: 'Restrict Background Refresh',
    effectText: 'Zero idle cellular polling',
  },
];

export const CalibrationSidebar: React.FC<CalibrationSidebarProps> = ({
  config,
  activePresetId,
  onSelectPreset,
  onChangeConfig,
  onParseUsage,
  isParsingUsage,
  parseError,
  parseSuccessNote,
  onResetDefaults,
}) => {
  const [usageInput, setUsageInput] = useState('');

  const handleGridPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = GRID_PRESETS.find((g) => g.id === e.target.value);
    if (preset) {
      onChangeConfig({
        ...config,
        gridIntensityGPerKwh: preset.gCo2PerKwh,
        gridRegionLabel: preset.label,
      });
    }
  };

  const handleCustomGridSlider = (value: number) => {
    const exactMatch = GRID_PRESETS.find((g) => g.gCo2PerKwh === value);
    onChangeConfig({
      ...config,
      gridIntensityGPerKwh: value,
      gridRegionLabel: exactMatch ? exactMatch.label : 'Custom Grid Mix',
    });
  };

  const toggleLever = (key: keyof OptimizationLevers) => {
    onChangeConfig({
      ...config,
      levers: {
        ...config.levers,
        [key]: !config.levers[key],
      },
    });
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageInput.trim()) return;
    await onParseUsage(usageInput);
  };

  const selectedGridPreset =
    GRID_PRESETS.find((g) => g.gCo2PerKwh === config.gridIntensityGPerKwh)?.id ?? 'custom';

  return (
    <aside className="w-full lg:w-[360px] shrink-0 space-y-6">
      {/* AI Natural Language / Screen Time Importer */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-sm font-semibold text-slate-900">AI Screen Time Parser</h2>
          <button
            type="button"
            onClick={() =>
              setUsageInput(
                '1h 45m TikTok on 5G commute, 50m YouTube 1080p, 35m Instagram, 25m ChatGPT, 40m Spotify, 20m Google Maps'
              )
            }
            className="text-xs font-medium text-teal-700 hover:text-teal-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Insert sample
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Paste an iOS Screen Time / Android Digital Wellbeing summary or describe your daily mobile habits.
        </p>

        <form onSubmit={handleImportSubmit} className="space-y-3">
          <textarea
            value={usageInput}
            onChange={(e) => setUsageInput(e.target.value)}
            rows={3}
            placeholder="e.g. 2h TikTok on 5G, 45m YouTube, 30m Maps, 20m ChatGPT..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:outline-none"
          />

          {parseError && (
            <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {parseError}
            </p>
          )}
          {parseSuccessNote && !parseError && (
            <p className="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
              {parseSuccessNote}
            </p>
          )}

          <button
            type="submit"
            disabled={isParsingUsage || usageInput.trim().length < 3}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {isParsingUsage ? 'Extracting App Telemetry...' : 'Parse & Estimate Usage'}
          </button>
        </form>
      </section>

      {/* Scenario Presets */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Usage Profiles</h2>
          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRESET_PROFILES.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                  active
                    ? 'border-teal-700 bg-teal-50/70 text-slate-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">{preset.label}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Hardware, Network & Grid Calibration */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Hardware & Grid Calibration</h2>

        {/* Device Class */}
        <div>
          <label htmlFor="device-tier-select" className="block text-xs font-medium text-slate-700 mb-1.5">
            Mobile Device Class
          </label>
          <select
            id="device-tier-select"
            value={config.deviceTier}
            onChange={(e) =>
              onChangeConfig({ ...config, deviceTier: e.target.value as DeviceTierId })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
          >
            {Object.values(DEVICE_SPECS).map((device) => (
              <option key={device.id} value={device.id}>
                {device.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1.5">
            {DEVICE_SPECS[config.deviceTier].notes}
          </p>
        </div>

        {/* Network Mix Segmented Control */}
        <div>
          <span className="block text-xs font-medium text-slate-700 mb-1.5">
            Network Transmission Mix
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
            {(Object.keys(NETWORK_SPECS) as NetworkMixId[]).map((mixId) => {
              const spec = NETWORK_SPECS[mixId];
              const isSelected = config.networkMix === mixId;
              return (
                <button
                  key={mixId}
                  type="button"
                  onClick={() => onChangeConfig({ ...config, networkMix: mixId })}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spec.shortLabel}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
            <span>Transmission overhead</span>
            <span className="font-mono tabular-nums text-slate-700">
              {NETWORK_SPECS[config.networkMix].whPerGb.toFixed(0)} Wh/GB
            </span>
          </div>
        </div>

        {/* Regional Grid Carbon Intensity */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="grid-region-select" className="text-xs font-medium text-slate-700">
              Electricity Grid Intensity
            </label>
            <span className="font-mono tabular-nums text-xs font-semibold text-slate-900">
              {config.gridIntensityGPerKwh} gCO₂/kWh
            </span>
          </div>

          <select
            id="grid-region-select"
            value={selectedGridPreset}
            onChange={handleGridPresetChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:outline-none mb-2.5"
          >
            {GRID_PRESETS.map((grid) => (
              <option key={grid.id} value={grid.id}>
                {grid.label} ({grid.gCo2PerKwh} g/kWh)
              </option>
            ))}
            {selectedGridPreset === 'custom' && (
              <option value="custom">Custom Grid Intensity ({config.gridIntensityGPerKwh} g/kWh)</option>
            )}
          </select>

          <input
            type="range"
            aria-label="Custom grid carbon intensity in grams CO2 per kilowatt-hour"
            min={20}
            max={850}
            step={5}
            value={config.gridIntensityGPerKwh}
            onChange={(e) => handleCustomGridSlider(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400 mt-1">
            <span>20 g (Hydro)</span>
            <span>436 g (Global)</span>
            <span>850 g (Coal)</span>
          </div>
        </div>
      </section>

      {/* Reduction Simulation Levers */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Reduction Levers</h2>
        <p className="text-xs text-slate-500 mb-4">
          Toggle device and streaming policies to measure real-time footprint savings.
        </p>

        <div className="divide-y divide-slate-100">
          {LEVER_OPTIONS.map((item) => {
            const enabled = config.levers[item.key];
            return (
              <label
                key={item.key}
                className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0 cursor-pointer"
              >
                <div>
                  <div className="text-xs font-medium text-slate-800">{item.label}</div>
                  <div className="text-[11px] text-slate-500">{item.effectText}</div>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleLever(item.key)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </section>
    </aside>
  );
};
