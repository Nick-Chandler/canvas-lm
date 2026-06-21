import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { system } from './systems/systemPrompt';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

const models = {
  qwen9: openrouter('qwen/qwen3.5-9b:nitro'),
  deepseek: openrouter('deepseek/deepseek-v4-flash:nitro'),
  sonnet: openrouter('anthropic/claude-sonnet-4-6:nitro'),
  opus: openrouter('anthropic/claude-opus-4-8:nitro'),
  qwen235: openrouter('qwen/qwen3-235b-a22b:nitro'),
  kimi: openrouter('moonshotai/kimi-k2.6:nitro'),
  gemini: openrouter('google/gemini-3.5-flash:nitro'),
};

const activeModel = models.gemini; // swap to models.qwen to change model

export async function POST(req: Request) {
  const { prompt, currentGraph } = await req.json();

  const fullPrompt = currentGraph
    ? `Current graph:\n${currentGraph}\n\nRequest: ${prompt}`
    : prompt;

  const result = streamText({
    model: activeModel,
    system: system,
    prompt: fullPrompt,
    maxOutputTokens: 5000,
    providerOptions: {
      openrouter: {
        reasoning: { effort: 'minimal', exclude: true },
        plugins: [{ id: 'web', engine: 'native' }],
      },
    },
  });

  return result.toTextStreamResponse();
}
