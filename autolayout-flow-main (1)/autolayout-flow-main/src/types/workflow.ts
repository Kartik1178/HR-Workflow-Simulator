import { Node, Edge } from 'reactflow';

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface BaseNodeData {
  label: string;
  description?: string;
  isValid?: boolean;
  validationErrors?: string[];
  isExecuting?: boolean;
  isCompleted?: boolean;
  executionTime?: number;
}

export interface StartNodeData extends BaseNodeData {
  type: 'start';
  trigger?: 'manual' | 'scheduled' | 'event';
}

export interface TaskNodeData extends BaseNodeData {
  type: 'task';
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  customFields?: Record<string, string>;
}

export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval';
  approvers?: string[];
  approvalType?: 'any' | 'all' | 'majority';
  deadline?: string;
  escalationEmail?: string;
}

export interface AutomatedNodeData extends BaseNodeData {
  type: 'automated';
  actionId?: string;
  actionLabel?: string;
  params?: Record<string, string>;
  retryCount?: number;
  timeout?: number;
}

export interface EndNodeData extends BaseNodeData {
  type: 'end';
  outcome?: 'success' | 'failure' | 'cancelled';
  notifyOnComplete?: boolean;
}

export type WorkflowNodeData = 
  | StartNodeData 
  | TaskNodeData 
  | ApprovalNodeData 
  | AutomatedNodeData 
  | EndNodeData;

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge<EdgeData>;

export interface EdgeData {
  label?: string;
  weight?: number;
  probability?: number;
  condition?: string;
  notes?: string;
  colorPreset?: string;
  color?: string;
  metrics?: {
    avgTime?: number;
    passRate?: number;
  };
}

export interface Automation {
  id: string;
  label: string;
  params: string[];
  description?: string;
}

export interface SimulationStep {
  nodeId: string;
  timestamp: number;
  status: 'executing' | 'completed' | 'failed' | 'skipped';
  message: string;
  duration?: number;
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentNodeId: string | null;
  steps: SimulationStep[];
  speed: 'slow' | 'normal' | 'fast';
  startTime?: number;
  endTime?: number;
}

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  type: 'error' | 'warning';
  message: string;
  code: string;
}

export interface WorkflowMetrics {
  totalNodes: number;
  totalEdges: number;
  avgPathLength: number;
  criticalPath: string[];
  estimatedDuration: number;
}
