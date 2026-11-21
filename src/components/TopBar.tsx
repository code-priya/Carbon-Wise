import React from 'react';

interface TopBarProps {
  onRunAudit: () => void;
  isAuditing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onRunAudit, isAuditing }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        <a
          href="#estimator"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        >
          CarbonWise
        </a>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#estimator"
            className="py-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 border-b border-transparent hover:border-slate-400"
          >
            Estimator
          </a>
          <a
            href="#breakdown"
            className="py-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 border-b border-transparent hover:border-slate-400"
          >
            Breakdown
          </a>
          <a
            href="#ai-audit"
            className="py-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 border-b border-transparent hover:border-slate-400"
          >
            AI Audit
          </a>
          <a
            href="#methodology"
            className="py-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 border-b border-transparent hover:border-slate-400"
          >
            Methodology
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRunAudit}
            disabled={isAuditing}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {isAuditing ? 'Analyzing...' : 'Run AI Audit'}
          </button>
        </div>
      </div>
    </header>
  );
};
