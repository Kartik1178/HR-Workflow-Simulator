import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StartNodeData } from '@/types/workflow';
import { useValidation } from '@/hooks/useValidation';
import { useWorkflowStore } from '@/state/workflowStore';

const StartNode = memo(({ data, selected, id }: NodeProps<StartNodeData>) => {
  const { getNodeStatus } = useValidation();
  const status = getNodeStatus(id);

  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNode(id);
      }}
      className={cn(
        'workflow-node bg-node-start-bg border-node-start-border min-w-[180px]',
        selected && 'ring-2 ring-node-start ring-offset-2',
        data.isExecuting && 'animate-pulse-glow ring-4 ring-sim-active'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-node-start-border/50">
        <div className="p-1.5 rounded-lg bg-node-start/10">
          <Play className="w-4 h-4 text-node-start" />
        </div>
        <span className="font-semibold text-sm text-node-start">Start</span>
        
        {/* Validation badges */}
        <div className="ml-auto flex items-center gap-1">
          {!status.isValid && (
            <AlertCircle className="w-4 h-4 text-status-error" />
          )}
          {status.isValid && data.isCompleted && (
            <CheckCircle className="w-4 h-4 text-status-success" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <h3 className="font-medium text-foreground text-sm">{data.label}</h3>
        {data.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {data.description}
          </p>
        )}
        
        {/* Trigger info */}
        {data.trigger && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-node-start/10 text-node-start capitalize">
              {data.trigger}
            </span>
          </div>
        )}
      </div>

      {/* Mini metrics */}
      {data.isCompleted && data.executionTime && (
        <div className="px-4 py-2 border-t border-node-start-border/50 bg-node-start/5">
          <span className="text-xs text-muted-foreground">
            Completed in {Math.round(data.executionTime)}ms
          </span>
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-node-start !border-white"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';

export default StartNode;
