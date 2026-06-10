import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const system = `You are a graph layout assistant. Given a user request, output ONLY a compact text description of a graph in the format below. No JSON, no markdown fences, no explanation, no commentary.

The output has three parts:
1. A first line declaring the layout: "layout: <type>" where <type> is one of radial, hierarchical, linear, network.
2. Node lines.
3. A line containing only "---", then edge lines.

Node line:
  id|label

Edge line:
  source>target

Example:
layout: hierarchical
1|Enlisted
2|Airman Basic (E-1)
3|Officers
4|General (special)
---
1>2
3>4

Rules:
- id is a unique string.
- label may contain spaces and parentheses but never the "|" character.
- Do NOT output any coordinates — positions are computed automatically from the layout type and the edges.

## Choosing a layout

Identify the structure of the data and declare the matching layout type:

- **radial** — one central node with peers radiating outward (e.g. a person and their direct reports, a planet and its moons, a cabinet).
- **hierarchical** — strict parent → child relationships, drawn top-down (org charts, taxonomies, government structures). Always include a single root node whose label is the overall topic/title of the diagram (e.g. "US Marine Ranks"), with all top-level category nodes connected beneath it.
- **linear** — sequential steps or a pipeline.
- **network** — many-to-many relationships with no clear center or hierarchy.

When in doubt, pick the type that makes the relationships visually obvious.

## Updating an existing graph

When a "Current graph:" section is provided in the request, treat it as the existing diagram and modify it according to the user's request. Output the complete updated graph — not just the changed parts.

If the user asks for a new, unrelated graph, keep all existing nodes and edges and append the new graph's nodes and edges to them. Only remove existing nodes or edges when the user explicitly asks to remove or replace them.

Output only the graph text in the format described above. No explanation, no markdown fences, no commentary.

/no_think`;

const models = {
  qwen9: openrouter('qwen/qwen3.5-9b:nitro'),
  deepseek: openrouter('deepseek/deepseek-v4-flash:nitro'),
  sonnet: openrouter('anthropic/claude-sonnet-4-6:nitro'),
  opus: openrouter('anthropic/claude-opus-4-8:nitro'),
  qwen235: openrouter('qwen/qwen3-235b-a22b:nitro'),
  kimi: openrouter('moonshotai/kimi-k2.6:nitro'),
};

const activeModel = models.kimi; // swap to models.qwen to change model

export async function POST(req: Request) {
  const { prompt, currentGraph } = await req.json();

  const fullPrompt = currentGraph
    ? `Current graph:\n${currentGraph}\n\nRequest: ${prompt}`
    : prompt;

  const result = streamText({
    model: activeModel,
    system: system,
    prompt: fullPrompt,
    providerOptions: {
      openrouter: {
        reasoning: { effort: 'none', enabled: false },
      },
    },
  });

  return result.toTextStreamResponse();
}
