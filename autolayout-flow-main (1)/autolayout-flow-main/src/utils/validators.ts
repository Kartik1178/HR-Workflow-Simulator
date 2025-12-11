// src/utils/validators.ts
import { WorkflowNode, WorkflowEdge, ValidationError, NodeType } from '@/types/workflow';

/**
 * validateWorkflow
 * - Returns an array of ValidationError objects
 * - Error = blocking problems that should be fixed (missing required fields, structural errors)
 * - Warning = non-blocking but notable problems (missing optional fields, suspicious configs)
 */
export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Helper maps for quick lookup
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const outgoingByNode = new Map<string, WorkflowEdge[]>();
  const incomingByNode = new Map<string, WorkflowEdge[]>();

  edges.forEach((e) => {
    outgoingByNode.set(e.source, (outgoingByNode.get(e.source) || []).concat(e));
    incomingByNode.set(e.target, (incomingByNode.get(e.target) || []).concat(e));
  });

  // 1) Start node must exist (exactly one ideally)
  const starts = nodes.filter((n) => n.data.type === 'start');
  if (starts.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must contain a Start node.',
      code: 'NO_START',
    });
  } else if (starts.length > 1) {
    errors.push({
      type: 'warning',
      message: 'Multiple Start nodes detected. Recommended: only one Start node.',
      code: 'MULTIPLE_STARTS',
    });
  }

  // 2) Every node of certain types must have a non-empty label
  nodes.forEach((node) => {
    const t = node.data.type as NodeType;
    const label = (node.data.label || '').toString().trim();

    // Required label for task/approval/automated nodes and start/end
    if (['task', 'approval', 'automated', 'start', 'end'].includes(t)) {
      if (!label) {
        errors.push({
          nodeId: node.id,
          type: 'error',
          message: `${capitalize(t)} node is missing a label/title.`,
          code: 'MISSING_LABEL',
        });
      }
    }

    // Type-specific validation
    if (t === 'task') {
      // Task: title required (already checked), but warn if no assignee set
      const taskData: any = node.data;
      if (!taskData.assignee) {
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: 'Task has no assignee; tasks without assignees may not be actionable.',
          code: 'TASK_NO_ASSIGNEE',
        });
      }
    }

    if (t === 'approval') {
      const approvalData: any = node.data;
      // approvers required (depending on approvalType could be required)
      if (!approvalData.approvers || approvalData.approvers.length === 0) {
        errors.push({
          nodeId: node.id,
          type: 'error',
          message: 'Approval node requires at least one approver (comma-separated in inspector).',
          code: 'APPROVAL_NO_APPROVERS',
        });
      } else if (approvalData.approvers.length === 1 && approvalData.approvalType === 'all') {
        // all with single approver is suspicious -> warning
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: 'Approval type "All approvers" with a single approver is equivalent to "Any".',
          code: 'APPROVAL_SINGLE_APPROVER_ALL',
        });
      }
      // escalation email basic format check -> warning if present but invalid-ish
      if (approvalData.escalationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(approvalData.escalationEmail)) {
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: 'Escalation email does not look like a valid email address.',
          code: 'APPROVAL_BAD_ESCALATION_EMAIL',
        });
      }
    }

    if (t === 'automated') {
      const autoData: any = node.data;
      // automated actions must choose an actionId
      if (!autoData.actionId) {
        errors.push({
          nodeId: node.id,
          type: 'error',
          message: 'Automated node must have an action selected (choose from automations list).',
          code: 'AUTOMATION_NO_ACTION',
        });
      } else {
        // If params expected by automation but none provided -> warning
        // NOTE: we don't have automations list here, so only check if params field is empty
        if (!autoData.params || Object.keys(autoData.params).length === 0) {
          errors.push({
            nodeId: node.id,
            type: 'warning',
            message: 'Automated action has no parameters specified — verify required params for the selected action.',
            code: 'AUTOMATION_NO_PARAMS',
          });
        }
      }
    }

    if (t === 'end') {
      // End nodes should not have outgoing edges (structural error)
      const out = outgoingByNode.get(node.id) || [];
      if (out.length > 0) {
        errors.push({
          nodeId: node.id,
          type: 'error',
          message: 'End node must not have outgoing connections.',
          code: 'END_HAS_OUTGOING',
        });
      }
    }
  });

  // 3) Structural checks
  // - No disconnected nodes (except maybe start/end?) We'll warn if node has neither incoming nor outgoing edges
  nodes.forEach((node) => {
    const inCount = (incomingByNode.get(node.id) || []).length;
    const outCount = (outgoingByNode.get(node.id) || []).length;
    // Allow Start to have no incoming, End to have no outgoing, but a node with zero in and zero out is probably orphaned
    if (inCount === 0 && outCount === 0) {
      // if start and it's the only start, it's ok; but generally warn
      errors.push({
        nodeId: node.id,
        type: 'warning',
        message: 'This node is not connected to the workflow (no incoming and no outgoing edges).',
        code: 'NODE_IS_ORPHANED',
      });
    }
  });

  // 4) Optional: detect simple cycles (very simple DFS, flag warning if cycle found)
  const visited = new Set<string>();
  const stack = new Set<string>();
  let cycleFound = false;

  const dfs = (id: string) => {
    if (cycleFound) return;
    visited.add(id);
    stack.add(id);
    const outs = outgoingByNode.get(id) || [];
    for (const e of outs) {
      const tgt = e.target;
      if (!visited.has(tgt)) {
        dfs(tgt);
      } else if (stack.has(tgt)) {
        cycleFound = true;
        return;
      }
    }
    stack.delete(id);
  };

  for (const n of nodes) {
    if (!visited.has(n.id)) dfs(n.id);
    if (cycleFound) break;
  }

  if (cycleFound) {
    errors.push({
      type: 'warning',
      message: 'Cycle detected in the workflow. Ensure loops are intentional and handled in simulation.',
      code: 'WORKFLOW_HAS_CYCLE',
    });
  }

  return errors;
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
