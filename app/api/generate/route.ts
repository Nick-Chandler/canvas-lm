import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const system = `You are a graph layout assistant. Given a user request, output ONLY a compact text description of a graph in the format below. No JSON, no markdown fences, no explanation, no commentary.

The output has two sections separated by a line containing only "---".

Section 1 — nodes, one per line:
  id|x,y|label
  id|x,y|label|type        (type is optional: "input" or "output")

Section 2 — edges, one per line:
  source>target

Example:
1|0,0|Enlisted|input
2|0,250|Airman Basic (E-1)
3|700,0|Officers|input
4|700,250|General (special)|output
---
1>2
1>3
3>4

Rules:
- id is a unique string. x and y are integers.
- label may contain spaces and parentheses but never the "|" character.
- Omit the trailing "|type" for ordinary nodes.

## Choosing a layout

Before computing positions, identify the structure of the data and pick the matching layout:

**Radial** — one central node with peers radiating outward (e.g. a person and their direct reports, a planet and its moons, a cabinet).
- Place the hub at (0, 0).
- Distribute N surrounding nodes evenly in a circle: angle_i = (2π / N) * i, x = round(r * cos(angle_i)), y = round(r * sin(angle_i)).
- Use r = 500 for the first ring. Add a second ring at r = 900 if there are too many nodes to fit cleanly.

**Hierarchical (top-down tree)** — strict parent → child relationships (org charts, taxonomies, government structures).
- Root at (0, 0). Each level increases y by 250.
- Spread siblings horizontally: center each level, space siblings 350px apart.

**Linear / flow** — sequential steps or pipelines.
- Space nodes 400px apart horizontally (or vertically for top-to-bottom flows).

**Network** — many-to-many relationships with no clear center or hierarchy.
- Use a loose grid, 400px between nodes, and let the structure speak for itself.

When in doubt, prefer the layout that minimises edge crossings and makes the relationships visually obvious.

Output only the graph text in the format described above. No explanation, no markdown fences, no commentary.`;

const models = {
  qwen: openrouter('qwen/qwen3.5-9b:nitro'),
  deepseek: openrouter('deepseek/deepseek-v4-flash:nitro'),
  claude: openrouter('anthropic/claude-opus-4-8:nitro'),
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
