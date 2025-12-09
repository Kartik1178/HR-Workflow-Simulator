import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  WorkflowNode,
  WorkflowEdge,
  ValidationError,
  SimulationState,
  Automation,
} from '@/types/workflow';
import { validateWorkflow } from '@/utils/validators';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  validationErrors: ValidationError[];
  simulation: SimulationState;
  automations: Automation[];
  clipboard: { nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null;
  history: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }[];
  historyIndex: number;

  // Node actions
  setNodes: (nodes: WorkflowNode[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  // Edge actions
  setEdges: (edges: WorkflowEdge[]) => void;
  addEdge: (edge: WorkflowEdge) => void;
  updateEdge: (edgeId: string, data: Partial<WorkflowEdge['data']>) => void;
  deleteEdge: (edgeId: string) => void;

  // Selection
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;

  // Validation
  runValidation: () => void;

  // Simulation
  setSimulation: (simulation: Partial<SimulationState>) => void;
  setActiveNode: (nodeId: string | null) => void;
  setActiveEdge: (edgeId: string | null) => void;
  addSimulationStep: (step: SimulationState['steps'][0]) => void;
  resetSimulation: () => void;

  // Automations
  setAutomations: (automations: Automation[]) => void;

  // Clipboard
  copyNodes: (nodeIds: string[]) => void;
  pasteNodes: (position: { x: number; y: number }) => void;

  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Bulk operations
  deleteSelected: () => void;
}

const initialSimulationState: SimulationState = {
  isRunning: false,
  isPaused: false,
  currentNodeId: null,
  steps: [],
  speed: 'normal',
};

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    persist(
      (set, get) => ({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        validationErrors: [],
        simulation: initialSimulationState,
        automations: [],
        clipboard: null,
        history: [],
        historyIndex: -1,

        setNodes: (nodes) => {
          set({ nodes });
          get().runValidation();
        },

        addNode: (node) => {
          get().saveToHistory();
          set((state) => ({ nodes: [...state.nodes, node] }));
          get().runValidation();
        },

        updateNode: (nodeId, data) => {
          set((state) => ({
            nodes: state.nodes.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, ...data } }
                : node
            ),
          }));
          get().runValidation();
        },

        deleteNode: (nodeId) => {
          get().saveToHistory();
          set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== nodeId),
            edges: state.edges.filter(
              (e) => e.source !== nodeId && e.target !== nodeId
            ),
            selectedNodeId:
              state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          }));
          get().runValidation();
        },

        duplicateNode: (nodeId) => {
          const state = get();
          const node = state.nodes.find((n) => n.id === nodeId);
          if (!node) return;

          get().saveToHistory();
          const newNode: WorkflowNode = {
            ...node,
            id: `${node.type}-${Date.now()}`,
            position: {
              x: node.position.x + 50,
              y: node.position.y + 50,
            },
            data: {
              ...node.data,
              label: `${node.data.label} (copy)`,
            },
          };
          set((state) => ({ nodes: [...state.nodes, newNode] }));
          get().runValidation();
        },

        setEdges: (edges) => {
          set({ edges });
          get().runValidation();
        },

        addEdge: (edge) => {
          get().saveToHistory();
          set((state) => ({ edges: [...state.edges, edge] }));
          get().runValidation();
        },

        updateEdge: (edgeId, data) => {
          set((state) => ({
            edges: state.edges.map((edge) =>
              edge.id === edgeId ? { ...edge, data: { ...edge.data, ...data } } : edge
            ),
          }));
        },

        deleteEdge: (edgeId) => {
          get().saveToHistory();
          set((state) => ({
            edges: state.edges.filter((e) => e.id !== edgeId),
            selectedEdgeId:
              state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
          }));
          get().runValidation();
        },

        setSelectedNode: (nodeId) => {
          set({ selectedNodeId: nodeId, selectedEdgeId: null });
        },

        setSelectedEdge: (edgeId) => {
          set({ selectedEdgeId: edgeId, selectedNodeId: null });
        },

        runValidation: () => {
          const { nodes, edges } = get();
          const errors = validateWorkflow(nodes, edges);
          set({ validationErrors: errors });
        },

        setSimulation: (simulation) => {
          set((state) => ({
            simulation: { ...state.simulation, ...simulation },
          }));
        },

        setActiveNode: (nodeId) => {
          set((state) => ({
            nodes: state.nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                isExecuting: node.id === nodeId,
                isCompleted:
                  node.data.isCompleted ||
                  (state.simulation.currentNodeId === node.id && nodeId !== node.id),
              },
            })),
            simulation: { ...state.simulation, currentNodeId: nodeId },
          }));
        },

        setActiveEdge: (edgeId) => {
          set((state) => ({
            edges: state.edges.map((edge) => ({
              ...edge,
              animated: edge.id === edgeId,
              style: edge.id === edgeId 
                ? { stroke: 'hsl(142 76% 36%)', strokeWidth: 3 } 
                : undefined,
            })),
          }));
        },

        addSimulationStep: (step) => {
          set((state) => ({
            simulation: {
              ...state.simulation,
              steps: [...state.simulation.steps, step],
            },
          }));
        },

        resetSimulation: () => {
          set((state) => ({
            simulation: initialSimulationState,
            nodes: state.nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                isExecuting: false,
                isCompleted: false,
              },
            })),
            edges: state.edges.map((edge) => ({
              ...edge,
              animated: false,
              style: undefined,
            })),
          }));
        },

        setAutomations: (automations) => set({ automations }),

        copyNodes: (nodeIds) => {
          const { nodes, edges } = get();
          const selectedNodes = nodes.filter((n) => nodeIds.includes(n.id));
          const selectedEdges = edges.filter(
            (e) => nodeIds.includes(e.source) && nodeIds.includes(e.target)
          );
          set({ clipboard: { nodes: selectedNodes, edges: selectedEdges } });
        },

        pasteNodes: (position) => {
          const { clipboard } = get();
          if (!clipboard) return;

          get().saveToHistory();
          const idMap = new Map<string, string>();
          const newNodes = clipboard.nodes.map((node) => {
            const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            idMap.set(node.id, newId);
            return {
              ...node,
              id: newId,
              position: {
                x: position.x + (node.position.x - clipboard.nodes[0].position.x),
                y: position.y + (node.position.y - clipboard.nodes[0].position.y),
              },
            };
          });

          const newEdges = clipboard.edges.map((edge) => ({
            ...edge,
            id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: idMap.get(edge.source) || edge.source,
            target: idMap.get(edge.target) || edge.target,
          }));

          set((state) => ({
            nodes: [...state.nodes, ...newNodes],
            edges: [...state.edges, ...newEdges],
          }));
          get().runValidation();
        },

        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < 0) return;

          const previousState = history[historyIndex];
          set({
            nodes: previousState.nodes,
            edges: previousState.edges,
            historyIndex: historyIndex - 1,
          });
          get().runValidation();
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex >= history.length - 1) return;

          const nextState = history[historyIndex + 1];
          set({
            nodes: nextState.nodes,
            edges: nextState.edges,
            historyIndex: historyIndex + 1,
          });
          get().runValidation();
        },

        saveToHistory: () => {
          const { nodes, edges, history, historyIndex } = get();
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push({ nodes: [...nodes], edges: [...edges] });
          
          // Keep only last 50 states
          if (newHistory.length > 50) {
            newHistory.shift();
          }
          
          set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
          });
        },

        deleteSelected: () => {
          const { selectedNodeId, selectedEdgeId } = get();
          if (selectedNodeId) {
            get().deleteNode(selectedNodeId);
          } else if (selectedEdgeId) {
            get().deleteEdge(selectedEdgeId);
          }
        },
      }),
      {
        name: 'workflow-storage',
        partialize: (state) => ({
          nodes: state.nodes,
          edges: state.edges,
        }),
      }
    )
  )
);
