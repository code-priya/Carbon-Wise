import React, { useMemo, useState } from 'react';
import { AIAuditPanel } from './components/AIAuditPanel.tsx';
import { AppBreakdownTable } from './components/AppBreakdownTable.tsx';
import { CalibrationSidebar } from './components/CalibrationSidebar.tsx';
import { EmissionsVisuals } from './components/EmissionsVisuals.tsx';
import { MethodologySection } from './components/MethodologySection.tsx';
import { TelemetryOverview } from './components/TelemetryOverview.tsx';
import { TopBar } from './components/TopBar.tsx';
import {
  DEFAULT_CONFIG,
  PRESET_PROFILES,
  calculateCarbonReport,
} from './lib/carbonModel.ts';
import {
  AIAuditResult,
  AIParseResult,
  MobileAppEntry,
  ReductionAction,
  SimulationConfig,
} from './types/carbon.ts';

export default function App() {
  const initialPreset = PRESET_PROFILES[0];

  const [config, setConfig] = useState<SimulationConfig>({
    ...DEFAULT_CONFIG,
    networkMix: initialPreset.networkMix,
  });
  const [apps, setApps] = useState<MobileAppEntry[]>(initialPreset.apps);
  const [activePresetId, setActivePresetId] = useState<string | null>(initialPreset.id);

  // AI Screen Time Parser state
  const [isParsingUsage, setIsParsingUsage] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccessNote, setParseSuccessNote] = useState<string | null>(null);

  // AI Carbon Audit state
  const [audit, setAudit] = useState<AIAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [appliedActionIds, setAppliedActionIds] = useState<string[]>([]);

  const report = useMemo(() => calculateCarbonReport(apps, config), [apps, config]);

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_PROFILES.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setApps(preset.apps.map((a) => ({ ...a })));
    setConfig((prev) => ({
      ...prev,
      networkMix: preset.networkMix,
    }));
    setParseError(null);
    setParseSuccessNote(null);
    setAppliedActionIds([]);
  };

  const handleResetDefaults = () => {
    setConfig({
      ...DEFAULT_CONFIG,
      networkMix: initialPreset.networkMix,
      levers: { ...DEFAULT_CONFIG.levers },
    });
    setApps(initialPreset.apps.map((a) => ({ ...a })));
    setActivePresetId(initialPreset.id);
    setParseError(null);
    setParseSuccessNote(null);
    setAudit(null);
    setAuditError(null);
    setAppliedActionIds([]);
  };

  const handleUpdateMinutes = (appId: string, minutes: number) => {
    setActivePresetId(null);
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, minutesPerDay: Math.max(0, Math.min(480, minutes)) } : a
      )
    );
  };

  const handleToggleBackground = (appId: string) => {
    setActivePresetId(null);
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, backgroundPolling: !a.backgroundPolling } : a
      )
    );
  };

  const handleRemoveApp = (appId: string) => {
    setActivePresetId(null);
    setApps((prev) => prev.filter((a) => a.id !== appId));
  };

  const handleAddApp = (entry: Omit<MobileAppEntry, 'id'>) => {
    setActivePresetId(null);
    const id = `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setApps((prev) => [...prev, { ...entry, id }]);
  };

  const handleParseUsage = async (rawText: string) => {
    setIsParsingUsage(true);
    setParseError(null);
    setParseSuccessNote(null);

    try {
      const response = await fetch('/api/parse-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse screen time summary.');
      }

      const parsed = data as AIParseResult;
      if (!parsed.apps || parsed.apps.length === 0) {
        throw new Error('No mobile apps were detected in that summary. Try listing app names and durations.');
      }

      const nextApps: MobileAppEntry[] = parsed.apps.map((item, idx) => ({
        id: `parsed-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category,
        minutesPerDay: Math.max(1, Math.min(480, Math.round(item.minutesPerDay))),
        backgroundPolling: item.category !== 'gaming' && item.category !== 'video-call',
      }));

      setApps(nextApps);
      setActivePresetId(null);
      setAppliedActionIds([]);
      if (parsed.detectedNetworkHint) {
        setConfig((prev) => ({ ...prev, networkMix: parsed.detectedNetworkHint! }));
      }
      setParseSuccessNote(
        parsed.summaryNote || `Imported ${nextApps.length} mobile apps from summary.`
      );
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Unable to parse screen time text.');
    } finally {
      setIsParsingUsage(false);
    }
  };

  const handleRunAudit = async () => {
    const auditSection = document.getElementById('ai-audit');
    if (auditSection) {
      auditSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (apps.length === 0) {
      setAuditError('Add at least one mobile app before running an AI carbon audit.');
      return;
    }

    setIsAuditing(true);
    setAuditError(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, report }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI audit request failed.');
      }

      setAudit(data as AIAuditResult);
      setAppliedActionIds([]);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Unable to run AI audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyAction = (action: ReductionAction) => {
    if (action.leverKey) {
      setConfig((prev) => ({
        ...prev,
        levers: {
          ...prev.levers,
          [action.leverKey!]: true,
        },
      }));
    }

    if (action.suggestedMinutesReduction) {
      const targetName = action.suggestedMinutesReduction.appName.toLowerCase();
      const reduceBy = Math.max(0, action.suggestedMinutesReduction.reduceByMinutes);
      setApps((prev) =>
        prev.map((app) =>
          app.name.toLowerCase().includes(targetName) ||
          targetName.includes(app.name.toLowerCase())
            ? { ...app, minutesPerDay: Math.max(5, app.minutesPerDay - reduceBy) }
            : app
        )
      );
      setActivePresetId(null);
    }

    setAppliedActionIds((prev) => (prev.includes(action.id) ? prev : [...prev, action.id]));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar onRunAudit={handleRunAudit} isAuditing={isAuditing} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          <CalibrationSidebar
            config={config}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            onChangeConfig={setConfig}
            onParseUsage={handleParseUsage}
            isParsingUsage={isParsingUsage}
            parseError={parseError}
            parseSuccessNote={parseSuccessNote}
            onResetDefaults={handleResetDefaults}
          />

          <div className="flex-1 min-w-0 w-full space-y-6">
            <TelemetryOverview
              report={report}
              config={config}
              appCount={apps.length}
            />

            <EmissionsVisuals report={report} />

            <AppBreakdownTable
              apps={apps}
              breakdowns={report.apps}
              onUpdateMinutes={handleUpdateMinutes}
              onToggleBackground={handleToggleBackground}
              onRemoveApp={handleRemoveApp}
              onAddApp={handleAddApp}
            />

            <AIAuditPanel
              audit={audit}
              isLoading={isAuditing}
              error={auditError}
              activeLevers={config.levers}
              appliedActionIds={appliedActionIds}
              onRunAudit={handleRunAudit}
              onApplyAction={handleApplyAction}
            />

            <MethodologySection />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>CarbonWise · Mobile App Carbon Footprint Estimator</span>
          <span>Three-layer operational model: Device + Network + Cloud</span>
        </div>
      </footer>
    </div>
  );
}
