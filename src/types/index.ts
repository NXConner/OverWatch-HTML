export type OperatingMode = 'ISAC' | 'ANNA';

export type ThreatCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type ViewTab = 'radar' | 'timeline' | 'map' | 'network' | 'echo' | 'psych';

export type EventPlatform =
  | 'google' | 'safari' | 'chrome' | 'firefox'
  | 'instagram' | 'snapchat' | 'tiktok' | 'twitter' | 'facebook'
  | 'whatsapp' | 'telegram' | 'signal' | 'imessage'
  | 'gps' | 'wifi' | 'bluetooth' | 'cellular'
  | 'vault' | 'calculator_app' | 'notepad'
  | 'pornhub' | 'onlyfans' | 'reddit'
  | 'venmo' | 'cashapp' | 'zelle'
  | 'tinder' | 'bumble' | 'hinge'
  | 'uber' | 'unknown';

export interface ForensicEvent {
  id: string;
  timestamp: string;
  platform: EventPlatform;
  category: ThreatCategory;
  title: string;
  description: string;
  intensity: number;
  coordinates?: { lat: number; lng: number };
  metadata?: Record<string, string>;
  flagged: boolean;
  marked: boolean;
}

export interface SubjectProfile {
  codename: string;
  realName?: string;
  avatarUrl?: string;
  age?: number;
  baselineMetrics: {
    avgDailyScreenTime: number;
    peakActivityHour: number;
    primaryPlatforms: EventPlatform[];
    circadianDeviation: number;
    socialMediaFrequency: number;
  };
  sourceDistribution: Record<EventPlatform, number>;
  riskScore: number;
}

export interface GottmanScores {
  criticism: number;
  contempt: number;
  defensiveness: number;
  stonewalling: number;
  magicRatio: number;
}

export interface AnalysisResults {
  gottman: GottmanScores;
  recidivismScore: number;
  deceptionIndex: number;
  sentimentTimeline: { date: string; score: number }[];
  socialPerformance: {
    public: number;
    private: number;
    delta: number;
  };
  targetFixation: {
    target: string;
    searchFrequency: number;
    contactAttempts: number;
    mentionCount: number;
  };
  ldaTopics: { topic: string; weight: number }[];
}

export interface ContextInjection {
  temporalAnchors: { label: string; date: string; description: string }[];
  knownEntities: { name: string; relationship: string; risk: ThreatCategory }[];
  externalTargets: { name: string; platform: EventPlatform; notes: string }[];
  relationalBaseline: { metric: string; value: string }[];
}

export interface CLIHistoryEntry {
  timestamp: string;
  command: string;
  output: string;
  type: 'input' | 'output' | 'error' | 'system';
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'subject' | 'contact' | 'target' | 'entity';
  classification: ThreatCategory;
  interactionCount: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  platform: EventPlatform;
}
