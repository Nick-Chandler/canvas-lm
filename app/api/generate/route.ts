import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const system = 'Respond with no explanation, clarification, justification, or anything of the sort. \
  Never add any additional context or commentary.';

const models = {
  qwen: openrouter('qwen/qwen3.5-9b:nitro'),
  deepseek: openrouter('deepseek/deepseek-v4-flash:nitro'),
};

const activeModel = models.qwen; // swap to models.qwen to change model

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: activeModel,
    system: system,
    prompt,
    providerOptions: {
      openrouter: {
        reasoning: { effort: 'none', enabled: false },
      },
    },
  });

  return result.toTextStreamResponse();
}
