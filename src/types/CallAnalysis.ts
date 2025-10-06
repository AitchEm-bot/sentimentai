export interface Speaker {
  speaker: string;
  text: string;
  timestamp: {
    start: number;
    end: number;
  };
}

export interface KeyMoment {
  timestamp?: string;
  description?: string;
}

export interface CallAnalysis {
  filename: string;
  scenario: 'angry' | 'happy' | 'normal';
  duration_seconds: number;
  emotional_ranking: number;
  agent_score: number;
  customer_satisfaction: string;
  transcript: Speaker[];
  analysis: {
    customer_emotional_state: string;
    agent_performance: string;
    key_moments: (string | KeyMoment)[];
    overall_verdict: string;
    handled_well: boolean;
    recommendations: string[];
  };
  raw_sentiment?: unknown;
}
