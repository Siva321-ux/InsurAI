/*  ───────────────────────────────────────────────
    GigShield Mock API Service
    Simulates all backend responses for standalone
    frontend demo.  Uses in-memory data stores.
    ─────────────────────────────────────────────── */

/* ═══ Mock Data Stores ═══ */

const PLAN_CONFIG = {
  basic:    { label: 'Basic Shield',    basePremium: 29, maxDaily: 200, maxWeekly:  800 },
  standard: { label: 'Standard Shield', basePremium: 49, maxDaily: 300, maxWeekly: 1200 },
  full:     { label: 'Full Shield',     basePremium: 79, maxDaily: 450, maxWeekly: 1800 },
};

const TRIGGER_TYPES = {
  rain:             { label: 'Heavy Rainfall',      icon: '🌧️', payout: 300, threshold: '> 50 mm/hr' },
  heat:             { label: 'Extreme Heat',        icon: '🔥', payout: 200, threshold: '> 42°C for 3hrs' },
  aqi:              { label: 'Severe AQI',          icon: '😷', payout: 200, threshold: 'AQI > 300' },
  curfew:           { label: 'Curfew / Strike',     icon: '🚫', payout: 400, threshold: 'Zone flagged' },
  platform_outage:  { label: 'Platform Outage',     icon: '📱', payout: 350, threshold: 'Down > 2hrs' },
};

const CITIES_ZONES = {
  Mumbai:     ['400001','400053','400069','400070','400080'],
  Bengaluru:  ['560001','560034','560037','560066','560100'],
  Chennai:    ['600001','600017','600028','600040','600085'],
  Delhi:      ['110001','110016','110020','110045','110085'],
  Hyderabad:  ['500001','500003','500016','500034','500081'],
};

/* Pre-seeded policies */
let policies = [
  {
    _id: 'pol1',
    workerId: 'w1',
    planType: 'standard',
    basePremium: 49,
    finalPremium: 61,
    riskScore: 0.25,
    weekStart: getMonday(new Date()),
    weekEnd: getSunday(new Date()),
    status: 'active',
    maxDailyPayout: 300,
    maxWeeklyPayout: 1200,
    payoutsThisWeek: 300,
    createdAt: new Date().toISOString(),
  },
];

/* Pre-seeded triggers */
let triggers = [
  {
    _id: 'trig1',
    type: 'rain',
    zone: '400053',
    city: 'Mumbai',
    severity: 'high',
    rawData: { rainfall_mm: 67, source: 'OpenWeatherMap (mock)' },
    workersAffected: 608,
    payoutsIssued: 608,
    totalPayoutAmount: 182400,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'trig2',
    type: 'heat',
    zone: '600001',
    city: 'Chennai',
    severity: 'medium',
    rawData: { temperature: 44.2, duration_hrs: 4, source: 'OpenWeatherMap (mock)' },
    workersAffected: 234,
    payoutsIssued: 229,
    totalPayoutAmount: 45800,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'trig3',
    type: 'aqi',
    zone: '110001',
    city: 'Delhi',
    severity: 'critical',
    rawData: { aqi: 387, source: 'AQICN (mock)' },
    workersAffected: 412,
    payoutsIssued: 398,
    totalPayoutAmount: 79600,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    _id: 'trig4',
    type: 'platform_outage',
    zone: 'ALL',
    city: 'Bengaluru',
    severity: 'high',
    rawData: { platform: 'Zomato', downtime_hrs: 3.5, source: 'Platform Monitor (mock)' },
    workersAffected: 1245,
    payoutsIssued: 1198,
    totalPayoutAmount: 419300,
    timestamp: new Date(Date.now() - 259200000).toISOString(),
  },
];

/* Pre-seeded payouts */
let payouts = [
  {
    _id: 'pay1',
    workerId: 'w1',
    policyId: 'pol1',
    triggerId: 'trig1',
    amount: 300,
    triggerType: 'rain',
    zone: '400053',
    upiTransactionId: 'UPI' + Date.now() + '001',
    status: 'processed',
    processedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

/* Pre-seeded fraud logs */
let fraudLogs = [
  {
    _id: 'fraud1',
    workerId: 'w_fraud1',
    workerName: 'Suspicious User',
    triggerId: 'trig1',
    reason: 'zone_mismatch',
    gpsData: { lat: 19.1130, lng: 72.8573 },
    expectedZone: '400053',
    actualZone: '400001',
    action: 'excluded',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'fraud2',
    workerId: 'w_fraud2',
    workerName: 'GPS Spoofer',
    triggerId: 'trig1',
    reason: 'gps_spoofing',
    gpsData: { lat: 28.6139, lng: 77.2090 },
    expectedZone: '400053',
    actualZone: '110001',
    action: 'flagged',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

/* ═══ Date Helpers ═══ */
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

function getSunday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() + (7 - day);
  return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

/* ═══ Risk Scoring (mirrors Python ML model) ═══ */
function computeRiskScore(zone, city, month, avgHours) {
  const zoneRisk = { '400053': 0.2, '400001': 0.1, '560001': -0.05, '600001': 0.15, '110001': 0.25 };
  const cityRisk = { Mumbai: 0.15, Chennai: 0.12, Delhi: 0.18, Bengaluru: -0.05, Hyderabad: 0.05 };
  const monthNum = typeof month === 'number' ? month : new Date().getMonth();
  const seasonRisk = (monthNum >= 5 && monthNum <= 8) ? 0.2 : (monthNum >= 9 && monthNum <= 11) ? 0.05 : -0.1;
  const hoursRisk = avgHours >= 10 ? 0.15 : avgHours >= 7 ? 0.0 : -0.1;

  const factor =
    (zoneRisk[zone] ?? 0) * 0.35 +
    (cityRisk[city] ?? 0) * 0.20 +
    seasonRisk * 0.25 +
    hoursRisk * 0.20;

  return Math.max(-0.20, Math.min(0.30, factor));
}

/* ═══ Mock Environmental Data ═══ */
const MOCK_WEATHER = {
  '400053': { rainfall_mm: 67, temperature: 29, humidity: 94, condition: 'Heavy Rain', wind_kph: 35 },
  '400001': { rainfall_mm: 12, temperature: 31, humidity: 78, condition: 'Cloudy', wind_kph: 15 },
  '560001': { rainfall_mm: 3, temperature: 28, humidity: 65, condition: 'Partly Cloudy', wind_kph: 10 },
  '600001': { rainfall_mm: 0, temperature: 44.2, humidity: 42, condition: 'Extreme Heat', wind_kph: 8 },
  '110001': { rainfall_mm: 0, temperature: 36, humidity: 55, condition: 'Hazy', wind_kph: 12 },
};

const MOCK_AQI = {
  '400053': { aqi: 142, level: 'Unhealthy for Sensitive', color: '#ff9933' },
  '400001': { aqi: 98, level: 'Moderate', color: '#ffde33' },
  '560001': { aqi: 64, level: 'Moderate', color: '#ffde33' },
  '600001': { aqi: 178, level: 'Unhealthy', color: '#ff6633' },
  '110001': { aqi: 387, level: 'Hazardous', color: '#cc0033' },
};

/* ═══ Exported API Functions ═══ */

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms));

/* ─── Policies ─── */

export async function purchasePolicy(workerId, planType, workerData) {
  await delay(1200);
  const plan = PLAN_CONFIG[planType];
  if (!plan) throw new Error('Invalid plan type');

  const riskScore = computeRiskScore(
    workerData.activeZone,
    workerData.city,
    new Date().getMonth(),
    workerData.avgDailyHours
  );
  const finalPremium = Math.round(plan.basePremium * (1 + riskScore));

  const policy = {
    _id: 'pol' + Date.now(),
    workerId,
    planType,
    basePremium: plan.basePremium,
    finalPremium,
    riskScore: parseFloat(riskScore.toFixed(3)),
    weekStart: getMonday(new Date()),
    weekEnd: getSunday(new Date()),
    status: 'active',
    maxDailyPayout: plan.maxDaily,
    maxWeeklyPayout: plan.maxWeekly,
    payoutsThisWeek: 0,
    createdAt: new Date().toISOString(),
  };

  policies.push(policy);
  return policy;
}

export async function getActivePolicy(workerId) {
  await delay(400);
  return policies.find(p => p.workerId === workerId && p.status === 'active') || null;
}

export async function getPolicyHistory(workerId) {
  await delay(400);
  return policies.filter(p => p.workerId === workerId);
}

/* ─── Triggers ─── */

export async function getRecentTriggers() {
  await delay(400);
  return [...triggers].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function simulateTrigger(type, zone, city) {
  await delay(1500);
  
  const triggerConf = TRIGGER_TYPES[type];
  if (!triggerConf) throw new Error('Unknown trigger type');

  let rawData = {};
  if (type === 'rain')            rawData = { rainfall_mm: 58 + Math.floor(Math.random() * 30), source: 'OpenWeatherMap (mock)' };
  if (type === 'heat')            rawData = { temperature: 42 + Math.random() * 5, duration_hrs: 3 + Math.floor(Math.random() * 3), source: 'OpenWeatherMap (mock)' };
  if (type === 'aqi')             rawData = { aqi: 310 + Math.floor(Math.random() * 100), source: 'AQICN (mock)' };
  if (type === 'curfew')          rawData = { reason: 'Local bandh called', source: 'News Feed (mock)' };
  if (type === 'platform_outage') rawData = { platform: 'Zomato', downtime_hrs: 2 + Math.random() * 3, source: 'Platform Monitor (mock)' };

  const workersAffected = 100 + Math.floor(Math.random() * 900);
  const fraudExcluded = Math.floor(workersAffected * 0.03);
  const payoutsIssued = workersAffected - fraudExcluded;

  const trigger = {
    _id: 'trig' + Date.now(),
    type,
    zone,
    city,
    severity: type === 'aqi' ? 'critical' : 'high',
    rawData,
    workersAffected,
    payoutsIssued,
    totalPayoutAmount: payoutsIssued * triggerConf.payout,
    timestamp: new Date().toISOString(),
  };

  triggers.unshift(trigger);

  // Generate payouts for demo user if in zone
  const workerPolicies = policies.filter(
    p => p.status === 'active' && (zone === 'ALL' || true)
  );
  
  for (const pol of workerPolicies) {
    const payout = {
      _id: 'pay' + Date.now() + Math.random().toString(36).slice(2, 5),
      workerId: pol.workerId,
      policyId: pol._id,
      triggerId: trigger._id,
      amount: Math.min(triggerConf.payout, pol.maxDailyPayout),
      triggerType: type,
      zone,
      upiTransactionId: 'UPI' + Date.now() + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: 'processed',
      processedAt: new Date().toISOString(),
    };
    payouts.push(payout);
    pol.payoutsThisWeek += payout.amount;
  }

  return { trigger, payoutsProcessed: payoutsIssued, fraudExcluded };
}

/* ─── Payouts ─── */

export async function getMyPayouts(workerId) {
  await delay(400);
  return payouts
    .filter(p => p.workerId === workerId)
    .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt));
}

export async function getPayoutStats() {
  await delay(400);
  const total = payouts.reduce((s, p) => s + p.amount, 0);
  const count = payouts.length;
  const byType = {};
  payouts.forEach(p => {
    byType[p.triggerType] = (byType[p.triggerType] || 0) + p.amount;
  });
  return { totalPaid: total, totalPayouts: count, byTriggerType: byType };
}

/* ─── Admin ─── */

export async function getAdminDashboard() {
  await delay(500);
  const totalWorkers = 4823;
  const activePolicies = 3156;
  const totalPayoutAmount = payouts.reduce((s, p) => s + p.amount, 0) + 727100;
  const totalPremiumCollected = activePolicies * 52;
  const triggersToday = triggers.filter(
    t => new Date(t.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return {
    totalWorkers,
    activePolicies,
    totalPayoutAmount,
    totalPremiumCollected,
    triggersToday,
    claimRatio: ((totalPayoutAmount / (totalPremiumCollected || 1)) * 100).toFixed(1),
    recentTriggers: triggers.slice(0, 10),
    fraudLogs,
    zoneCoverage: Object.entries(CITIES_ZONES).map(([city, zones]) => ({
      city,
      zones: zones.length,
      workers: Math.floor(Math.random() * 800) + 200,
    })),
  };
}

export async function getFraudLogs() {
  await delay(400);
  return [...fraudLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/* ─── Environmental Data ─── */

export async function getWeatherData(zone) {
  await delay(300);
  return MOCK_WEATHER[zone] || { rainfall_mm: 5, temperature: 32, humidity: 60, condition: 'Clear', wind_kph: 10 };
}

export async function getAQIData(zone) {
  await delay(300);
  return MOCK_AQI[zone] || { aqi: 75, level: 'Moderate', color: '#ffde33' };
}

export async function getRiskScore(zone, city, avgHours) {
  await delay(300);
  return computeRiskScore(zone, city, new Date().getMonth(), avgHours);
}

/* ─── Constants Export ─── */
export { PLAN_CONFIG, TRIGGER_TYPES, CITIES_ZONES };
