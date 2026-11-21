import React, { useState } from 'react';
import { CarbonReportSummary } from '../types/carbon.ts';

interface EmissionsVisualsProps {
  report: CarbonReportSummary;
}

const MONTHS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];

export const EmissionsVisuals: React.FC<EmissionsVisualsProps> = ({ report }) => {
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  const sortedApps = [...report.apps]
    .sort((a, b) => b.totalGramsPerDay - a.totalGramsPerDay)
    .slice(0, 7);

  const maxAppGrams = Math.max(10, ...sortedApps.map((a) => a.totalGramsPerDay));

  const totalLayerGrams = Math.max(
    0.01,
    report.layerTotals.deviceGrams +
      report.layerTotals.networkGrams +
      report.layerTotals.cloudGrams
  );

  const devicePct = (report.layerTotals.deviceGrams / totalLayerGrams) * 100;
  const networkPct = (report.layerTotals.networkGrams / totalLayerGrams) * 100;
  const cloudPct = (report.layerTotals.cloudGrams / totalLayerGrams) * 100;

  // 12-Month Cumulative Trajectory Data (kg CO2e)
  const monthlyActiveKg = (report.dailyGramsCo2e * 30.416) / 1000;
  const monthlyBaselineKg = (report.baselineDailyGramsCo2e * 30.416) / 1000;
  const maxCumKg = Math.max(1, monthlyBaselineKg * 12);

  const svgW = 480;
  const svgH = 200;
  const padL = 42;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const pointsBaseline = MONTHS.map((_, idx) => {
    const x = padL + (idx / 11) * chartW;
    const val = monthlyBaselineKg * (idx + 1);
    const y = padT + chartH - (val / maxCumKg) * chartH;
    return { x, y, val };
  });

  const pointsActive = MONTHS.map((_, idx) => {
    const x = padL + (idx / 11) * chartW;
    const val = monthlyActiveKg * (idx + 1);
    const y = padT + chartH - (val / maxCumKg) * chartH;
    return { x, y, val };
  });

  const polylineStr = (pts: Array<{ x: number; y: number }>) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const areaPathActive =
    pointsActive.length > 0
      ? `M ${pointsActive[0].x.toFixed(1)} ${(padT + chartH).toFixed(1)} L ${pointsActive
          .map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(' L ')} L ${pointsActive[pointsActive.length - 1].x.toFixed(1)} ${(
          padT + chartH
        ).toFixed(1)} Z`
      : '';

  const hoveredApp = sortedApps.find((a) => a.appId === hoveredAppId) ?? null;

  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left 7 cols: Three-Layer App Attribution */}
      <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Three-Layer Emissions Attribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily footprint decomposed across client hardware, radio network, and cloud data centers
              </p>
            </div>

            {/* Layer Legend */}
            <div className="flex items-center gap-4 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-800" aria-hidden="true" />
                Device ({devicePct.toFixed(0)}%)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-teal-600" aria-hidden="true" />
                Network ({networkPct.toFixed(0)}%)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" aria-hidden="true" />
                Cloud ({cloudPct.toFixed(0)}%)
              </span>
            </div>
          </div>

          {sortedApps.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
              Add at least one mobile app to inspect three-layer attribution.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedApps.map((app) => {
                const totalW = (app.totalGramsPerDay / maxAppGrams) * 100;
                const dW =
                  app.totalGramsPerDay > 0
                    ? (app.deviceGramsPerDay / app.totalGramsPerDay) * totalW
                    : 0;
                const nW =
                  app.totalGramsPerDay > 0
                    ? (app.networkGramsPerDay / app.totalGramsPerDay) * totalW
                    : 0;
                const cW =
                  app.totalGramsPerDay > 0
                    ? (app.cloudGramsPerDay / app.totalGramsPerDay) * totalW
                    : 0;
                const isHovered = hoveredAppId === app.appId;

                return (
                  <div
                    key={app.appId}
                    onMouseEnter={() => setHoveredAppId(app.appId)}
                    onMouseLeave={() => setHoveredAppId(null)}
                    className={`rounded-lg px-2 py-1.5 transition-colors ${
                      isHovered ? 'bg-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-slate-800 truncate">{app.name}</span>
                        <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                          {app.categoryLabel}
                        </span>
                      </div>
                      <div className="font-mono tabular-nums text-slate-900 font-medium shrink-0 ml-2">
                        {app.totalGramsPerDay.toFixed(1)} g
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          ({app.sharePercent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-xs overflow-hidden flex">
                      <div
                        style={{ width: `${dW}%` }}
                        className="h-full bg-slate-800 transition-all duration-150"
                      />
                      <div
                        style={{ width: `${nW}%` }}
                        className="h-full bg-teal-600 transition-all duration-150"
                      />
                      <div
                        style={{ width: `${cW}%` }}
                        className="h-full bg-amber-500 transition-all duration-150"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Precision Readout Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono tabular-nums min-h-[28px]">
          {hoveredApp ? (
            <>
              <span className="text-slate-800 font-sans font-medium">{hoveredApp.name}:</span>
              <span>
                Device {hoveredApp.deviceGramsPerDay.toFixed(1)}g · Network{' '}
                {hoveredApp.networkGramsPerDay.toFixed(1)}g · Cloud{' '}
                {hoveredApp.cloudGramsPerDay.toFixed(1)}g · Intensity{' '}
                {hoveredApp.gramsPerHour.toFixed(1)} g/hr
              </span>
            </>
          ) : (
            <>
              <span>Layer daily totals:</span>
              <span>
                Device {report.layerTotals.deviceGrams.toFixed(1)}g · Network{' '}
                {report.layerTotals.networkGrams.toFixed(1)}g · Cloud{' '}
                {report.layerTotals.cloudGrams.toFixed(1)}g
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right 5 cols: 12-Month Cumulative Trajectory */}
      <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                12-Month Cumulative Trajectory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Baseline profile vs active reduction levers (kg CO₂e)
              </p>
            </div>
            <div className="text-right font-mono tabular-nums text-[11px] text-slate-500 shrink-0">
              {hoveredMonthIdx !== null ? (
                <div>
                  <span className="text-slate-900 font-semibold">
                    Month {hoveredMonthIdx + 1}: {pointsActive[hoveredMonthIdx].val.toFixed(1)} kg
                  </span>
                  {report.savedDailyGramsCo2e > 0.05 && (
                    <div className="text-teal-700">
                      vs {pointsBaseline[hoveredMonthIdx].val.toFixed(1)} kg base
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-slate-900 font-semibold">
                    Yr Total: {report.annualKgCo2e.toFixed(1)} kg
                  </span>
                  {report.savedDailyGramsCo2e > 0.05 && (
                    <div className="text-teal-700">
                      -{report.savedAnnualKgCo2e.toFixed(1)} kg saved
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-auto overflow-visible cursor-crosshair"
              role="img"
              aria-label="12-month cumulative carbon trajectory chart"
            >
              {/* Horizontal Y Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = padT + chartH - frac * chartH;
                const labelVal = maxCumKg * frac;
                return (
                  <g key={frac}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[9px] font-mono"
                    >
                      {labelVal.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Area under active curve */}
              <path d={areaPathActive} fill="rgba(15, 118, 110, 0.08)" />

              {/* Baseline dashed curve (when levers reduce emissions) */}
              {report.savedDailyGramsCo2e > 0.05 && (
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                  points={polylineStr(pointsBaseline)}
                />
              )}

              {/* Active solid curve */}
              <polyline
                fill="none"
                stroke="#0f766e"
                strokeWidth="2.25"
                points={polylineStr(pointsActive)}
              />

              {/* Hover Crosshair & Interactive Month Hit Columns */}
              {MONTHS.map((m, idx) => {
                const pt = pointsActive[idx];
                const basePt = pointsBaseline[idx];
                const isHover = hoveredMonthIdx === idx;
                const colWidth = chartW / 11;
                return (
                  <g
                    key={m}
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                  >
                    <rect
                      x={pt.x - colWidth / 2}
                      y={padT}
                      width={colWidth}
                      height={chartH + padB}
                      fill="transparent"
                    />
                    {isHover && (
                      <line
                        x1={pt.x}
                        y1={padT}
                        x2={pt.x}
                        y2={padT + chartH}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                      />
                    )}
                    {isHover && report.savedDailyGramsCo2e > 0.05 && (
                      <circle cx={basePt.x} cy={basePt.y} r="3.5" fill="#94a3b8" />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHover ? 4.5 : 2.5}
                      fill="#0f766e"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    {(idx === 0 || idx === 2 || idx === 5 || idx === 8 || idx === 11) && (
                      <text
                        x={pt.x}
                        y={svgH - 6}
                        textAnchor="middle"
                        className="fill-slate-400 text-[9px] font-mono"
                      >
                        {m}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-teal-700 inline-block" aria-hidden="true" />
              Active scenario
            </span>
            {report.savedDailyGramsCo2e > 0.05 && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" aria-hidden="true" />
                Unoptimized baseline
              </span>
            )}
          </div>
          <span className="font-mono tabular-nums">Hover months to inspect</span>
        </div>
      </div>
    </section>
  );
};
