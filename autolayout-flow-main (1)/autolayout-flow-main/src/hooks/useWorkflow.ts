import { useCallback, useEffect } from 'react';
import { useReactFlow, Node, Edge, Connection } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { useWorkflowStore } from '@/state/workflowStore';
import { WorkflowNode, WorkflowEdge, NodeType, WorkflowNodeData } from '@/types/workflow';
import { applyAutoLayout, LayoutDirection } from '@/utils/autoLayout';

export const useWorkflow = () => {
  const { fitView, getViewport, setViewport } = useReactFlow();
  const {
    nodes,
    edges,
    selectedNodeId,
    validationErrors,
    setNodes,
    setEdges,
    addNode,
    updateNode,
    deleteNode,
    duplicateNode,
    addEdge,
    deleteEdge,
    setSelectedNode,
    copyNodes,
    pasteNodes,
    undo,
    redo,
    saveToHistory,
  } = useWorkflowStore();

  const createNode = useCallback(
    (type: NodeType, position: { x: number; y: number }): WorkflowNode => {
      const id = `${type}-${uuidv4()}`;
      const labels: Record<NodeType, string> = {
        start: 'Start',
        task: 'New Task',
        approval: 'Approval Required',
        automated: 'Automated Step',
        end: 'End',
      };

      const baseData: WorkflowNodeData = {
        type,
        label: labels[type],
        description: '',
        isValid: true,
      } as WorkflowNodeData;

      return {
        id,
        type,
        position,
        data: baseData,
      };
    },
    []
  );

  const handleAddNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      const node = createNode(type, position);
      addNode(node);
      setSelectedNode(node.id);
      return node;
    },
    [createNode, addNode, setSelectedNode]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge: WorkflowEdge = {
        id: `edge-${uuidv4()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        type: 'custom',
        data: {
          weight: 1,
        },
      };

      addEdge(newEdge);
    },
    [addEdge]
  );

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      let updatedNodes = [...nodes];
      
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const index = updatedNodes.findIndex((n) => n.id === change.id);
          if (index !== -1) {
            updatedNodes[index] = {
              ...updatedNodes[index],
              position: change.position,
            };
          }
        } else if (change.type === 'select') {
          if (change.selected) {
            setSelectedNode(change.id);
          }
        } else if (change.type === 'remove') {
          deleteNode(change.id);
          return;
        }
      });

      setNodes(updatedNodes);
    },
    [nodes, setNodes, setSelectedNode, deleteNode]
  );

  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deleteEdge(change.id);
        }
      });
    },
    [deleteEdge]
  );

  const applyLayout = useCallback(
    (direction: LayoutDirection = 'TB') => {
      saveToHistory();
      const layoutedNodes = applyAutoLayout(nodes, edges, direction);
      setNodes(layoutedNodes);
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    },
    [nodes, edges, setNodes, fitView, saveToHistory]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMetaKey = event.metaKey || event.ctrlKey;

      // Delete
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        }
      }

      // Duplicate (Cmd+D)
      if (isMetaKey && event.key === 'd') {
        event.preventDefault();
        if (selectedNodeId) {
          duplicateNode(selectedNodeId);
        }
      }

      // Copy (Cmd+C)
      if (isMetaKey && event.key === 'c') {
        if (selectedNodeId) {
          copyNodes([selectedNodeId]);
        }
      }

      // Paste (Cmd+V)
      if (isMetaKey && event.key === 'v') {
        const viewport = getViewport();
        pasteNodes({ x: -viewport.x / viewport.zoom + 100, y: -viewport.y / viewport.zoom + 100 });
      }

      // Undo (Cmd+Z)
      if (isMetaKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }

      // Redo (Cmd+Shift+Z)
      if (isMetaKey && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        redo();
      }
    },
    [selectedNodeId, deleteNode, duplicateNode, copyNodes, pasteNodes, getViewport, undo, redo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    nodes,
    edges,
    selectedNodeId,
    validationErrors,
    handleAddNode,
    handleConnect,
    handleNodesChange,
    handleEdgesChange,
    applyLayout,
    updateNode,
    deleteNode,
    duplicateNode,
    setSelectedNode,
  };
};
