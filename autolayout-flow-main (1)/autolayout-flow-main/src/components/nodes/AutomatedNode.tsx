import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, AlertCircle, CheckCircle, RotateCcw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutomatedNodeData } from '@/types/workflow';
import { useValidation } from '@/hooks/useValidation';

const AutomatedNode = memo(({ data, selected, id }: NodeProps<AutomatedNodeData>) => {
  const { getNodeStatus } = useValidation();
  const status = getNodeStatus(id);

  return (
    <div
      className={cn(
        'workflow-node bg-node-automated-bg border-node-automated-border min-w-[200px]',
        selected && 'ring-2 ring-node-automated ring-offset-2',
        data.isExecuting && 'animate-pulse-glow ring-4 ring-sim-active'
      )}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-automated !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-node-automated-border/50">
        <div className="p-1.5 rounded-lg bg-node-automated/10">
          <Zap className="w-4 h-4 text-node-automated" />
        </div>
        <span className="font-semibold text-sm text-node-automated">Automated</span>
        
        {/* Validation badges */}
        <div className="ml-auto flex items-center gap-1">
          {!status.isValid && (
            <AlertCircle className="w-4 h-4 text-status-error" />
          )}
          {status.hasWarnings && status.isValid && (
            <AlertCircle className="w-4 h-4 text-status-warning" />
          )}
          {status.isValid && !status.hasWarnings && data.isCompleted && (
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
        
        {/* Action label */}
        {data.actionLabel && (
          <div className="mt-2">
            <span className="text-xs px-2 py-1 rounded-md bg-node-automated/10 text-node-automated font-medium">
              {data.actionLabel}
            </span>
          </div>
        )}
        
        {/* Config info */}
        <div className="mt-3 flex flex-wrap gap-2">
          {data.retryCount !== undefined && data.retryCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <RotateCcw className="w-3 h-3" />
              <span>{data.retryCount} retries</span>
            </div>
          )}
          {data.timeout && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{data.timeout}s timeout</span>
            </div>
          )}
        </div>

        {/* Params preview */}
        {data.params && Object.keys(data.params).length > 0 && (
          <div className="mt-2 space-y-1">
            {Object.entries(data.params).slice(0, 2).map(([key, value]) => (
              <div key={key} className="text-xs text-muted-foreground truncate">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
            {Object.keys(data.params).length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{Object.keys(data.params).length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mini metrics */}
      {data.isCompleted && data.executionTime && (
        <div className="px-4 py-2 border-t border-node-automated-border/50 bg-node-automated/5">
          <span className="text-xs text-status-success">
            ✓ Executed in {Math.round(data.executionTime)}ms
          </span>
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-node-automated !border-white"
      />
    </div>
  );
});

AutomatedNode.displayName = 'AutomatedNode';

export default AutomatedNode;
