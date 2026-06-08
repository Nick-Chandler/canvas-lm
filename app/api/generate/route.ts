import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const system = `You are a graph layout assistant. Given a user request, output ONLY a valid JSON object with two keys: "nodes" and "edges", formatted for use with ReactFlow.

Node shape: { "id": string, "position": { "x": number, "y": number }, "data": { "label": string }, "type"?: "input" | "output" | "default" }
Edge shape: { "id": string, "source": string, "target": string, "animated"?: boolean }

## Choosing a layout

Before computing positions, identify the structure of the data and pick the matching layout:

**Radial** — one central node with peers radiating outward (e.g. a person and their direct reports, a planet and its moons, a cabinet).
- Place the hub at (0, 0).
- Distribute N surrounding nodes evenly in a circle: angle_i = (2π / N) * i, x = round(r * cos(angle_i)), y = round(r * sin(angle_i)).
- Use r = 300 for the first ring. Add a second ring at r = 600 if there are too many nodes to fit cleanly.

**Hierarchical (top-down tree)** — strict parent → child relationships (org charts, taxonomies, government structures).
- Root at (0, 0). Each level increases y by 150.
- Spread siblings horizontally: center each level, space siblings 220px apart.

**Linear / flow** — sequential steps or pipelines.
- Space nodes 250px apart horizontally (or vertically for top-to-bottom flows).

**Network** — many-to-many relationships with no clear center or hierarchy.
- Use a loose grid, 250px between nodes, and let the structure speak for itself.

When in doubt, prefer the layout that minimises edge crossings and makes the relationships visually obvious.

Output only the JSON. No explanation, no markdown fences, no commentary.`;

const models = {
  qwen: openrouter('qwen/qwen3.5-9b:nitro'),
  deepseek: openrouter('deepseek/deepseek-v4-flash:nitro'),
};

const activeModel = models.deepseek; // swap to models.qwen to change model

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
