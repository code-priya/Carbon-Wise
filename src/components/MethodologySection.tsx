import React from 'react';

export const MethodologySection: React.FC = () => {
  return (
    <section
      id="methodology"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
    >
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Carbon Accounting Methodology
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
          CarbonWise estimates operational mobile app emissions using a three-layer boundary model combining client hardware wattage, wireless radio transmission energy per gigabyte, and cloud data center compute.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
        <div>
          <h3 className="text-xs font-semibold text-slate-900">
            01. Device Hardware & Charging Loss
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Models active OLED display luminance, SoC/GPU draw by workload (0.65 W audio up to 5.4 W 3D gaming), and an 18% AC-to-battery charging conversion loss, scaled by regional electricity grid carbon intensity.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-900">
            02. Network Transmission Energy
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Applies weighted transmission factors across fixed fiber/Wi‑Fi (45 Wh/GB) and cellular 4G/5G radio access networks (165 Wh/GB) based on each app&apos;s bitrate and background sync polling.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-900">
            03. Cloud & Data Center Compute
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Accounts for server-side inference, feed ranking, and adaptive video transcoding (including hyperscale PUE 1.25 cooling overhead) weighted at a distributed cloud grid intensity of 310 gCO₂e/kWh.
          </p>
        </div>
      </div>
    </section>
  );
};
