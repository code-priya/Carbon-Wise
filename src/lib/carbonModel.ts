import {
  AppCategory,
  AppEmissionBreakdown,
  CarbonReportSummary,
  DeviceTierId,
  MobileAppEntry,
  NetworkMixId,
  OptimizationLevers,
  SimulationConfig,
} from '../types/carbon.ts';

export interface CategorySpec {
  label: string;
  shortLabel: string;
  screenAndSocWatts: number;
  dataMbPerMin: number;
  cloudWhPerMin: number;
  backgroundWhPerDay: number;
  backgroundMbPerDay: number;
  videoSensitive: boolean;
  autoplaySensitive: boolean;
  darkModeSensitive: boolean;
  description: string;
}

export const CATEGORY_SPECS: Record<AppCategory, CategorySpec> = {
  'short-video': {
    label: 'Short-Form Video',
    shortLabel: 'Short Video',
    screenAndSocWatts: 3.15,
    dataMbPerMin: 18.5,
    cloudWhPerMin: 0.42,
    backgroundWhPerDay: 0.38,
    backgroundMbPerDay: 24,
    videoSensitive: true,
    autoplaySensitive: true,
    darkModeSensitive: false,
    description: 'Continuous vertical feeds, adaptive bitrate prefetching, and recommendation inference.',
  },
  'hd-streaming': {
    label: 'HD / 4K Video Streaming',
    shortLabel: 'Video Stream',
    screenAndSocWatts: 3.35,
    dataMbPerMin: 28.0,
    cloudWhPerMin: 0.48,
    backgroundWhPerDay: 0.14,
    backgroundMbPerDay: 8,
    videoSensitive: true,
    autoplaySensitive: true,
    darkModeSensitive: false,
    description: 'High-bitrate CDN delivery, hardware video decoding, and sustained display brightness.',
  },
  social: {
    label: 'Social Media Feed',
    shortLabel: 'Social Feed',
    screenAndSocWatts: 2.55,
    dataMbPerMin: 8.2,
    cloudWhPerMin: 0.24,
    backgroundWhPerDay: 0.52,
    backgroundMbPerDay: 35,
    videoSensitive: false,
    autoplaySensitive: true,
    darkModeSensitive: true,
    description: 'Image/video carousels, feed ranking servers, and frequent background notifications.',
  },
  gaming: {
    label: '3D Mobile Gaming',
    shortLabel: '3D Gaming',
    screenAndSocWatts: 5.4,
    dataMbPerMin: 2.4,
    cloudWhPerMin: 0.28,
    backgroundWhPerDay: 0.12,
    backgroundMbPerDay: 12,
    videoSensitive: false,
    autoplaySensitive: false,
    darkModeSensitive: false,
    description: 'Peak GPU/SoC thermal draw, 120Hz frame rendering, and multiplayer state sync.',
  },
  'cloud-ai': {
    label: 'Cloud AI Assistant',
    shortLabel: 'Cloud AI',
    screenAndSocWatts: 2.15,
    dataMbPerMin: 1.4,
    cloudWhPerMin: 1.35,
    backgroundWhPerDay: 0.08,
    backgroundMbPerDay: 4,
    videoSensitive: false,
    autoplaySensitive: false,
    darkModeSensitive: true,
    description: 'High server-side GPU inference energy per prompt paired with moderate client display time.',
  },
  'video-call': {
    label: 'Video Conferencing',
    shortLabel: 'Video Call',
    screenAndSocWatts: 4.1,
    dataMbPerMin: 15.0,
    cloudWhPerMin: 0.55,
    backgroundWhPerDay: 0.15,
    backgroundMbPerDay: 6,
    videoSensitive: true,
    autoplaySensitive: false,
    darkModeSensitive: false,
    description: 'Simultaneous camera capture, real-time H.264/VP9 encoding, and SFU media routing.',
  },
  navigation: {
    label: 'GPS & Live Maps',
    shortLabel: 'Navigation',
    screenAndSocWatts: 3.65,
    dataMbPerMin: 2.1,
    cloudWhPerMin: 0.22,
    backgroundWhPerDay: 0.44,
    backgroundMbPerDay: 18,
    videoSensitive: false,
    autoplaySensitive: false,
    darkModeSensitive: true,
    description: 'Continuous GNSS/GPS radio lock, high outdoor screen brightness, and tile/traffic API calls.',
  },
  audio: {
    label: 'Audio & Podcasts',
    shortLabel: 'Audio',
    screenAndSocWatts: 0.65,
    dataMbPerMin: 1.6,
    cloudWhPerMin: 0.09,
    backgroundWhPerDay: 0.18,
    backgroundMbPerDay: 10,
    videoSensitive: false,
    autoplaySensitive: false,
    darkModeSensitive: true,
    description: 'Screen-off audio decoding with lightweight buffered streaming.',
  },
  messaging: {
    label: 'Messaging & Email',
    shortLabel: 'Messaging',
    screenAndSocWatts: 1.75,
    dataMbPerMin: 0.85,
    cloudWhPerMin: 0.08,
    backgroundWhPerDay: 0.34,
    backgroundMbPerDay: 16,
    videoSensitive: false,
    autoplaySensitive: false,
    darkModeSensitive: true,
    description: 'Text/media threads, encrypted push sockets, and low-intensity display sessions.',
  },
};

export interface DeviceSpec {
  id: DeviceTierId;
  label: string;
  shortLabel: string;
  powerMultiplier: number;
  batteryWh: number;
  notes: string;
}

export const DEVICE_SPECS: Record<DeviceTierId, DeviceSpec> = {
  'compact-oled': {
    id: 'compact-oled',
    label: 'Compact OLED (6.1" · 3,800 mAh)',
    shortLabel: 'Compact OLED',
    powerMultiplier: 0.88,
    batteryWh: 14.6,
    notes: 'Smaller display area reduces active panel draw by ~12%.',
  },
  'flagship-oled': {
    id: 'flagship-oled',
    label: 'Flagship OLED (6.5" · 4,800 mAh)',
    shortLabel: 'Flagship OLED',
    powerMultiplier: 1.0,
    batteryWh: 18.5,
    notes: 'Baseline 120Hz OLED smartphone power curve.',
  },
  'pro-max-foldable': {
    id: 'pro-max-foldable',
    label: 'Pro Max / Foldable (6.8"+ · 5,500 mAh)',
    shortLabel: 'Pro Max / Fold',
    powerMultiplier: 1.24,
    batteryWh: 21.2,
    notes: 'Larger high-nit display increases active power draw by ~24%.',
  },
  tablet: {
    id: 'tablet',
    label: 'Mobile Tablet (11" · 8,500 mAh)',
    shortLabel: 'Tablet',
    powerMultiplier: 1.62,
    batteryWh: 32.8,
    notes: 'Expanded backlight/OLED surface drives ~62% higher device wattage.',
  },
};

export interface NetworkSpec {
  id: NetworkMixId;
  label: string;
  shortLabel: string;
  wifiShare: number;
  cellularShare: number;
  whPerGb: number;
  notes: string;
}

// Empirical transmission energy: Wi-Fi + fixed access ~45 Wh/GB; 4G/5G RAN + core ~165 Wh/GB
export const NETWORK_SPECS: Record<NetworkMixId, NetworkSpec> = {
  'wifi-dominant': {
    id: 'wifi-dominant',
    label: 'Mostly Wi‑Fi (80% Wi‑Fi / 20% 5G)',
    shortLabel: '80% Wi‑Fi',
    wifiShare: 0.8,
    cellularShare: 0.2,
    whPerGb: 0.8 * 45 + 0.2 * 165, // 69 Wh/GB
    notes: 'Fiber-backed Wi-Fi keeps radio transmission overhead low.',
  },
  balanced: {
    id: 'balanced',
    label: 'Balanced Commute (50% Wi‑Fi / 50% Cellular)',
    shortLabel: '50 / 50 Mix',
    wifiShare: 0.5,
    cellularShare: 0.5,
    whPerGb: 0.5 * 45 + 0.5 * 165, // 105 Wh/GB
    notes: 'Typical hybrid workday across home Wi-Fi and mobile towers.',
  },
  'cellular-heavy': {
    id: 'cellular-heavy',
    label: 'Heavy 5G / LTE (20% Wi‑Fi / 80% Cellular)',
    shortLabel: '80% Cellular',
    wifiShare: 0.2,
    cellularShare: 0.8,
    whPerGb: 0.2 * 45 + 0.8 * 165, // 141 Wh/GB
    notes: 'Cellular base stations consume ~3.6× more energy per GB than Wi-Fi.',
  },
};

export interface GridRegionPreset {
  id: string;
  label: string;
  gCo2PerKwh: number;
}

export const GRID_PRESETS: GridRegionPreset[] = [
  { id: 'nordic', label: 'Nordics (Hydro / Wind)', gCo2PerKwh: 38 },
  { id: 'france', label: 'France (Nuclear / Renewables)', gCo2PerKwh: 56 },
  { id: 'california', label: 'California (CAISO)', gCo2PerKwh: 215 },
  { id: 'eu-avg', label: 'EU-27 Average', gCo2PerKwh: 245 },
  { id: 'us-avg', label: 'United States Average', gCo2PerKwh: 367 },
  { id: 'global-avg', label: 'Global Grid Average', gCo2PerKwh: 436 },
  { id: 'india', label: 'India National Grid', gCo2PerKwh: 632 },
];

export const DEFAULT_LEVERS: OptimizationLevers = {
  oledDarkMode: false,
  capVideo720p: false,
  disableAutoplay: false,
  restrictBackgroundSync: false,
};

export const DEFAULT_CONFIG: SimulationConfig = {
  deviceTier: 'flagship-oled',
  networkMix: 'balanced',
  gridIntensityGPerKwh: 367,
  gridRegionLabel: 'United States Average',
  levers: { ...DEFAULT_LEVERS },
};

// Cloud servers operate across distributed hyperscale regions (global cloud weighted ~310 gCO2e/kWh with PUE 1.25 already included in Wh/min)
const CLOUD_GRID_INTENSITY_G_PER_KWH = 310;
const CHARGING_LOSS_FACTOR = 1.18; // AC-DC adapter + battery thermal loss (~18%)

export interface PresetProfile {
  id: string;
  label: string;
  description: string;
  networkMix: NetworkMixId;
  apps: MobileAppEntry[];
}

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'everyday',
    label: 'Everyday Hybrid',
    description: 'Balanced 3h 40m daily screen time across social, video, messaging, and navigation.',
    networkMix: 'balanced',
    apps: [
      { id: 'app-tiktok', name: 'TikTok', category: 'short-video', minutesPerDay: 55, backgroundPolling: true },
      { id: 'app-youtube', name: 'YouTube', category: 'hd-streaming', minutesPerDay: 45, backgroundPolling: true },
      { id: 'app-instagram', name: 'Instagram', category: 'social', minutesPerDay: 40, backgroundPolling: true },
      { id: 'app-spotify', name: 'Spotify', category: 'audio', minutesPerDay: 60, backgroundPolling: true },
      { id: 'app-maps', name: 'Google Maps', category: 'navigation', minutesPerDay: 25, backgroundPolling: true },
      { id: 'app-whatsapp', name: 'WhatsApp', category: 'messaging', minutesPerDay: 35, backgroundPolling: true },
      { id: 'app-chatgpt', name: 'ChatGPT', category: 'cloud-ai', minutesPerDay: 20, backgroundPolling: false },
    ],
  },
  {
    id: 'video-heavy',
    label: 'Video & Social Heavy',
    description: 'High-bitrate mobile streaming and short-form video mostly over cellular.',
    networkMix: 'cellular-heavy',
    apps: [
      { id: 'app-tiktok', name: 'TikTok', category: 'short-video', minutesPerDay: 110, backgroundPolling: true },
      { id: 'app-youtube', name: 'YouTube', category: 'hd-streaming', minutesPerDay: 95, backgroundPolling: true },
      { id: 'app-instagram', name: 'Instagram Reels', category: 'social', minutesPerDay: 65, backgroundPolling: true },
      { id: 'app-twitch', name: 'Twitch', category: 'hd-streaming', minutesPerDay: 40, backgroundPolling: false },
      { id: 'app-whatsapp', name: 'Messages', category: 'messaging', minutesPerDay: 30, backgroundPolling: true },
    ],
  },
  {
    id: 'remote-ai',
    label: 'Remote & Cloud AI',
    description: 'Frequent mobile video meetings, cloud AI queries, and workspace messaging.',
    networkMix: 'wifi-dominant',
    apps: [
      { id: 'app-meet', name: 'Zoom / Meet', category: 'video-call', minutesPerDay: 75, backgroundPolling: false },
      { id: 'app-chatgpt', name: 'AI Assistant', category: 'cloud-ai', minutesPerDay: 50, backgroundPolling: false },
      { id: 'app-slack', name: 'Slack & Mail', category: 'messaging', minutesPerDay: 65, backgroundPolling: true },
      { id: 'app-maps', name: 'Maps / Transit', category: 'navigation', minutesPerDay: 30, backgroundPolling: true },
      { id: 'app-spotify', name: 'Spotify', category: 'audio', minutesPerDay: 80, backgroundPolling: false },
    ],
  },
  {
    id: 'gamer',
    label: 'Mobile Gamer',
    description: 'Sustained 3D GPU sessions, voice comms, and live game streams.',
    networkMix: 'wifi-dominant',
    apps: [
      { id: 'app-genshin', name: 'Genshin / PUBG Mobile', category: 'gaming', minutesPerDay: 120, backgroundPolling: false },
      { id: 'app-youtube', name: 'YouTube Gaming', category: 'hd-streaming', minutesPerDay: 55, backgroundPolling: true },
      { id: 'app-discord', name: 'Discord', category: 'messaging', minutesPerDay: 45, backgroundPolling: true },
      { id: 'app-reddit', name: 'Reddit', category: 'social', minutesPerDay: 35, backgroundPolling: true },
    ],
  },
];

export const QUICK_ADD_CATALOG: Array<{ name: string; category: AppCategory; defaultMinutes: number }> = [
  { name: 'YouTube', category: 'hd-streaming', defaultMinutes: 45 },
  { name: 'TikTok', category: 'short-video', defaultMinutes: 40 },
  { name: 'Instagram', category: 'social', defaultMinutes: 35 },
  { name: 'Netflix Mobile', category: 'hd-streaming', defaultMinutes: 50 },
  { name: 'ChatGPT / Gemini', category: 'cloud-ai', defaultMinutes: 20 },
  { name: 'Google Maps', category: 'navigation', defaultMinutes: 25 },
  { name: 'Spotify', category: 'audio', defaultMinutes: 60 },
  { name: 'Zoom / Teams', category: 'video-call', defaultMinutes: 45 },
  { name: 'Roblox / Genshin', category: 'gaming', defaultMinutes: 50 },
  { name: 'WhatsApp / Slack', category: 'messaging', defaultMinutes: 30 },
];

function computeAppMetrics(
  app: MobileAppEntry,
  config: SimulationConfig,
  useLevers: boolean
): Omit<AppEmissionBreakdown, 'sharePercent'> {
  const spec = CATEGORY_SPECS[app.category];
  const device = DEVICE_SPECS[config.deviceTier];
  const network = NETWORK_SPECS[config.networkMix];
  const levers = useLevers ? config.levers : DEFAULT_LEVERS;

  const hours = app.minutesPerDay / 60;

  // Device OLED dark mode modifier (~24% display power reduction on UI/text/feed apps)
  const darkFactor = levers.oledDarkMode && spec.darkModeSensitive ? 0.76 : 1.0;

  // Video cap (720p instead of 1080p/4K) reduces streaming data ~56% and cloud CDN transcoding ~35%
  const videoDataFactor = levers.capVideo720p && spec.videoSensitive ? 0.44 : 1.0;
  const videoCloudFactor = levers.capVideo720p && spec.videoSensitive ? 0.65 : 1.0;

  // Autoplay disabled saves ~18% passive media prefetch & active micro-sessions
  const autoplayDataFactor = levers.disableAutoplay && spec.autoplaySensitive ? 0.82 : 1.0;

  // Background polling contribution
  const includeBackground = app.backgroundPolling && !levers.restrictBackgroundSync;
  const bgWh = includeBackground ? spec.backgroundWhPerDay : 0;
  const bgMb = includeBackground ? spec.backgroundMbPerDay : 0;

  // Layer 1: Device Hardware (Wh/day)
  const activeDeviceWh = spec.screenAndSocWatts * device.powerMultiplier * darkFactor * hours;
  const deviceWhPerDay = (activeDeviceWh + bgWh) * CHARGING_LOSS_FACTOR;

  // Layer 2: Network Transmission (MB/day -> GB/day -> Wh/day)
  const activeDataMb = app.minutesPerDay * spec.dataMbPerMin * videoDataFactor * autoplayDataFactor;
  const dataMbPerDay = activeDataMb + bgMb;
  const networkWhPerDay = (dataMbPerDay / 1024) * network.whPerGb;

  // Layer 3: Cloud & Data Center Compute (Wh/day)
  const cloudWhPerDay = app.minutesPerDay * spec.cloudWhPerMin * videoCloudFactor * autoplayDataFactor;

  const totalWhPerDay = deviceWhPerDay + networkWhPerDay + cloudWhPerDay;

  // Convert Wh to gCO2e using regional grid intensity for device + local network,
  // and global cloud carbon intensity for distributed data centers
  const deviceGramsPerDay = (deviceWhPerDay / 1000) * config.gridIntensityGPerKwh;
  const networkGramsPerDay = (networkWhPerDay / 1000) * config.gridIntensityGPerKwh;
  const cloudGramsPerDay = (cloudWhPerDay / 1000) * CLOUD_GRID_INTENSITY_G_PER_KWH;

  const totalGramsPerDay = deviceGramsPerDay + networkGramsPerDay + cloudGramsPerDay;
  const gramsPerHour = app.minutesPerDay > 0 ? totalGramsPerDay / (app.minutesPerDay / 60) : 0;

  return {
    appId: app.id,
    name: app.name,
    category: app.category,
    categoryLabel: spec.label,
    minutesPerDay: app.minutesPerDay,
    dataMbPerDay,
    deviceWhPerDay,
    networkWhPerDay,
    cloudWhPerDay,
    totalWhPerDay,
    deviceGramsPerDay,
    networkGramsPerDay,
    cloudGramsPerDay,
    totalGramsPerDay,
    gramsPerHour,
  };
}

export function calculateCarbonReport(
  apps: MobileAppEntry[],
  config: SimulationConfig
): CarbonReportSummary {
  const rawActive = apps.map((app) => computeAppMetrics(app, config, true));
  const rawBaseline = apps.map((app) => computeAppMetrics(app, config, false));

  const dailyGramsCo2e = rawActive.reduce((sum, a) => sum + a.totalGramsPerDay, 0);
  const baselineDailyGramsCo2e = rawBaseline.reduce((sum, a) => sum + a.totalGramsPerDay, 0);

  const enrichedApps: AppEmissionBreakdown[] = rawActive.map((item) => ({
    ...item,
    sharePercent: dailyGramsCo2e > 0 ? (item.totalGramsPerDay / dailyGramsCo2e) * 100 : 0,
  }));

  const totalMinutesPerDay = enrichedApps.reduce((sum, a) => sum + a.minutesPerDay, 0);
  const totalDataMbPerDay = enrichedApps.reduce((sum, a) => sum + a.dataMbPerDay, 0);
  const totalWhPerDay = enrichedApps.reduce((sum, a) => sum + a.totalWhPerDay, 0);

  const deviceGrams = enrichedApps.reduce((sum, a) => sum + a.deviceGramsPerDay, 0);
  const networkGrams = enrichedApps.reduce((sum, a) => sum + a.networkGramsPerDay, 0);
  const cloudGrams = enrichedApps.reduce((sum, a) => sum + a.cloudGramsPerDay, 0);

  const monthlyKgCo2e = (dailyGramsCo2e * 30.4) / 1000;
  const annualKgCo2e = (dailyGramsCo2e * 365) / 1000;
  const baselineAnnualKgCo2e = (baselineDailyGramsCo2e * 365) / 1000;

  const savedDailyGramsCo2e = Math.max(0, baselineDailyGramsCo2e - dailyGramsCo2e);
  const savedAnnualKgCo2e = Math.max(0, baselineAnnualKgCo2e - annualKgCo2e);

  const deviceBatteryWh = DEVICE_SPECS[config.deviceTier].batteryWh * CHARGING_LOSS_FACTOR;
  const annualWh = totalWhPerDay * 365;

  return {
    totalMinutesPerDay,
    totalDataMbPerDay,
    totalDataGbPerMonth: (totalDataMbPerDay * 30.4) / 1024,
    totalWhPerDay,
    dailyGramsCo2e,
    monthlyKgCo2e,
    annualKgCo2e,
    baselineDailyGramsCo2e,
    baselineAnnualKgCo2e,
    savedDailyGramsCo2e,
    savedAnnualKgCo2e,
    layerTotals: {
      deviceGrams,
      networkGrams,
      cloudGrams,
    },
    equivalents: {
      phoneChargesPerYear: deviceBatteryWh > 0 ? annualWh / deviceBatteryWh : 0,
      // Average passenger car ~170 gCO2/km -> 0.17 kg/km
      carKmPerYear: annualKgCo2e / 0.17,
      // 9W LED bulb running on same grid
      ledBulbHoursPerYear: (annualWh / 9),
      // Mature tree absorbs ~21 kg CO2/year -> ~1.75 kg/month
      treeMonthsPerYear: annualKgCo2e / 1.75,
    },
    apps: enrichedApps,
  };
}

export function formatMinutes(mins: number): string {
  const rounded = Math.round(mins);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
