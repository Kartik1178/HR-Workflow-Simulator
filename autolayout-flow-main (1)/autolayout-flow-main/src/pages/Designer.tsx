import { useCallback, useState, useRef, DragEvent, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  Node,
  Edge,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  SelectionMode,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import NodeInspectorPanel from '@/components/panels/NodeInspectorPanel';
import SimulationPanel from '@/components/panels/SimulationPanel';
import AnalyticsPanel from '@/components/panels/AnalyticsPanel';
import EdgeInspectorPanel from '@/components/panels/EdgeInspectorPanel';
import VersionPanel from '@/components/panels/VersionPanel';
import ContextMenu from '@/components/canvas/ContextMenu';

import StartNode from '@/components/nodes/StartNode';
import TaskNode from '@/components/nodes/TaskNode';
import ApprovalNode from '@/components/nodes/ApprovalNode';
import AutomatedNode from '@/components/nodes/AutomatedNode';
import EndNode from '@/components/nodes/EndNode';
import CustomEdge from '@/components/edges/CustomEdge';

import { useWorkflowStore } from '@/state/workflowStore';
import { useWorkflow } from '@/hooks/useWorkflow';
import { NodeType, WorkflowNode, WorkflowEdge } from '@/types/workflow';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const defaultEdgeOptions = {
  type: 'custom',
  animated: false,
};

const DesignerCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    setNodes,
    setEdges,
    addNode,
    addEdge,
    setSelectedNode,
    setSelectedEdge,
    deleteNode,
    deleteEdge,
    duplicateNode,
    undo,
    redo,
    copyNodes,
    pasteNodes,
    saveToHistory,
  } = useWorkflowStore();

  const { applyLayout } = useWorkflow();

  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isEdgePanelOpen, setIsEdgePanelOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string | null;
  } | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      
      // Undo: Cmd/Ctrl + Z
      if (isMeta && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        undo();
      }
      
      // Redo: Cmd/Ctrl + Shift + Z
      if (isMeta && event.shiftKey && event.key === 'z') {
        event.preventDefault();
        redo();
      }
      
      // Save: Cmd/Ctrl + S
      if (isMeta && event.key === 's') {
        event.preventDefault();
        const workflow = { nodes, edges };
        localStorage.setItem('workflow-backup', JSON.stringify(workflow));
        toast({
          title: 'Workflow saved',
          description: 'Your workflow has been saved.',
        });
      }
      
      // Duplicate: Cmd/Ctrl + D
      if (isMeta && event.key === 'd') {
        event.preventDefault();
        if (selectedNodeId) {
          duplicateNode(selectedNodeId);
        }
      }
      
      // Copy: Cmd/Ctrl + C
      if (isMeta && event.key === 'c') {
        if (selectedNodeId) {
          copyNodes([selectedNodeId]);
          toast({
            title: 'Copied',
            description: 'Node copied to clipboard.',
          });
        }
      }
      
      // Paste: Cmd/Ctrl + V
      if (isMeta && event.key === 'v') {
        event.preventDefault();
        pasteNodes({ x: 100, y: 100 });
      }
      
      // Delete: Delete or Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault();
          deleteNode(selectedNodeId);
          setIsNodePanelOpen(false);
        } else if (selectedEdgeId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault();
          deleteEdge(selectedEdgeId);
          setIsEdgePanelOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, nodes, edges, selectedNodeId, selectedEdgeId, duplicateNode, copyNodes, pasteNodes, deleteNode, deleteEdge]);
useEffect(() => {
  if (selectedEdgeId) {
    setIsEdgePanelOpen(true);
    setIsNodePanelOpen(false);
  } else {
    setIsEdgePanelOpen(false);
  }
}, [selectedEdgeId]);
  // Handle node changes (position, selection)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes) as WorkflowNode[];
      
      // Check for selection changes
      changes.forEach((change) => {
        if (change.type === 'select' && change.selected) {
          setSelectedNode(change.id);
          setIsNodePanelOpen(true);
          setIsEdgePanelOpen(false);
        }
      });

      // Check for position changes to save to history
      const hasPositionChange = changes.some(
        (c) => c.type === 'position' && c.dragging === false
      );
      if (hasPositionChange) {
        saveToHistory();
      }

      setNodes(updatedNodes);
    },
    [nodes, setNodes, setSelectedNode, saveToHistory]
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(changes, edges) as WorkflowEdge[];
      setEdges(updatedEdges);
    },
    [edges, setEdges]
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge: WorkflowEdge = {
        id: `edge-${uuidv4()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        type: 'custom',
        data: { weight: 1, probability: 100 },
      };

      saveToHistory();
      addEdge(newEdge);
    },
    [addEdge, saveToHistory]
  );

  // Handle drag over
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      // compute position using reactFlowInstance (project)
      const clientRect = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowInstance || !clientRect) return;

      const position = reactFlowInstance.project({
        x: event.clientX - clientRect.left,
        y: event.clientY - clientRect.top,
      });

      const labels: Record<NodeType, string> = {
        start: 'Start',
        task: 'New Task',
        approval: 'Approval Required',
        automated: 'Automated Step',
        end: 'End',
      };

      const newNode: WorkflowNode = {
        id: `${type}-${uuidv4()}`,
        type,
        position,
        data: {
          type,
          label: labels[type],
          description: '',
          isValid: true,
        } as any,
      };

      saveToHistory();
      addNode(newNode);
      setSelectedNode(newNode.id);
      setIsNodePanelOpen(true);
    },
    [reactFlowInstance, addNode, setSelectedNode, saveToHistory]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      setSelectedEdge(null);
      setIsNodePanelOpen(true);
      setIsEdgePanelOpen(false);
    },
    [setSelectedNode, setSelectedEdge]
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
      setSelectedNode(null);
      setIsEdgePanelOpen(true);
      setIsNodePanelOpen(false);
    },
    [setSelectedEdge, setSelectedNode]
  );

  // Handle canvas click
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsNodePanelOpen(false);
    setIsEdgePanelOpen(false);
    setContextMenu(null);
  }, [setSelectedNode, setSelectedEdge]);

  // Handle context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  // Close all right panels when opening one
  const handleOpenAnalytics = () => {
    setIsAnalyticsOpen(true);
    setIsVersionsOpen(false);
    setIsNodePanelOpen(false);
    setIsEdgePanelOpen(false);
  };

  const handleOpenVersions = () => {
    setIsVersionsOpen(true);
    setIsAnalyticsOpen(false);
    setIsNodePanelOpen(false);
    setIsEdgePanelOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Topbar 
        onAutoLayout={applyLayout} 
        onOpenVersions={handleOpenVersions}
        onOpenAnalytics={handleOpenAnalytics}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div 
          ref={reactFlowWrapper} 
          className="flex-1 relative"
          tabIndex={0}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onInit={(instance) => setReactFlowInstance(instance)}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            selectionOnDrag
            selectionMode={SelectionMode.Partial}
            deleteKeyCode={null}
            multiSelectionKeyCode="Shift"
          >
            <Background gap={15} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
              style={{ width: 150, height: 100 }}
            />
          </ReactFlow>

          {/* Node Inspector Panel */}
          <NodeInspectorPanel
            isOpen={isNodePanelOpen && !!selectedNodeId}
            onClose={() => setIsNodePanelOpen(false)}
          />

          {/* Edge Inspector Panel */}
          <EdgeInspectorPanel
            isOpen={isEdgePanelOpen && !!selectedEdgeId}
            onClose={() => setIsEdgePanelOpen(false)}
          />

          {/* Analytics Panel */}
          <AnalyticsPanel
            isOpen={isAnalyticsOpen}
            onClose={() => setIsAnalyticsOpen(false)}
          />

          {/* Version Panel */}
          <VersionPanel
            isOpen={isVersionsOpen}
            onClose={() => setIsVersionsOpen(false)}
          />

          {/* Simulation Panel Toggle */}
          <button
            onClick={() => setIsSimulationOpen(!isSimulationOpen)}
            className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {isSimulationOpen ? 'Hide' : 'Show'} Simulation
          </button>

          {/* Simulation Panel */}
          <SimulationPanel isOpen={isSimulationOpen} />

          {/* Context Menu */}
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              nodeId={contextMenu.nodeId}
              onClose={() => setContextMenu(null)}
              onEdit={() => {
                setIsNodePanelOpen(true);
                setContextMenu(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Designer = () => {
  return (
    <ReactFlowProvider>
      <DesignerCanvas />
    </ReactFlowProvider>
  );
};

export default Designer;
