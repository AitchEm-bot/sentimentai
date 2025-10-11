import { OpenAI } from 'openai';
import config from '../config/env';
import { getSystemPrompt } from '../prompts/system-prompts';

class OpenAIRealtimeService {
  createClient(): OpenAI {
    return new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  getSystemPrompt(locale: string = 'en'): string {
    return getSystemPrompt(locale);
  }
}

export default new OpenAIRealtimeService();
