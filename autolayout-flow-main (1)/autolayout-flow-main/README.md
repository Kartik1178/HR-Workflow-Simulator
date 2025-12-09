# HR Workflow Designer — Enterprise Version

A visual workflow designer for HR processes built with React, TypeScript, and React Flow.

## Features

- **Visual Canvas** — Drag-and-drop workflow design
- **5 Node Types** — Start, Task, Approval, Automated, End
- **Smart Edges** — Custom edges with probability weights
- **Auto-Layout** — Dagre-powered arrangement (TB/LR)
- **Simulation** — Step-by-step workflow execution
- **Validation** — Cycle detection, orphan nodes, missing connections
- **Analytics** — Health score, automation coverage, problem detection
- **Versioning** — Save, restore, compare versions (localStorage)
- **Import/Export** — JSON workflow sharing

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + Z` | Undo |
| `⌘/Ctrl + Shift + Z` | Redo |
| `⌘/Ctrl + S` | Save |
| `⌘/Ctrl + D` | Duplicate |
| `⌘/Ctrl + C/V` | Copy/Paste |
| `Delete` | Delete selected |

## Tech Stack

React 18, TypeScript, Vite, React Flow, Zustand, Dagre, TailwindCSS, Shadcn/ui

## Getting Started

```bash
npm install
npm run dev
```

## File Structure

```
src/
├── components/
│   ├── nodes/          # StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode
│   ├── edges/          # CustomEdge
│   ├── layout/         # Sidebar, Topbar
│   └── panels/         # NodeInspector, EdgeInspector, Simulation, Analytics, Version
├── state/              # Zustand store
├── hooks/              # useWorkflow, useSimulation, useValidation
├── utils/              # autoLayout, validators, storage, edgeMetrics
└── pages/              # Designer, Index
```

Built with Lovable
