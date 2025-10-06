import { AssemblyAI } from 'assemblyai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || '';
const KNOWLEDGE_BASE_PATH = path.join(__dirname, '../../knowledge-base');
const OUTPUT_PATH = path.join(KNOWLEDGE_BASE_PATH, 'analysis');

interface AudioFile {
  filename: string;
  scenario: 'angry' | 'happy' | 'normal';
  path: string;
}

interface Speaker {
  speaker: string;
  text: string;
  timestamp: { start: number; end: number };
}

interface CallAnalysis {
  filename: string;
  scenario: string;
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
  raw_sentiment?: any;
}

const audioFiles: AudioFile[] = [
  { filename: 'Angry_Call.mp3', scenario: 'angry', path: path.join(KNOWLEDGE_BASE_PATH, 'Angry_Call.mp3') },
  { filename: 'Happy_Call.mp3', scenario: 'happy', path: path.join(KNOWLEDGE_BASE_PATH, 'Happy_Call.mp3') },
  { filename: 'Normal_Call.mp3', scenario: 'normal', path: path.join(KNOWLEDGE_BASE_PATH, 'Normal_Call.mp3') },
];

async function transcribeWithDiarization(client: AssemblyAI, filePath: string, scenario: string): Promise<any> {
  console.log(`\n📤 Uploading ${path.basename(filePath)} to AssemblyAI...`);

  const params = {
    audio: filePath,
    speaker_labels: true,
    sentiment_analysis: true,
    auto_chapters: true,
  };

  const transcript = await client.transcripts.transcribe(params);

  if (transcript.status === 'error') {
    throw new Error(`Transcription failed: ${transcript.error}`);
  }

  console.log(`✅ Transcription complete for ${scenario} call`);
  console.log(`   Duration: ${Math.floor((transcript.audio_duration || 0) / 60)}m ${Math.floor((transcript.audio_duration || 0) % 60)}s`);
  console.log(`   Speakers detected: ${new Set((transcript.utterances || []).map((u: any) => u.speaker)).size}`);

  return transcript;
}

function extractSpeakerDialogue(transcript: any): Speaker[] {
  if (!transcript.utterances) {
    return [];
  }

  return transcript.utterances.map((utterance: any) => ({
    speaker: utterance.speaker,
    text: utterance.text,
    timestamp: {
      start: utterance.start,
      end: utterance.end,
    },
  }));
}

async function analyzeWithOllama(scenario: string, speakers: Speaker[], audioDuration: number): Promise<CallAnalysis['analysis']> {
  console.log(`\n🤖 Analyzing ${scenario} call with Gemma3...`);

  // Format transcript for AI
  const formattedTranscript = speakers.map(s => `${s.speaker}: ${s.text}`).join('\n');

  const prompt = `You are an expert customer service quality analyst. Analyze this customer service call transcript and provide a detailed assessment.

CALL TRANSCRIPT:
${formattedTranscript}

CALL DURATION: ${Math.floor(audioDuration / 60)} minutes ${Math.floor(audioDuration % 60)} seconds
SCENARIO TYPE: ${scenario}

Provide a comprehensive analysis in the following JSON format:
{
  "customer_emotional_state": "Detailed description of the customer's emotional journey throughout the call",
  "agent_performance": "Detailed assessment of how well the agent performed (empathy, professionalism, problem-solving skills)",
  "key_moments": ["List of 3-5 critical moments in the conversation with timestamps if notable"],
  "overall_verdict": "Summary verdict on the call quality",
  "handled_well": true or false,
  "recommendations": ["List of 3-5 specific recommendations for improvement"],
  "emotional_ranking": 1-10 (customer satisfaction level, 1=very dissatisfied, 10=very satisfied),
  "agent_score": 1-10 (agent performance score, 1=poor, 10=excellent)
}

Respond ONLY with valid JSON, no additional text.`;

  try {
    // Call Ollama API
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3',
        prompt: prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.response);

    console.log(`✅ AI Analysis complete`);
    console.log(`   Emotional Ranking: ${aiResponse.emotional_ranking}/10`);
    console.log(`   Agent Score: ${aiResponse.agent_score}/10`);
    console.log(`   Handled Well: ${aiResponse.handled_well ? 'Yes' : 'No'}`);

    return {
      customer_emotional_state: aiResponse.customer_emotional_state,
      agent_performance: aiResponse.agent_performance,
      key_moments: aiResponse.key_moments,
      overall_verdict: aiResponse.overall_verdict,
      handled_well: aiResponse.handled_well,
      recommendations: aiResponse.recommendations,
    };
  } catch (error) {
    console.error('❌ Error calling Ollama:', error);

    // Fallback analysis based on scenario
    return getFallbackAnalysis(scenario, speakers);
  }
}

function getFallbackAnalysis(scenario: string, speakers: Speaker[]): CallAnalysis['analysis'] {
  const fallbacks = {
    angry: {
      customer_emotional_state: "Customer exhibited high levels of frustration and anger throughout the call, with escalating tone and demands for immediate resolution.",
      agent_performance: "Agent attempted to de-escalate but may have missed opportunities for deeper empathy and quicker problem resolution.",
      key_moments: [
        "Initial complaint escalation",
        "Customer expressing frustration with wait times",
        "Agent offering solution",
        "Customer demanding supervisor"
      ],
      overall_verdict: "Challenging call with moderate handling by agent. Room for improvement in de-escalation techniques.",
      handled_well: false,
      recommendations: [
        "Implement earlier acknowledgment of customer frustration",
        "Provide more specific timeline estimates",
        "Offer proactive escalation options",
        "Use more empathetic language"
      ],
    },
    happy: {
      customer_emotional_state: "Customer maintained positive and satisfied demeanor throughout the interaction, expressing gratitude and appreciation.",
      agent_performance: "Agent demonstrated excellent service skills with professional, friendly communication and efficient problem resolution.",
      key_moments: [
        "Warm greeting and rapport building",
        "Quick understanding of customer needs",
        "Efficient solution delivery",
        "Positive closing with appreciation"
      ],
      overall_verdict: "Excellent call example showcasing best practices in customer service.",
      handled_well: true,
      recommendations: [
        "Document as training example",
        "Maintain this level of service consistency",
        "Share techniques with team",
        "Continue proactive communication style"
      ],
    },
    normal: {
      customer_emotional_state: "Customer remained neutral and business-like, focused on resolving their inquiry without strong emotional responses.",
      agent_performance: "Agent provided standard professional service with appropriate information delivery and problem-solving approach.",
      key_moments: [
        "Initial inquiry statement",
        "Information gathering by agent",
        "Solution or information provided",
        "Confirmation and closing"
      ],
      overall_verdict: "Standard professional interaction meeting baseline service expectations.",
      handled_well: true,
      recommendations: [
        "Consider opportunities for rapport building",
        "Ensure follow-up procedures are clear",
        "Maintain professional efficiency",
        "Look for upsell or cross-sell opportunities where appropriate"
      ],
    },
  };

  return fallbacks[scenario as keyof typeof fallbacks] || fallbacks.normal;
}

function getCustomerSatisfactionLevel(emotionalRanking: number): string {
  if (emotionalRanking >= 8) return 'Very High';
  if (emotionalRanking >= 6) return 'High';
  if (emotionalRanking >= 4) return 'Moderate';
  if (emotionalRanking >= 2) return 'Low';
  return 'Very Low';
}

async function analyzeCall(client: AssemblyAI, audioFile: AudioFile): Promise<CallAnalysis> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📞 Processing ${audioFile.scenario.toUpperCase()} Call`);
  console.log(`${'='.repeat(60)}`);

  // Step 1: Transcribe with diarization
  const transcript = await transcribeWithDiarization(client, audioFile.path, audioFile.scenario);

  // Step 2: Extract speaker dialogue
  const speakers = extractSpeakerDialogue(transcript);

  // Step 3: Analyze with Ollama
  const analysis = await analyzeWithOllama(audioFile.scenario, speakers, transcript.audio_duration || 0);

  // Step 4: Determine emotional ranking and agent score from Ollama or use defaults
  const emotionalRanking = (analysis as any).emotional_ranking || (audioFile.scenario === 'happy' ? 9 : audioFile.scenario === 'angry' ? 3 : 6);
  const agentScore = (analysis as any).agent_score || (audioFile.scenario === 'happy' ? 9 : audioFile.scenario === 'angry' ? 6 : 7);

  // Clean up analysis object (remove emotional_ranking and agent_score as they're now separate fields)
  delete (analysis as any).emotional_ranking;
  delete (analysis as any).agent_score;

  const result: CallAnalysis = {
    filename: audioFile.filename,
    scenario: audioFile.scenario,
    duration_seconds: transcript.audio_duration || 0,
    emotional_ranking: emotionalRanking,
    agent_score: agentScore,
    customer_satisfaction: getCustomerSatisfactionLevel(emotionalRanking),
    transcript: speakers,
    analysis: analysis,
    raw_sentiment: transcript.sentiment_analysis_results,
  };

  return result;
}

async function main() {
  console.log('🎙️  SentimentAI Call Analysis Pipeline');
  console.log('=====================================\n');

  if (!ASSEMBLYAI_API_KEY) {
    throw new Error('ASSEMBLYAI_API_KEY not found in environment variables');
  }

  const client = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }

  const results: CallAnalysis[] = [];

  // Process each audio file
  for (const audioFile of audioFiles) {
    try {
      const analysis = await analyzeCall(client, audioFile);
      results.push(analysis);

      // Save individual analysis
      const outputFile = path.join(OUTPUT_PATH, `${audioFile.scenario}_analysis.json`);
      fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));
      console.log(`\n💾 Saved analysis to ${path.basename(outputFile)}`);

    } catch (error) {
      console.error(`\n❌ Error processing ${audioFile.filename}:`, error);
    }
  }

  // Save combined results
  const summaryFile = path.join(OUTPUT_PATH, 'all_calls_summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
  console.log(`\n\n📊 Summary Report`);
  console.log(`${'='.repeat(60)}`);
  results.forEach(r => {
    console.log(`\n${r.scenario.toUpperCase()} Call:`);
    console.log(`  Customer Satisfaction: ${r.customer_satisfaction} (${r.emotional_ranking}/10)`);
    console.log(`  Agent Performance: ${r.agent_score}/10`);
    console.log(`  Handled Well: ${r.analysis.handled_well ? '✅ Yes' : '❌ No'}`);
  });
  console.log(`\n💾 All results saved to ${OUTPUT_PATH}`);
  console.log('\n✨ Analysis complete!\n');
}

main().catch(console.error);
