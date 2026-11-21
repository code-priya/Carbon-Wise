import React, { useMemo, useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { CATEGORY_SPECS, QUICK_ADD_CATALOG, formatMinutes } from '../lib/carbonModel.ts';
import {
  AppCategory,
  AppEmissionBreakdown,
  MobileAppEntry,
} from '../types/carbon.ts';

interface AppBreakdownTableProps {
  apps: MobileAppEntry[];
  breakdowns: AppEmissionBreakdown[];
  onUpdateMinutes: (appId: string, minutes: number) => void;
  onToggleBackground: (appId: string) => void;
  onRemoveApp: (appId: string) => void;
  onAddApp: (entry: Omit<MobileAppEntry, 'id'>) => void;
}

type SortKey = 'emissions' | 'duration' | 'intensity' | 'data';

export const AppBreakdownTable: React.FC<AppBreakdownTableProps> = ({
  apps,
  breakdowns,
  onUpdateMinutes,
  onToggleBackground,
  onRemoveApp,
  onAddApp,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AppCategory>('all');
  const [sortKey, setSortKey] = useState<SortKey>('emissions');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AppCategory>('short-video');
  const [newMinutes, setNewMinutes] = useState(30);
  const [newBackground, setNewBackground] = useState(true);

  const appLookup = useMemo(() => {
    const map = new Map<string, MobileAppEntry>();
    for (const a of apps) map.set(a.id, a);
    return map;
  }, [apps]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return breakdowns
      .filter((row) => {
        if (categoryFilter !== 'all' && row.category !== categoryFilter) return false;
        if (
          q &&
          !row.name.toLowerCase().includes(q) &&
          !row.categoryLabel.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortKey === 'emissions') return b.totalGramsPerDay - a.totalGramsPerDay;
        if (sortKey === 'duration') return b.minutesPerDay - a.minutesPerDay;
        if (sortKey === 'intensity') return b.gramsPerHour - a.gramsPerHour;
        return b.dataMbPerDay - a.dataMbPerDay;
      });
  }, [breakdowns, searchQuery, categoryFilter, sortKey]);

  const handleCreateCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddApp({
      name: trimmed,
      category: newCategory,
      minutesPerDay: Math.max(0, Math.min(480, newMinutes)),
      backgroundPolling: newBackground,
    });
    setNewName('');
    setNewMinutes(30);
    setShowAddForm(false);
  };

  const existingNamesLower = useMemo(
    () => new Set(apps.map((a) => a.name.toLowerCase())),
    [apps]
  );

  return (
    <section id="breakdown" className="bg-white border border-slate-200 rounded-xl">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Application Telemetry & Duration Controls
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust daily minutes or background sync per app to recompute real-time carbon intensity
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showAddForm ? (
              <>
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                Close Adder
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Add Mobile App
              </>
            )}
          </button>
        </div>

        {/* Inline Add App Drawer */}
        {showAddForm && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <div>
              <div className="text-xs font-medium text-slate-700 mb-2">Quick-add common apps</div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ADD_CATALOG.map((item) => {
                  const alreadyAdded = existingNamesLower.has(item.name.toLowerCase());
                  return (
                    <button
                      key={item.name}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() =>
                        onAddApp({
                          name: item.name,
                          category: item.category,
                          minutesPerDay: item.defaultMinutes,
                          backgroundPolling: true,
                        })
                      }
                      className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-800 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      + {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleCreateCustomApp}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-200 items-end"
            >
              <div className="sm:col-span-4">
                <label htmlFor="custom-app-name" className="block text-[11px] font-medium text-slate-600 mb-1">
                  App Name
                </label>
                <input
                  id="custom-app-name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Threads, Strava, Notion"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="custom-app-category" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Workload Category
                </label>
                <select
                  id="custom-app-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as AppCategory)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  {(Object.keys(CATEGORY_SPECS) as AppCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_SPECS[cat].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="custom-app-mins" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Min / Day
                </label>
                <input
                  id="custom-app-mins"
                  type="number"
                  min={1}
                  max={480}
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono tabular-nums text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add Entry
                </button>
              </div>

              <div className="sm:col-span-12">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBackground}
                    onChange={(e) => setNewBackground(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700"
                  />
                  Include background data refresh & push polling overhead
                </label>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter apps or workloads..."
              aria-label="Filter mobile apps"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by workload category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | AppCategory)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-teal-700 focus:outline-none"
            >
              <option value="all">All Workloads</option>
              {(Object.keys(CATEGORY_SPECS) as AppCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_SPECS[cat].shortLabel}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'emissions', label: 'Emissions' },
                  { id: 'duration', label: 'Duration' },
                  { id: 'intensity', label: 'g/hr' },
                  { id: 'data', label: 'Data' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortKey(opt.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    sortKey === opt.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {filteredRows.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-slate-800">No matching mobile apps</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {apps.length === 0
              ? 'Log your first mobile app or pick a preset profile to calculate emissions.'
              : 'Clear your search filter or add a new app entry.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setShowAddForm(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
          >
            Log App Entry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pl-5 pr-3">Application & Workload</th>
                <th className="py-2.5 px-3 w-[220px]">Daily Usage</th>
                <th className="py-2.5 px-3 text-right">Data / Day</th>
                <th className="py-2.5 px-3 text-right">Energy / Day</th>
                <th className="py-2.5 px-3 text-right">Intensity</th>
                <th className="py-2.5 px-3 text-right">Footprint / Day</th>
                <th className="py-2.5 pl-3 pr-5 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRows.map((row) => {
                const rawApp = appLookup.get(row.appId);
                const bgEnabled = rawApp?.backgroundPolling ?? false;
                const intensityHigh = row.gramsPerHour >= 45;
                const intensityMed = row.gramsPerHour >= 20 && row.gramsPerHour < 45;

                return (
                  <tr
                    key={row.appId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 pl-5 pr-3 align-middle">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>{row.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          onClick={() => onToggleBackground(row.appId)}
                          className="hover:text-slate-900 underline decoration-dotted cursor-pointer"
                          title="Toggle background polling overhead"
                        >
                          {bgEnabled ? 'Bg sync on' : 'Bg sync off'}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="range"
                          aria-label={`Daily minutes for ${row.name}`}
                          min={0}
                          max={240}
                          step={5}
                          value={row.minutesPerDay}
                          onChange={(e) =>
                            onUpdateMinutes(row.appId, Number(e.target.value))
                          }
                          className="w-28 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono tabular-nums text-slate-800 w-14 text-right shrink-0">
                          {formatMinutes(row.minutesPerDay)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 align-middle">
                      {row.dataMbPerDay >= 1024
                        ? `${(row.dataMbPerDay / 1024).toFixed(2)} GB`
                        : `${Math.round(row.dataMbPerDay)} MB`}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 align-middle">
                      {row.totalWhPerDay.toFixed(1)} Wh
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums align-middle">
                      <span
                        className={
                          intensityHigh
                            ? 'text-rose-700 font-semibold'
                            : intensityMed
                              ? 'text-amber-700 font-medium'
                              : 'text-emerald-700 font-medium'
                        }
                      >
                        {row.gramsPerHour.toFixed(1)} g/hr
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums align-middle">
                      <div className="font-semibold text-slate-900">
                        {row.totalGramsPerDay.toFixed(1)} g
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {row.sharePercent.toFixed(0)}% share
                      </div>
                    </td>

                    <td className="py-3 pl-3 pr-5 text-right align-middle">
                      <button
                        type="button"
                        onClick={() => onRemoveApp(row.appId)}
                        aria-label={`Remove ${row.name}`}
                        className="p-1.5 text-slate-400 hover:text-rose-700 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
