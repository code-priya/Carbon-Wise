export type AppCategory =
  | 'short-video'
  | 'hd-streaming'
  | 'social'
  | 'gaming'
  | 'cloud-ai'
  | 'video-call'
  | 'navigation'
  | 'audio'
  | 'messaging';

export type DeviceTierId = 'compact-oled' | 'flagship-oled' | 'pro-max-foldable' | 'tablet';

export type NetworkMixId = 'wifi-dominant' | 'balanced' | 'cellular-heavy';

export interface MobileAppEntry {
  id: string;
  name: string;
  category: AppCategory;
  minutesPerDay: number;
  backgroundPolling: boolean;
}

export interface OptimizationLevers {
  oledDarkMode: boolean;
  capVideo720p: boolean;
  disableAutoplay: boolean;
  restrictBackgroundSync: boolean;
}

export interface SimulationConfig {
  deviceTier: DeviceTierId;
  networkMix: NetworkMixId;
  gridIntensityGPerKwh: number;
  gridRegionLabel: string;
  levers: OptimizationLevers;
}

export interface AppEmissionBreakdown {
  appId: string;
  name: string;
  category: AppCategory;
  categoryLabel: string;
  minutesPerDay: number;
  dataMbPerDay: number;
  deviceWhPerDay: number;
  networkWhPerDay: number;
  cloudWhPerDay: number;
  totalWhPerDay: number;
  deviceGramsPerDay: number;
  networkGramsPerDay: number;
  cloudGramsPerDay: number;
  totalGramsPerDay: number;
  gramsPerHour: number;
  sharePercent: number;
}

export interface CarbonReportSummary {
  totalMinutesPerDay: number;
  totalDataMbPerDay: number;
  totalDataGbPerMonth: number;
  totalWhPerDay: number;
  dailyGramsCo2e: number;
  monthlyKgCo2e: number;
  annualKgCo2e: number;
  baselineDailyGramsCo2e: number;
  baselineAnnualKgCo2e: number;
  savedDailyGramsCo2e: number;
  savedAnnualKgCo2e: number;
  layerTotals: {
    deviceGrams: number;
    networkGrams: number;
    cloudGrams: number;
  };
  equivalents: {
    phoneChargesPerYear: number;
    carKmPerYear: number;
    ledBulbHoursPerYear: number;
    treeMonthsPerYear: number;
  };
  apps: AppEmissionBreakdown[];
}

export interface ReductionAction {
  id: string;
  title: string;
  rationale: string;
  targetAppOrScope: string;
  dailySavingsGrams: number;
  annualSavingsKg: number;
  effortLevel: 'Low' | 'Moderate' | 'High';
  leverKey?: keyof OptimizationLevers;
  suggestedMinutesReduction?: {
    appName: string;
    reduceByMinutes: number;
  };
}

export interface AIAuditResult {
  headlineDiagnosis: string;
  primaryHotspot: string;
  efficiencyGradeContext: string;
  prioritizedActions: ReductionAction[];
  behavioralInsight: string;
  generatedAt: string;
}

export interface ParsedAppSuggestion {
  name: string;
  category: AppCategory;
  minutesPerDay: number;
  confidenceNote: string;
}

export interface AIParseResult {
  apps: ParsedAppSuggestion[];
  detectedNetworkHint?: NetworkMixId;
  summaryNote: string;
}
