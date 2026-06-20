### Canvas LM
By Nicholas Chandler

## An AI-Native diagramming tool that let's you easily create and edit diagrams using natural language prompts

# Why create this
- The simple answer is I wanted a tool just like this to help me visualize concepts, specifically one that I could iteratively edit by prompting. 

- The closest I could find was Whimsical.com but it does not support iterative edits by prompting (also the whole AI integration feels a bit stiff in my opinion)

- I wanted something that felt intutive that I could go back and forth with


# Tech Stack
- Typescript
- Next.js + React
- Vercel AI SDK
- Vercel Neon (Database/Auth)
- OpenRouter (Inference router)
- Google Gemini Flash 3.5 + Kimi K2.6 (Models)
- Vercel (deployment)
- Terraform (IaC)

# Features
- Edit existing diagrams with prompts (e.g. "Remove the western conference teams from the NBA teams diagram")
- Request a diagram type in natural language or let the model decide
- Manual node placement/editing
- Sign in and save your workspaces
- Model selection (fastest/smartest) - COMING SOON

# Diagram Types
- Flowchart - Branching logic
- Hierarchical - Top down hierarchical structure
- Radial - Hub and spoke 
- Mindmap - Multi-level web diagram
- Network - Many-to-many relationship modeling (Also the fallback)

# Planned Updates - roughly in order of priority

High Priority
----------------
- Model selection (fastest/smartest) - ON DECK
- Instructions button (renders instructions as nodes)
- New elements to add to canvas (icons, shapes, textboxes, etc.) 
- Node "Handle" cleanup
- Node + Edge customization
- Themes

Lower Priority
---------------
- Mobile UI
- Workspace sharing

Brainstorms
---------------
- Cartesian cordinate graph for math equations
- Graphs & Charts (Bar graph, Pie Chart, Line Graph, Scatterplot, etc.)
- Side conversations (similar to /btw in Claude Code)
- File Upload
- Image Upload

# Known Limitations/Bugs - roughly in order of severity
- Auth setup incomplete (cannot save diagrams yet) - IN PROGRESS
- Does not yet support multiple diagrams
