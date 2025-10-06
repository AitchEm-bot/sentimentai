import type { CallAnalysis } from '@/types/CallAnalysis';

// Import the actual analysis data from knowledge-base
import angryData from '../../knowledge-base/analysis/angry_analysis.json';
import happyData from '../../knowledge-base/analysis/happy_analysis.json';
import normalData from '../../knowledge-base/analysis/normal_analysis.json';

export const callAnalyses: Record<string, CallAnalysis> = {
  angry: angryData as CallAnalysis,
  happy: happyData as CallAnalysis,
  normal: normalData as CallAnalysis,
};

// Helper to get sentiment score from emotional_ranking (convert 1-10 to percentage)
export const getSentimentScore = (emotionalRanking: number): number => {
  return emotionalRanking * 10;
};

// Helper to determine sentiment label
export const getSentimentLabel = (emotionalRanking: number): string => {
  if (emotionalRanking >= 8) return 'Positive';
  if (emotionalRanking >= 4) return 'Neutral';
  return 'Negative';
};

// Helper to get emotions from analysis
export const extractEmotions = (analysis: CallAnalysis): string[] => {
  const scenario = analysis.scenario;

  if (scenario === 'angry') {
    return ['Frustration', 'Disappointment', 'Urgency'];
  } else if (scenario === 'happy') {
    return ['Gratitude', 'Satisfaction', 'Trust'];
  } else {
    return ['Curiosity', 'Patience', 'Professionalism'];
  }
};
