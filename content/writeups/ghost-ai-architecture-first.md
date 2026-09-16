---
title: "Ghost AI: Architecture-First Engineering in the Age of AI Agents"
description: "A real-time collaborative workspace where you design systems instead of typing them, and the context-managed workflow that built it. Notes on what senior engineering looks like when implementation becomes a commodity."
date: 2026-05-04
tags: ["ai", "architecture", "next.js", "prisma", "postgres", "typescript", "tailwind", "liveblocks", "react-flow"]
category: "research"
---

## TL;DR

I built [Ghost AI](https://ghost-aildv.vercel.app/), a real-time collaborative workspace: a team describes a system in plain English, an agent lays it onto a shared canvas, the team refines the architecture together, and the final graph exports as a Markdown spec you can hand to an implementation pipeline.

The product is interesting. The workflow that produced it is more interesting.

Repo: [github.com/davidldv/ghost-ai](https://github.com/davidldv/ghost-ai) · Live: [ghost-aildv.vercel.app](https://ghost-aildv.vercel.app/)

Thanks to [JavaScript Mastery](https://www.youtube.com/@javascriptmastery). The tutorial that kicked this off gave a name to the architecture-first idea I'd been circling for months.

## The premise

The job of a senior engineer is quietly being rewritten. Less "writes the code," more "decides what code is worth writing, where it lives, and how the pieces talk to each other."

Three claims sit behind Ghost AI:

1. Implementation is becoming a commodity. Once a system is well specified, AI writes a working first pass in minutes.
2. Architecture isn't. Service boundaries, consistency models, failure domains, data ownership: those decisions compound for years.
3. The expensive mistakes are structural. A misplaced queue, a leaky abstraction, a coupling that should have been a contract. No autocomplete catches those.

So the bet is that the diagram, not the file tree, is the primary artifact.

## What it does

You open a workspace, type something like *"event-driven order pipeline with a payments service, an inventory service, and a notification fan-out"*, and an agent lays it onto a shared canvas: nodes for services, edges for contracts, grouped by failure domain. Your team joins the room, drags things around, refines, comments. When it looks right, you export a Markdown spec with the services, their responsibilities, data ownership, and integration points. That spec is the handoff to the implementation pipeline.

Key pieces:

- **Real-time canvas.** Multiplayer cursors, presence, conflict-free edits via [Liveblocks](https://liveblocks.io/).
- **Graph model.** [React Flow](https://reactflow.dev/) for the canvas. Nodes and edges are real entities, not pixels.
- **AI generation.** Vercel AI SDK plus Gemini. Prompts produce structured graph mutations, not free text.
- **Spec export.** The graph serializes to Markdown, readable for people and parseable for the next agent.
- **Templates.** Microservices, event-driven, and CI/CD starting points, so a new project forks an opinionated baseline instead of a blank canvas.

## Stack

Next.js 16 · React 19 · TypeScript · Prisma + Postgres · Liveblocks · React Flow · Vercel AI SDK + Gemini · Tailwind · shadcn/ui · NextAuth (Google/GitHub) · Vercel Blob.

A boring stack on purpose. The novelty is the workflow, not the dependencies.

## How it was built: context first, not code first

The interesting part wasn't the product. It's that the whole codebase runs off a small set of living context files that the agents, and I, read before writing anything:

| File | Purpose |
|------|---------|
| `project-overview.md` | What we're building and why |
| `architecture-context.md` | Boundaries, invariants, storage model, data ownership |
| `code-standards.md` | Conventions: naming, error handling, file layout |
| `progress-tracker.md` | Current state, updated after every change |

Every feature was scoped, designed, and reviewed against those docs *before* a line of code got written. The agents read the architecture before they implement. Drift gets caught at the spec layer instead of in code review.

That sounds like ceremony. In practice it's how you skip the much bigger ceremony of unwinding a bad decision three weeks later.

## What changes when context is the artifact

A few things broke from how I used to work:

- PRs got smaller and more obviously correct. When the spec already says "the canvas store owns node positions, Liveblocks owns presence only," the implementation has nowhere to drift.
- Onboarding an agent is the same as onboarding a teammate. Point it at the four files. Don't paste in code, paste in intent.
- Refactors stopped being scary. The contracts live in the docs, so if a refactor keeps the contracts, it's safe by construction.
- The model stopped being a faster keyboard and started being a junior architect who has actually read the design doc.

## Lessons

- The leverage is upstream. If you're prompting the model to write functions, you're using a Ferrari to deliver pizza. Prompt it to argue with your boundaries.
- A diagram is a contract, not a picture. Ghost AI exports Markdown instead of PNG because the next agent in the pipeline has to read it.
- Living docs beat stale docs beat no docs. A `progress-tracker.md` that's wrong by Friday is worse than none. The discipline is updating it in the same commit.
- Templates beat blank canvases. Most architecture mistakes start from zero when they should have started from "boring microservices baseline" and deleted what wasn't needed.

## Where this goes

Short list:

- **Multi-agent review.** A "principal engineer" agent that critiques the diagram against known patterns before export.
- **Spec to implementation handoff.** Pipe the exported Markdown straight into a Claude Code or Codex workflow with the four context files preloaded.
- **Diff view for diagrams.** Treat an architecture change like a code change: what got added, what coupling tightened, what boundary moved.
- **Cost and failure annotation.** Tag each node with blast radius and rough cost, so the diagram shows tradeoffs and not just topology.

## References

- [Ghost AI (live)](https://ghost-aildv.vercel.app/)
- [Ghost AI (repo)](https://github.com/davidldv/ghost-ai)
- [JavaScript Mastery](https://www.youtube.com/@javascriptmastery), the tutorial that started it
- [Liveblocks docs](https://liveblocks.io/docs)
- [React Flow](https://reactflow.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
