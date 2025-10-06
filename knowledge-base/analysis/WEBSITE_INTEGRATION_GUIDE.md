# Website Integration Guide

This guide explains how to integrate the call analysis data into your SentimentAI website showcase.

---

## 📦 Available Data

All analysis results are in `/knowledge-base/analysis/`:
- `angry_analysis.json`
- `happy_analysis.json`
- `normal_analysis.json`
- `all_calls_summary.json`

Audio snippets (30 seconds each) will be in `/knowledge-base/snippets/` after running:
```bash
cd voice-server
npm run extract-snippets
```

---

## 🎯 Component Structure Recommendation

### 1. Create TypeScript Interface

```typescript
// src/types/CallAnalysis.ts
export interface Speaker {
  speaker: string;
  text: string;
  timestamp: {
    start: number;
    end: number;
  };
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
    key_moments: string[];
    overall_verdict: string;
    handled_well: boolean;
    recommendations: string[];
  };
}
```

### 2. Import Analysis Data

```typescript
// src/data/callAnalyses.ts
import angryData from '@/../../knowledge-base/analysis/angry_analysis.json';
import happyData from '@/../../knowledge-base/analysis/happy_analysis.json';
import normalData from '@/../../knowledge-base/analysis/normal_analysis.json';

export const callAnalyses = {
  angry: angryData,
  happy: happyData,
  normal: normalData,
};
```

### 3. Create Showcase Component

```tsx
// src/components/CallShowcase.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, TrendingUp, TrendingDown } from 'lucide-react';
import type { CallAnalysis } from '@/types/CallAnalysis';

interface CallShowcaseProps {
  scenario: 'angry' | 'happy' | 'normal';
  analysis: CallAnalysis;
}

export default function CallShowcase({ scenario, analysis }: CallShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const scenarioConfig = {
    angry: {
      color: 'red',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-orange-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-900',
      borderColor: 'border-red-200',
    },
    happy: {
      color: 'green',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
      borderColor: 'border-green-200',
    },
    normal: {
      color: 'blue',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      borderColor: 'border-blue-200',
    },
  };

  const config = scenarioConfig[scenario];

  return (
    <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-2xl font-bold ${config.textColor} capitalize`}>
          {scenario} Customer Call
        </h3>
        <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white font-semibold`}>
          {analysis.analysis.handled_well ? '✓ Handled Well' : '✗ Needs Improvement'}
        </div>
      </div>

      {/* Audio Player */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <audio
          src={`/audio/${scenario}_snippet.mp3`}
          controls
          className="w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <p className="text-sm text-gray-500 mt-2">
          30-second excerpt • Full call: {Math.floor(analysis.duration_seconds / 60)}m {analysis.duration_seconds % 60}s
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Customer Satisfaction */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Customer Satisfaction</span>
            {analysis.emotional_ranking >= 6 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold">{analysis.emotional_ranking}/10</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`}
              style={{ width: `${analysis.emotional_ranking * 10}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{analysis.customer_satisfaction}</p>
        </div>

        {/* Agent Performance */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Agent Performance</span>
          </div>
          <div className="text-3xl font-bold">{analysis.agent_score}/10</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`}
              style={{ width: `${analysis.agent_score * 10}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {analysis.agent_score >= 8 ? 'Excellent' : analysis.agent_score >= 6 ? 'Good' : 'Needs Work'}
          </p>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="space-y-4">
        {/* Customer State */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-2">Customer Emotional State</h4>
          <p className="text-sm text-gray-700">{analysis.analysis.customer_emotional_state}</p>
        </div>

        {/* Agent Performance */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-2">Agent Performance Analysis</h4>
          <p className="text-sm text-gray-700">{analysis.analysis.agent_performance}</p>
        </div>

        {/* Key Moments */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-2">Key Moments</h4>
          <ul className="space-y-2">
            {analysis.analysis.key_moments.slice(0, 3).map((moment, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className={`inline-block w-2 h-2 rounded-full ${config.bgColor} mr-2 mt-1.5`} />
                {moment}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-2">AI Recommendations</h4>
          <ul className="space-y-2">
            {analysis.analysis.recommendations.slice(0, 3).map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-2" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### 4. Add to Demo Section

```tsx
// src/app/components/landing/DemoShowcase.tsx
import CallShowcase from '@/components/CallShowcase';
import { callAnalyses } from '@/data/callAnalyses';

export default function DemoShowcase() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          See SentimentAI in Action
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <CallShowcase scenario="angry" analysis={callAnalyses.angry} />
          <CallShowcase scenario="happy" analysis={callAnalyses.happy} />
          <CallShowcase scenario="normal" analysis={callAnalyses.normal} />
        </div>
      </div>
    </section>
  );
}
```

---

## 📁 File Organization

```
src/
├── components/
│   └── CallShowcase.tsx          # Main showcase component
├── data/
│   └── callAnalyses.ts           # Import analysis JSON files
├── types/
│   └── CallAnalysis.ts           # TypeScript interfaces
└── app/
    └── components/landing/
        └── DemoShowcase.tsx      # Updated demo section

public/
└── audio/
    ├── Angry_Call_snippet.mp3
    ├── Happy_Call_snippet.mp3
    └── Normal_Call_snippet.mp3

knowledge-base/
├── analysis/
│   ├── angry_analysis.json
│   ├── happy_analysis.json
│   ├── normal_analysis.json
│   └── all_calls_summary.json
└── snippets/
    ├── Angry_Call_snippet.mp3
    ├── Happy_Call_snippet.mp3
    └── Normal_Call_snippet.mp3
```

---

## 🎨 Design Recommendations

### Color Palette
- **Angry**: Red/Orange gradient (#EF4444 → #F97316)
- **Happy**: Green/Emerald gradient (#10B981 → #059669)
- **Normal**: Blue/Cyan gradient (#3B82F6 → #06B6D4)

### UI Elements
1. **Audio Player**: HTML5 audio with custom controls
2. **Progress Bars**: Animated gradient fills
3. **Metrics Cards**: White cards with subtle shadows
4. **Icons**: Lucide React icons for consistency
5. **Animations**: Framer Motion for smooth transitions

### Responsive Design
- **Mobile**: Stack cards vertically
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid

---

## 🚀 Quick Start

1. **Extract Audio Snippets**:
   ```bash
   cd voice-server
   npm run extract-snippets
   ```

2. **Move Snippets to Public Folder**:
   ```bash
   mkdir -p ../public/audio
   cp ../knowledge-base/snippets/*.mp3 ../public/audio/
   ```

3. **Create Type Definitions**:
   - Copy the TypeScript interface to `src/types/CallAnalysis.ts`

4. **Import Analysis Data**:
   - Create `src/data/callAnalyses.ts`
   - Import the JSON files

5. **Build Component**:
   - Create `src/components/CallShowcase.tsx`
   - Use the provided template

6. **Integrate into Demo**:
   - Update `DemoShowcase.tsx`
   - Add the three showcase cards

---

## 📊 Data Structure Reference

### Analysis JSON Structure
```json
{
  "filename": "Angry_Call.mp3",
  "scenario": "angry",
  "duration_seconds": 237,
  "emotional_ranking": 3,
  "agent_score": 6,
  "customer_satisfaction": "Low",
  "transcript": [
    {
      "speaker": "A",
      "text": "Hello.",
      "timestamp": { "start": 480, "end": 880 }
    }
  ],
  "analysis": {
    "customer_emotional_state": "...",
    "agent_performance": "...",
    "key_moments": ["...", "...", "..."],
    "overall_verdict": "...",
    "handled_well": false,
    "recommendations": ["...", "...", "..."]
  }
}
```

### Available Fields
- `filename`: Original audio file name
- `scenario`: "angry" | "happy" | "normal"
- `duration_seconds`: Total call duration
- `emotional_ranking`: 1-10 customer satisfaction score
- `agent_score`: 1-10 agent performance score
- `customer_satisfaction`: "Very Low" | "Low" | "Moderate" | "High" | "Very High"
- `transcript`: Array of speaker utterances with timestamps
- `analysis.customer_emotional_state`: Emotional journey description
- `analysis.agent_performance`: Agent evaluation
- `analysis.key_moments`: Array of critical conversation points
- `analysis.overall_verdict`: Summary assessment
- `analysis.handled_well`: Boolean indicating quality
- `analysis.recommendations`: Array of improvement suggestions

---

## 💡 Enhancement Ideas

1. **Interactive Transcript**: Click timestamp to jump to that moment in audio
2. **Expandable Sections**: Collapsible panels for detailed analysis
3. **Download Report**: Export analysis as PDF
4. **Comparison View**: Side-by-side comparison of all three scenarios
5. **Real-time Sentiment Graph**: Visual timeline of emotional changes
6. **Agent Scorecard**: Detailed breakdown of performance metrics

---

## 🔧 Troubleshooting

**Audio Not Playing**
- Ensure snippets are in `public/audio/` directory
- Check file paths in component
- Verify MP3 format compatibility

**TypeScript Errors**
- Ensure type definitions match JSON structure
- Add `resolveJsonModule: true` to `tsconfig.json`

**Missing Analysis Data**
- Run `npm run analyze-calls` to regenerate
- Check AssemblyAI API key is valid
- Verify Ollama is running with Gemma3 model

---

**Ready to integrate?** Follow the Quick Start steps above!

*Need help? Check the main README in `knowledge-base/analysis/`*
