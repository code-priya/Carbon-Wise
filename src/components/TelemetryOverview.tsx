import React from 'react';
import { DEVICE_SPECS, NETWORK_SPECS, formatMinutes } from '../lib/carbonModel.ts';
import { CarbonReportSummary, SimulationConfig } from '../types/carbon.ts';

interface TelemetryOverviewProps {
  report: CarbonReportSummary;
  config: SimulationConfig;
  appCount: number;
}

export const TelemetryOverview: React.FC<TelemetryOverviewProps> = ({
  report,
  config,
  appCount,
}) => {
  const hasSavings = report.savedDailyGramsCo2e > 0.05;
  const savingsPct =
    report.baselineDailyGramsCo2e > 0
      ? (report.savedDailyGramsCo2e / report.baselineDailyGramsCo2e) * 100
      : 0;

  return (
    <section id="estimator" className="space-y-6">
      {/* Page Title & Clean Unboxed Metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Mobile App Carbon Footprint Telemetry
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
            <span>{appCount} tracked apps</span>
            <span aria-hidden="true">·</span>
            <span>{formatMinutes(report.totalMinutesPerDay)} daily screen time</span>
            <span aria-hidden="true">·</span>
            <span>{DEVICE_SPECS[config.deviceTier].shortLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{NETWORK_SPECS[config.networkMix].shortLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{config.gridRegionLabel}</span>
          </div>
        </div>

        {hasSavings && (
          <div className="text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 whitespace-nowrap shrink-0">
            Active levers save{' '}
            <span className="font-mono tabular-nums font-semibold">
              {report.savedDailyGramsCo2e.toFixed(1)} g/day
            </span>{' '}
            (<span className="font-mono tabular-nums">-{savingsPct.toFixed(1)}%</span>)
          </div>
        )}
      </div>

      {/* 4-Column Full-Width KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-5">
          <div className="text-xs font-medium text-slate-500">Daily Carbon Footprint</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900">
              {report.dailyGramsCo2e.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500">g CO₂e / day</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {hasSavings
              ? `Baseline ${report.baselineDailyGramsCo2e.toFixed(1)} g/day`
              : `${(report.dailyGramsCo2e * 30.4 / 1000).toFixed(2)} kg CO₂e / mo`}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500">Annual Projection</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900">
              {report.annualKgCo2e.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500">kg CO₂e / yr</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {hasSavings
              ? `-${report.savedAnnualKgCo2e.toFixed(1)} kg/yr with levers`
              : `~${report.equivalents.carKmPerYear.toFixed(0)} km petrol driving`}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500">Total Energy Demand</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900">
              {report.totalWhPerDay.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500">Wh / day</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {((report.totalWhPerDay * 365) / 1000).toFixed(1)} kWh / yr total draw
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500">Monthly Data Transfer</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900">
              {report.totalDataGbPerMonth.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500">GB / mo</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {(report.totalDataMbPerDay / 1024).toFixed(2)} GB / day across {appCount} apps
          </div>
        </div>
      </div>

      {/* Physical Equivalents Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-slate-600">Annual full smartphone charges</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {Math.round(report.equivalents.phoneChargesPerYear).toLocaleString()} charges
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-slate-600">9W LED bulb runtime equivalent</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {Math.round(report.equivalents.ledBulbHoursPerYear).toLocaleString()} hrs/yr
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-slate-600">Tree carbon absorption offset</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {report.equivalents.treeMonthsPerYear.toFixed(1)} tree-months/yr
          </span>
        </div>
      </div>
    </section>
  );
};
