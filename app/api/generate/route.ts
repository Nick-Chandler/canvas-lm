import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { text } = await generateText({
    model: openrouter('qwen/qwen3.5-9b'),
    prompt,
  });

  return Response.json({ text });
}
