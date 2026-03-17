// Domain-based forensic classification engine for browser history analysis

export interface ClassifiedEvent {
  title: string;
  url: string;
  domain: string;
  timestamp: string; // EST/EDT normalized
  timestampUtc: string;
  category: string;
  severity: string;
  platform: string;
  pageTransition: string;
  clientId: string;
  threatScore: number; // 0-100
  tags: string[];
}

const CATEGORY_MAP: Record<string, { category: string; severity: string; threatScore: number; tags: string[] }> = {
  // Adult content — Category A
  'www.adameve.com': { category: 'adult_content', severity: 'critical', threatScore: 85, tags: ['Category-A', 'Adult-Commerce', 'Sexualized-Behavior'] },
  'www.pornhub.com': { category: 'adult_content', severity: 'critical', threatScore: 95, tags: ['Category-A', 'Explicit', 'Adult-Media'] },
  'onlyfans.com': { category: 'adult_content', severity: 'critical', threatScore: 90, tags: ['Category-A', 'Parasocial', 'Subscription'] },
  // Social media
  'm.facebook.com': { category: 'social_media', severity: 'info', threatScore: 15, tags: ['Social', 'Facebook', 'Mobile'] },
  'www.facebook.com': { category: 'social_media', severity: 'info', threatScore: 15, tags: ['Social', 'Facebook'] },
  'www.instagram.com': { category: 'social_media', severity: 'info', threatScore: 20, tags: ['Social', 'Instagram'] },
  'www.pinterest.com': { category: 'social_media', severity: 'info', threatScore: 10, tags: ['Social', 'Pinterest'] },
  // Financial
  'secure07b.chase.com': { category: 'financial', severity: 'warning', threatScore: 30, tags: ['Banking', 'Chase', 'Financial-Activity'] },
  'myaccounts.capitalone.com': { category: 'financial', severity: 'warning', threatScore: 30, tags: ['Banking', 'CapitalOne'] },
  'verified.capitalone.com': { category: 'financial', severity: 'warning', threatScore: 25, tags: ['Banking', 'CapitalOne', 'Verification'] },
  'onlinebanking.usbank.com': { category: 'financial', severity: 'warning', threatScore: 30, tags: ['Banking', 'USBank'] },
  'www.creditonebank.com': { category: 'financial', severity: 'warning', threatScore: 30, tags: ['Banking', 'CreditOne'] },
  'amazon.syf.com': { category: 'financial', severity: 'info', threatScore: 20, tags: ['Credit', 'Amazon-Card'] },
  'oldnavy.syf.com': { category: 'financial', severity: 'info', threatScore: 15, tags: ['Credit', 'OldNavy-Card'] },
  // Shopping
  'www.walmart.com': { category: 'shopping', severity: 'info', threatScore: 5, tags: ['Retail', 'Walmart'] },
  'www.kroger.com': { category: 'shopping', severity: 'info', threatScore: 5, tags: ['Retail', 'Grocery'] },
  'www.walgreens.com': { category: 'shopping', severity: 'info', threatScore: 5, tags: ['Retail', 'Pharmacy'] },
  'www.ipsy.com': { category: 'shopping', severity: 'info', threatScore: 10, tags: ['Retail', 'Beauty', 'Subscription'] },
  'www.shutterfly.com': { category: 'shopping', severity: 'info', threatScore: 5, tags: ['Retail', 'Photos'] },
  'www.pamperedchef.com': { category: 'shopping', severity: 'info', threatScore: 5, tags: ['Retail', 'Cooking', 'MLM-Indicator'] },
  // Search & activity
  'www.google.com': { category: 'search', severity: 'info', threatScore: 5, tags: ['Search', 'Google'] },
  'myactivity.google.com': { category: 'surveillance', severity: 'warning', threatScore: 35, tags: ['Activity-Review', 'Google', 'Awareness-Indicator'] },
  'myaccount.google.com': { category: 'account_management', severity: 'info', threatScore: 10, tags: ['Account', 'Google'] },
  'support.google.com': { category: 'search', severity: 'info', threatScore: 5, tags: ['Support', 'Google'] },
  // Real estate
  'www.sunrealtync.com': { category: 'real_estate', severity: 'warning', threatScore: 40, tags: ['Real-Estate', 'Relocation-Indicator', 'Life-Change'] },
  // Utilities
  'www.appalachianpower.com': { category: 'utilities', severity: 'info', threatScore: 5, tags: ['Utility', 'Power'] },
  'www.sprint.com': { category: 'utilities', severity: 'info', threatScore: 10, tags: ['Telecom', 'Sprint'] },
  // Photography/memories
  'my.lifetouch.com': { category: 'personal', severity: 'info', threatScore: 5, tags: ['Photography', 'Family'] },
  // Media
  'media': { category: 'media', severity: 'info', threatScore: 5, tags: ['Local-Media'] },
  // Suspicious
  'kivitu.com': { category: 'unknown', severity: 'warning', threatScore: 45, tags: ['Unknown-Domain', 'Investigate'] },
};

function classifyDomain(domain: string): { category: string; severity: string; threatScore: number; tags: string[] } {
  if (CATEGORY_MAP[domain]) return CATEGORY_MAP[domain];
  
  // Pattern matching
  if (domain.includes('dating') || domain.includes('tinder') || domain.includes('bumble') || domain.includes('hinge'))
    return { category: 'dating', severity: 'critical', threatScore: 90, tags: ['Category-C', 'Dating-App'] };
  if (domain.includes('porn') || domain.includes('xxx') || domain.includes('adult'))
    return { category: 'adult_content', severity: 'critical', threatScore: 95, tags: ['Category-A', 'Adult'] };
  if (domain.includes('bank') || domain.includes('credit') || domain.includes('pay'))
    return { category: 'financial', severity: 'warning', threatScore: 25, tags: ['Financial'] };
  if (domain.includes('facebook') || domain.includes('instagram') || domain.includes('twitter') || domain.includes('tiktok'))
    return { category: 'social_media', severity: 'info', threatScore: 15, tags: ['Social'] };
  if (domain.includes('google'))
    return { category: 'search', severity: 'info', threatScore: 5, tags: ['Google'] };
  
  return { category: 'general', severity: 'info', threatScore: 5, tags: ['Uncategorized'] };
}

export function convertToEST(microseconds: number): { est: string; utc: string } {
  const ms = microseconds / 1000;
  const utcDate = new Date(ms);
  const estStr = utcDate.toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false });
  return { est: estStr, utc: utcDate.toISOString() };
}

export function classifyBrowserEntry(entry: {
  title: string;
  url: string;
  time_usec: number;
  page_transition: string;
  client_id: string;
}): ClassifiedEvent {
  let domain = '';
  try { domain = new URL(entry.url).hostname; } catch { domain = 'unknown'; }
  
  const classification = classifyDomain(domain);
  const { est, utc } = convertToEST(entry.time_usec);
  
  return {
    title: entry.title || 'Untitled',
    url: entry.url,
    domain,
    timestamp: est,
    timestampUtc: utc,
    category: classification.category,
    severity: classification.severity,
    platform: 'Chrome Browser',
    pageTransition: entry.page_transition,
    clientId: entry.client_id,
    threatScore: classification.threatScore,
    tags: classification.tags,
  };
}

export function generateDomainStats(events: ClassifiedEvent[]): Record<string, number> {
  const stats: Record<string, number> = {};
  events.forEach(e => { stats[e.domain] = (stats[e.domain] || 0) + 1; });
  return stats;
}

export function generateCategoryBreakdown(events: ClassifiedEvent[]): Record<string, number> {
  const cats: Record<string, number> = {};
  events.forEach(e => { cats[e.category] = (cats[e.category] || 0) + 1; });
  return cats;
}

export function generateTemporalHeatmap(events: ClassifiedEvent[]): Record<string, Record<string, number>> {
  const heatmap: Record<string, Record<string, number>> = {};
  events.forEach(e => {
    const date = e.timestampUtc.split('T')[0];
    const hour = new Date(e.timestampUtc).getUTCHours().toString();
    if (!heatmap[date]) heatmap[date] = {};
    heatmap[date][hour] = (heatmap[date][hour] || 0) + 1;
  });
  return heatmap;
}

export function detectAnomalies(events: ClassifiedEvent[]): ClassifiedEvent[] {
  // Anomalies: late-night adult browsing, activity spikes, unusual domains
  return events.filter(e => {
    const hour = new Date(e.timestampUtc).getUTCHours();
    // Late-night critical content (11PM-5AM EST is ~4AM-10AM UTC)
    const isLateNight = hour >= 3 && hour <= 10;
    if (isLateNight && e.severity === 'critical') return true;
    if (e.threatScore >= 70) return true;
    return false;
  });
}
