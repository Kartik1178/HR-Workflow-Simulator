// src/utils/storage.ts
import { WorkflowNode, WorkflowEdge } from '@/types/workflow';

export interface WorkflowVersion {
  id: string;
  name?: string;
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
  edgesChanged: number;
}

const VERSIONS_KEY = 'workflow-versions-v1';
const MAX_VERSIONS = 20;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('Failed to parse storage value', e);
    return fallback;
  }
}

export const getWorkflowVersions = (): WorkflowVersion[] => {
  const raw = localStorage.getItem(VERSIONS_KEY);
  return safeParse<WorkflowVersion[]>(raw, []);
};

export const getVersionById = (id: string): WorkflowVersion | null => {
  const versions = getWorkflowVersions();
  return versions.find((v) => v.id === id) || null;
};

function generateId() {
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Save a new version snapshot to localStorage.
 * Returns the saved WorkflowVersion.
 */
export const saveWorkflowVersion = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name?: string
): WorkflowVersion => {
  const versions = getWorkflowVersions();

  const version: WorkflowVersion = {
    id: generateId(),
    name: name?.trim() || `Version ${versions.length + 1}`,
    timestamp: Date.now(),
    // deep clone to avoid references to mutable objects in store
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
  };

  // prepend newest first
  versions.unshift(version);

  // keep only the most recent MAX_VERSIONS
  if (versions.length > MAX_VERSIONS) {
    versions.length = MAX_VERSIONS;
  }

  try {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  } catch (e) {
    console.warn('Failed to save versions to localStorage', e);
  }

  return version;
};

export const deleteVersion = (id: string): void => {
  const versions = getWorkflowVersions();
  const filtered = versions.filter((v) => v.id !== id);
  try {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to delete version', e);
  }
};

/**
 * Calculate a lightweight diff summary between current and a saved version.
 * - identity by id
 * - changed = same id exists in both but JSON differs
 */
export const calculateVersionDiff = (
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[],
  versionNodes: WorkflowNode[],
  versionEdges: WorkflowEdge[]
): VersionDiff => {
  const mapById = <T extends { id: string }>(arr: T[]) => {
    const m = new Map<string, T>();
    for (const a of arr) m.set(a.id, a);
    return m;
  };

  const curN = mapById(currentNodes);
  const verN = mapById(versionNodes);

  let nodesAdded = 0;
  let nodesRemoved = 0;
  let nodesChanged = 0;

  for (const [id, a] of curN.entries()) {
    if (!verN.has(id)) nodesAdded++;
    else {
      const b = verN.get(id)!;
      if (JSON.stringify(a) !== JSON.stringify(b)) nodesChanged++;
    }
  }
  for (const id of verN.keys()) {
    if (!curN.has(id)) nodesRemoved++;
  }

  const curE = mapById(currentEdges);
  const verE = mapById(versionEdges);

  let edgesAdded = 0;
  let edgesRemoved = 0;
  let edgesChanged = 0;

  for (const [id, a] of curE.entries()) {
    if (!verE.has(id)) edgesAdded++;
    else {
      const b = verE.get(id)!;
      if (JSON.stringify(a) !== JSON.stringify(b)) edgesChanged++;
    }
  }
  for (const id of verE.keys()) {
    if (!curE.has(id)) edgesRemoved++;
  }

  return {
    nodesAdded,
    nodesRemoved,
    nodesChanged,
    edgesAdded,
    edgesRemoved,
    edgesChanged,
  };
};

/* Export / Import helpers used by Topbar / Import flow */

// Export workflow to JSON string (pretty)
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

  // Minimal validation for shape
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
      } catch (err) {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
};
