import { WorkflowNode, WorkflowEdge, ValidationError } from '@/types/workflow';

export const validateWorkflow = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check for start node
  const startNodes = nodes.filter((n) => n.data.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have a Start node',
      code: 'MISSING_START',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'error',
      message: 'Workflow can only have one Start node',
      code: 'MULTIPLE_START',
    });
  }

  // Check for end node
  const endNodes = nodes.filter((n) => n.data.type === 'end');
  if (endNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have at least one End node',
      code: 'MISSING_END',
    });
  }

  // Check for orphan nodes (no connections)
  nodes.forEach((node) => {
    const hasIncoming = edges.some((e) => e.target === node.id);
    const hasOutgoing = edges.some((e) => e.source === node.id);

    if (node.data.type !== 'start' && !hasIncoming) {
      errors.push({
        nodeId: node.id,
        type: 'warning',
        message: `"${node.data.label}" has no incoming connections`,
        code: 'NO_INCOMING',
      });
    }

    if (node.data.type !== 'end' && !hasOutgoing) {
      errors.push({
        nodeId: node.id,
        type: 'warning',
        message: `"${node.data.label}" has no outgoing connections`,
        code: 'NO_OUTGOING',
      });
    }
  });

  // Check for cycles (simplified DFS)
  const cycleErrors = detectCycles(nodes, edges);
  errors.push(...cycleErrors);

  // Check for unreachable nodes
  const unreachableErrors = findUnreachableNodes(nodes, edges);
  errors.push(...unreachableErrors);

  // Validate node configurations
  nodes.forEach((node) => {
    const configErrors = validateNodeConfig(node);
    errors.push(...configErrors);
  });

  return errors;
};

const detectCycles = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((n) => adjacencyList.set(n.id, []));
  edges.forEach((e) => {
    const list = adjacencyList.get(e.source);
    if (list) list.push(e.target);
  });

  const dfs = (nodeId: string, path: string[]): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path, neighbor])) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        errors.push({
          type: 'error',
          message: `Cycle detected in workflow`,
          code: 'CYCLE_DETECTED',
        });
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id, [node.id]);
    }
  }

  return errors;
};

const findUnreachableNodes = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const startNode = nodes.find((n) => n.data.type === 'start');
  
  if (!startNode) return errors;

  const reachable = new Set<string>();
  const queue = [startNode.id];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;
    reachable.add(current);

    const outgoing = edges.filter((e) => e.source === current);
    outgoing.forEach((e) => {
      if (!reachable.has(e.target)) {
        queue.push(e.target);
      }
    });
  }

  nodes.forEach((node) => {
    if (!reachable.has(node.id) && node.data.type !== 'start') {
      errors.push({
        nodeId: node.id,
        type: 'warning',
        message: `"${node.data.label}" is unreachable from Start`,
        code: 'UNREACHABLE',
      });
    }
  });

  return errors;
};

const validateNodeConfig = (node: WorkflowNode): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!node.data.label || node.data.label.trim() === '') {
    errors.push({
      nodeId: node.id,
      type: 'error',
      message: 'Node must have a label',
      code: 'MISSING_LABEL',
    });
  }

  switch (node.data.type) {
    case 'task':
      if (!node.data.assignee) {
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: `Task "${node.data.label}" has no assignee`,
          code: 'MISSING_ASSIGNEE',
        });
      }
      break;

    case 'approval':
      if (!node.data.approvers || node.data.approvers.length === 0) {
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: `Approval "${node.data.label}" has no approvers`,
          code: 'MISSING_APPROVERS',
        });
      }
      break;

    case 'automated':
      if (!node.data.actionId) {
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: `Automated step "${node.data.label}" has no action configured`,
          code: 'MISSING_ACTION',
        });
      }
      break;
  }

  return errors;
};

export const getNodeValidationStatus = (
  nodeId: string,
  errors: ValidationError[]
): { isValid: boolean; errors: ValidationError[]; warnings: ValidationError[] } => {
  const nodeErrors = errors.filter((e) => e.nodeId === nodeId);
  return {
    isValid: !nodeErrors.some((e) => e.type === 'error'),
    errors: nodeErrors.filter((e) => e.type === 'error'),
    warnings: nodeErrors.filter((e) => e.type === 'warning'),
  };
};
