# app/api/ — Route handlers & the model contract

Next.js App Router route handlers. There is currently one route. Note that API routes are **not** middleware-auth-gated — the `proxy.ts` matcher excludes `api`.

## `generate/route.ts`

POST endpoint. Accepts `{ prompt, currentGraph? }`, calls OpenRouter via the Vercel AI SDK (`streamText`), and returns a **streamed plain-text** response (`toTextStreamResponse()`). When `currentGraph` is present, the prompt instructs the model to update/extend the existing diagram.

**Model selection**: `const activeModel = models.<key>` from a `models` map (gemini/qwen/deepseek/etc.; currently `gemini` → `google/gemini-3.5-flash:nitro`). Swap the key to change models. The compact-text format keeps responses small/fast across models.

## `generate/systems/systemPrompt.ts`

Exports the `system` prompt string. Prompts live in the `systems/` folder by convention. It defines the **compact graph text contract** the client parses:

1. a `layout: <type>` line,
2. then `id|label` node lines,
3. then a `---` separator,
4. then `source>target` edge lines (a flowchart-only `:label` may follow).

The prompt explicitly **forbids coordinates** — the client computes positions locally (see `app/canvas/CLAUDE.md`).

## Docs

- Vercel AI SDK → https://sdk.vercel.ai/llms.txt
- OpenRouter API → https://openrouter.ai/docs
- OpenRouter provider types (authoritative, local) → `node_modules/@openrouter/ai-sdk-provider/dist/index.d.ts`
- DeepSeek model parameters → https://api-docs.deepseek.com
- Qwen model list and parameters → https://openrouter.ai/models?q=qwen
