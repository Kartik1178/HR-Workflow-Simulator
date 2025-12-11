# 🌟 HR Workflow Designer – README

The intended outcome of this project was to create a comprehensive workflow builder and simulator drawing ideas from the existing tools like Zapier, Workato, and Notion Automations. The main idea was to design an HR-oriented workflow designer with a visual interface that supports automated processes built by dragging and dropping, controlling versions, simulating, analyzing, and much more.

The entire project was done in React + TypeScript, Zustand for managing state, React Flow for the canvas, and a custom-made simulation + validation engine.

---

# 🏛️ Architecture Overview

The application follows a clean, modular architecture:

## 1. UI Layer (React + Tailwind + ShadCN)

- Canvas editor (React Flow)
- Node palette with drag-and-drop nodes
- Context menu & inspector panel
- Modals, side panels (Versions, Analytics)
- Custom theming / dark mode-ready

## 2. State Management (Zustand)

- Nodes
- Edges
- Undo/Redo history
- Validation state
- Simulation state
- Versioning state

I intentionally avoided Redux to keep the project simpler and more performant.

## 3. Workflow Engine

Core logic lives in /utils:

- validation.ts → checks errors, warnings, missing approvers, isolated nodes, invalid endings
- simulation.ts → generates BFS-based execution steps, highlights nodes/edges, speed controls
- storage.ts → versioning, export/import, diffing system
- automations.json → mock API for automated actions

## 4. Panels (Sidebars)

- Versions Panel → save, restore, diff, delete versions
- Analytics Panel → workflow health, problem nodes, cycle time estimate, coverage
- Inspector Panel → node-level data like labels, approvers, parameters

## 5. Mock API

Instead of connecting to a backend, I used a small fake API:

- getAutomations() → returns automation definitions

This matches the project specification and allows the "Automated" node to load dynamic actions.

---

# ▶️ How to Run the Project

1. Check that you are in the right directory (autoflow-layout-main)
2. Install dependencies  
   - npm install
3. Start development server  
   - npm run dev
4. Open the app  
   - http://localhost:5173
5. Build for production  
   - npm run build

The app uses Vite, so it's extremely fast to compile and preview.

---

# 🎨 Design Decisions & Why I Made Them

Here are the most important things I intentionally chose while building:

## 1. Zustand over Redux

I wanted:

- minimal boilerplate
- direct set/get access
- small bundle size
- easy undo/redo implementation

Zustand’s immer-based update system was perfect.

## 2. React Flow for Node Editor

Re-building a full graph editor manually would take weeks. React Flow already has:

- edge creation
- node dragging
- multi-selection
- zoom / pan
- connection handles

I customized the theme and wrapped it with my own business logic.

## 3. LocalStorage Versioning (No DB Needed)

The project spec required version history, but not a backend. So I built:

- deep-cloned version snapshots
- diff calculation
- restore/delete
- auto-sync between browser tabs

## 4. BFS-based Simulation

I used a topological BFS-style traversal because:

- workflows are DAGs (usually)
- BFS ensures predictable step ordering
- supports branching and parallel-like flow

Simulation also:

- highlights nodes
- highlights edges
- supports speed controls
- logs execution steps

## 5. Mock Automation API

Since there is no backend, I loaded automation definitions from automations.json.  
This still makes the Automated node feel dynamic.

---

# ✔️ What I Completed

Core Features:

- Drag-and-drop workflow builder
- Connect nodes visually
- Simulation engine (play/pause/reset/speed)
- Node inspector
- Full validation system
- Tidy layout (horizontal/vertical)
- Export / Import workflow JSON
- Versioning (save, restore, diff, delete)
- Analytics panel (health score, problem nodes, cycle time)
- Context menu (duplicate, delete, add notes)
- Create New Workflow (blank reset)

This covers almost everything requested in the spec.

---

# ✨ What I Would Add With More Time

If I had more time, these are the features I would extend next:

## 1. Conditional Logic (IF/ELSE Branching)

Currently, the flow is linear graph-based. I would add condition nodes like:

- IF approver = HR → go right
- ELSE → go down

## 2. Real Backend + User Auth

Move versioning and workflows to a database:

- Supabase
- Firebase
- Express

Plus:

- Authentication
- Multi-user editing

## 3. Multi-Start and Multi-End Support

- Allow multiple entry points and completion points.

## 4. Real Automation Execution

Connect automated nodes to real APIs:

- Slack
- Email
- Webhooks
- HRMS

## 5. Collaboration Mode

- Live cursors
- Real-time editing
- Comments on nodes

---

# 🏁 Final Notes

This project was built to replicate a real workflow automation builder with all essential features:

- editing
- simulation
- validation
- analytics
- versioning

It is structured so it can scale into a full production-level workflow engine later.
