import { WorkflowNode, WorkflowEdge, SimulationStep, Automation } from '@/types/workflow';
import automationsData from './automations.json';

const SPEED_DELAYS = {
  slow: 2000,
  normal: 1000,
  fast: 500,
};

export const getAutomations = (): Promise<Automation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(automationsData as Automation[]);
    }, 300);
  });
};

export const findNextNodes = (
  currentNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] => {
  const outgoingEdges = edges.filter((e) => e.source === currentNodeId);
  return outgoingEdges
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter((n): n is WorkflowNode => n !== undefined);
};

export const findStartNode = (nodes: WorkflowNode[]): WorkflowNode | undefined => {
  return nodes.find((n) => n.data.type === 'start');
};

export const generateSimulationSteps = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): SimulationStep[] => {
  const steps: SimulationStep[] = [];
  const visited = new Set<string>();
  const startNode = findStartNode(nodes);

  if (!startNode) {
    return [
      {
        nodeId: '',
        timestamp: Date.now(),
        status: 'failed',
        message: 'No start node found in workflow',
      },
    ];
  }

  const queue: WorkflowNode[] = [startNode];
  let timestamp = Date.now();

  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    
    if (visited.has(currentNode.id)) continue;
    visited.add(currentNode.id);

    const duration = Math.random() * 1000 + 500;
    
    steps.push({
      nodeId: currentNode.id,
      timestamp,
      status: 'executing',
      message: `Executing: ${currentNode.data.label}`,
      duration,
    });

    timestamp += duration;

    steps.push({
      nodeId: currentNode.id,
      timestamp,
      status: 'completed',
      message: `Completed: ${currentNode.data.label}`,
    });

    if (currentNode.data.type !== 'end') {
      const nextNodes = findNextNodes(currentNode.id, nodes, edges);
      for (const nextNode of nextNodes) {
        if (!visited.has(nextNode.id)) {
          queue.push(nextNode);
        }
      }
    }
  }

  return steps;
};

export interface SimulationRunner {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
}

export const createSimulationRunner = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  onStep: (step: SimulationStep) => void,
  onComplete: () => void,
  onNodeActivate: (nodeId: string | null) => void,
  onEdgeActivate: (edgeId: string | null) => void
): SimulationRunner => {
  let steps = generateSimulationSteps(nodes, edges);
  let currentIndex = 0;
  let isPaused = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let speed: 'slow' | 'normal' | 'fast' = 'normal';

  const findEdgeBetween = (sourceId: string, targetId: string): string | undefined => {
    const edge = edges.find((e) => e.source === sourceId && e.target === targetId);
    return edge?.id;
  };

  const executeStep = () => {
    if (isPaused || currentIndex >= steps.length) {
      if (currentIndex >= steps.length) {
        onNodeActivate(null);
        onEdgeActivate(null);
        onComplete();
      }
      return;
    }

    const step = steps[currentIndex];
    onStep(step);

    if (step.status === 'executing') {
      onNodeActivate(step.nodeId);
      
      // Find and highlight incoming edge
      if (currentIndex > 0) {
        const prevStep = steps[currentIndex - 1];
        if (prevStep.status === 'completed') {
          const edgeId = findEdgeBetween(prevStep.nodeId, step.nodeId);
          if (edgeId) onEdgeActivate(edgeId);
        }
      }
    }

    currentIndex++;
    timeoutId = setTimeout(executeStep, SPEED_DELAYS[speed]);
  };

  return {
    start: () => {
      steps = generateSimulationSteps(nodes, edges);
      currentIndex = 0;
      isPaused = false;
      executeStep();
    },
    pause: () => {
      isPaused = true;
      if (timeoutId) clearTimeout(timeoutId);
    },
    resume: () => {
      isPaused = false;
      executeStep();
    },
    reset: () => {
      isPaused = false;
      currentIndex = 0;
      if (timeoutId) clearTimeout(timeoutId);
      onNodeActivate(null);
      onEdgeActivate(null);
    },
    setSpeed: (newSpeed) => {
      speed = newSpeed;
    },
  };
};
