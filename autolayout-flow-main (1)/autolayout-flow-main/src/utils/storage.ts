import { WorkflowNode, WorkflowEdge } from '@/types/workflow';

export interface WorkflowVersion {
  id: string;
  name: string;
  timestamp: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface VersionDiff {
  nodesAdded: number;
  nodesRemoved: number;
  nodesChanged: number;
  edgesAdded: number;
  edgesRemoved: number;
}

const VERSIONS_KEY = 'workflow-versions';
const MAX_VERSIONS = 20;

export const saveWorkflowVersion = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name?: string
): WorkflowVersion => {
  const versions = getWorkflowVersions();
  
  const version: WorkflowVersion = {
    id: `v-${Date.now()}`,
    name: name || `Version ${versions.length + 1}`,
    timestamp: Date.now(),
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
  };

  versions.unshift(version);
  
  // Keep only last MAX_VERSIONS
  if (versions.length > MAX_VERSIONS) {
    versions.pop();
  }

  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  return version;
};

export const getWorkflowVersions = (): WorkflowVersion[] => {
  const stored = localStorage.getItem(VERSIONS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const getVersionById = (id: string): WorkflowVersion | null => {
  const versions = getWorkflowVersions();
  return versions.find((v) => v.id === id) || null;
};

export const deleteVersion = (id: string): void => {
  const versions = getWorkflowVersions();
  const filtered = versions.filter((v) => v.id !== id);
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(filtered));
};

export const calculateVersionDiff = (
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[],
  versionNodes: WorkflowNode[],
  versionEdges: WorkflowEdge[]
): VersionDiff => {
  const currentNodeIds = new Set(currentNodes.map((n) => n.id));
  const versionNodeIds = new Set(versionNodes.map((n) => n.id));
  const currentEdgeIds = new Set(currentEdges.map((e) => e.id));
  const versionEdgeIds = new Set(versionEdges.map((e) => e.id));

  // Nodes added (in current but not in version)
  const nodesAdded = currentNodes.filter((n) => !versionNodeIds.has(n.id)).length;
  
  // Nodes removed (in version but not in current)
  const nodesRemoved = versionNodes.filter((n) => !currentNodeIds.has(n.id)).length;
  
  // Nodes changed (same ID but different data)
  const nodesChanged = currentNodes.filter((n) => {
    if (!versionNodeIds.has(n.id)) return false;
    const versionNode = versionNodes.find((vn) => vn.id === n.id);
    return JSON.stringify(n.data) !== JSON.stringify(versionNode?.data);
  }).length;

  // Edges added
  const edgesAdded = currentEdges.filter((e) => !versionEdgeIds.has(e.id)).length;
  
  // Edges removed
  const edgesRemoved = versionEdges.filter((e) => !currentEdgeIds.has(e.id)).length;

  return {
    nodesAdded,
    nodesRemoved,
    nodesChanged,
    edgesAdded,
    edgesRemoved,
  };
};

export const exportWorkflow = (nodes: WorkflowNode[], edges: WorkflowEdge[]): string => {
  const workflow = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    nodes,
    edges,
  };
  return JSON.stringify(workflow, null, 2);
};

export interface ImportedWorkflow {
  version?: string;
  exportedAt?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const validateWorkflowSchema = (data: unknown): ImportedWorkflow | null => {
  if (typeof data !== 'object' || data === null) return null;
  
  const obj = data as Record<string, unknown>;
  
  if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) return null;
  
  // Validate nodes have required fields
  for (const node of obj.nodes) {
    if (
      typeof node !== 'object' ||
      node === null ||
      typeof (node as Record<string, unknown>).id !== 'string' ||
      typeof (node as Record<string, unknown>).type !== 'string' ||
      typeof (node as Record<string, unknown>).position !== 'object'
    ) {
      return null;
    }
  }
  
  // Validate edges have required fields
  for (const edge of obj.edges) {
    if (
      typeof edge !== 'object' ||
      edge === null ||
      typeof (edge as Record<string, unknown>).id !== 'string' ||
      typeof (edge as Record<string, unknown>).source !== 'string' ||
      typeof (edge as Record<string, unknown>).target !== 'string'
    ) {
      return null;
    }
  }
  
  return {
    version: typeof obj.version === 'string' ? obj.version : undefined,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : undefined,
    nodes: obj.nodes as WorkflowNode[],
    edges: obj.edges as WorkflowEdge[],
  };
};

export const parseWorkflowFile = async (file: File): Promise<ImportedWorkflow | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const validated = validateWorkflowSchema(parsed);
        resolve(validated);
      } catch {
        resolve(null);
      }
    };
    
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
};
