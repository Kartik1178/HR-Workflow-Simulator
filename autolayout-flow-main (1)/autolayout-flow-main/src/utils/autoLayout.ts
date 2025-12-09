import dagre from 'dagre';
import { WorkflowNode, WorkflowEdge } from '@/types/workflow';

export type LayoutDirection = 'TB' | 'LR';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;

export const applyAutoLayout = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  direction: LayoutDirection = 'TB'
): WorkflowNode[] => {
  const dagreGraph = new dagre.graphlib.Graph();
  
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 100,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run layout
  dagre.layout(dagreGraph);

  // Apply positions back to nodes
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });
};

export const getLayoutBounds = (nodes: WorkflowNode[]) => {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + NODE_WIDTH);
    maxY = Math.max(maxY, node.position.y + NODE_HEIGHT);
  });

  return { minX, minY, maxX, maxY };
};
