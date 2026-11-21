import React from 'react';
import { ArrowRight, Check, RefreshCw } from 'lucide-react';
import {
  AIAuditResult,
  OptimizationLevers,
  ReductionAction,
} from '../types/carbon.ts';

interface AIAuditPanelProps {
  audit: AIAuditResult | null;
  isLoading: boolean;
  error: string | null;
  activeLevers: OptimizationLevers;
  appliedActionIds: string[];
  onRunAudit: () => void;
  onApplyAction: (action: ReductionAction) => void;
}

export const AIAuditPanel: React.FC<AIAuditPanelProps> = ({
  audit,
  isLoading,
  error,
  activeLevers,
  appliedActionIds,
  onRunAudit,
  onApplyAction,
}) => {
  return (
    <section id="ai-audit" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            AI Carbon Efficiency Audit & Reduction Plan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated from your live three-layer telemetry, radio mix, and regional electricity grid intensity
          </p>
        </div>

        <button
          type="button"
          onClick={onRunAudit}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {isLoading ? 'Analyzing Footprint...' : audit ? 'Refresh AI Audit' : 'Run AI Audit'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800"
        >
          <div className="font-semibold">Unable to complete AI audit</div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="mt-5 space-y-4 animate-pulse" aria-busy="true">
          <div className="h-5 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="h-32 bg-slate-100 rounded-lg" />
            <div className="h-32 bg-slate-100 rounded-lg" />
            <div className="h-32 bg-slate-100 rounded-lg" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !audit && !error && (
        <div className="py-10 text-center max-w-lg mx-auto">
          <p className="text-sm font-medium text-slate-900">
            Ready to diagnose your mobile carbon hotspots
          </p>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Run an AI audit to pinpoint whether device screens, 5G radio transmission, or cloud inference dominates your footprint and receive one-click optimization actions.
          </p>
          <button
            type="button"
            onClick={onRunAudit}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Run AI Audit
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Populated Audit Results */}
      {!isLoading && audit && (
        <div className="mt-5 space-y-6">
          {/* Diagnosis & Hotspot Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-[11px] font-semibold text-slate-500">Executive Diagnosis</div>
              <p className="mt-1.5 text-sm font-medium text-slate-900 leading-relaxed">
                {audit.headlineDiagnosis}
              </p>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {audit.efficiencyGradeContext}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-[11px] font-semibold text-slate-500">Primary Hotspot</div>
              <p className="mt-1.5 text-xs text-slate-800 leading-relaxed">
                {audit.primaryHotspot}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                {audit.behavioralInsight}
              </div>
            </div>
          </div>

          {/* Prioritized Reduction Actions */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 mb-3">
              Prioritized Reduction Actions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audit.prioritizedActions.map((action) => {
                const isLeverAlreadyActive = action.leverKey
                  ? activeLevers[action.leverKey]
                  : false;
                const isApplied =
                  isLeverAlreadyActive || appliedActionIds.includes(action.id);
                const canApply = Boolean(
                  action.leverKey || action.suggestedMinutesReduction
                );

                return (
                  <div
                    key={action.id}
                    className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between gap-3 bg-white"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-900">
                          {action.title}
                        </h4>
                        <span className="font-mono tabular-nums text-xs font-semibold text-teal-800 shrink-0">
                          -{action.dailySavingsGrams.toFixed(1)} g/day
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{action.targetAppOrScope}</span>
                        <span aria-hidden="true">·</span>
                        <span>{action.effortLevel} effort</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          -{action.annualSavingsKg.toFixed(1)} kg/yr
                        </span>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                        {action.rationale}
                      </p>
                    </div>

                    {canApply && (
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          disabled={isApplied}
                          onClick={() => onApplyAction(action)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                            isApplied
                              ? 'bg-teal-50 text-teal-800 border border-teal-200 cursor-default'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3 h-3" aria-hidden="true" />
                              Applied to Model
                            </>
                          ) : (
                            'Apply to Simulation'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
