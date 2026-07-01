# app/api/ — Route handlers & the model contract

Next.js App Router route handlers. Most API routes are **not** middleware-auth-gated — the `proxy.ts` matcher excludes `api`. The exception is `/api/save`, which is added back explicitly to the matcher so `clerkMiddleware()` runs and its `auth()` call has context. Middleware there attaches Clerk context but does not block the route; `save/route.ts` gates itself with its own `userId` check.

## `generate/route.ts`

POST endpoint. Accepts `{ prompt, currentGraph? }`, calls OpenRouter via the Vercel AI SDK (`streamText`), and returns a **streamed plain-text** response (`toTextStreamResponse()`). When `currentGraph` is present, the prompt instructs the model to update/extend the existing diagram.

**Model selection**: `const activeModel = models.<key>` from a `models` map (gemini/qwen/deepseek/etc.; currently `gemini` → `google/gemini-3.5-flash:nitro`). Swap the key to change models. The compact-text format keeps responses small/fast across models.

## `save/route.ts`

POST endpoint that persists the current canvas. Calls Clerk `auth()` and returns **401 when there's no `userId`**. Reads `{ nodes, edges, layout }` from the body, finds the user's existing row via `getMostRecentWorkspace`, upserts it via `saveWorkspace` (both from `@/app/lib/db`), and returns the saved row as JSON. This is the one API route the `proxy.ts` matcher re-includes (see intro).

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
