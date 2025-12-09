import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Flag, AlertCircle, CheckCircle, XCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EndNodeData } from '@/types/workflow';
import { useValidation } from '@/hooks/useValidation';

const outcomeConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-status-success',
    bg: 'bg-status-success/10',
  },
  failure: {
    icon: XCircle,
    color: 'text-status-error',
    bg: 'bg-status-error/10',
  },
  cancelled: {
    icon: Ban,
    color: 'text-status-warning',
    bg: 'bg-status-warning/10',
  },
};

const EndNode = memo(({ data, selected, id }: NodeProps<EndNodeData>) => {
  const { getNodeStatus } = useValidation();
  const status = getNodeStatus(id);
  const outcomeStyle = data.outcome ? outcomeConfig[data.outcome] : null;
  const OutcomeIcon = outcomeStyle?.icon;

  return (
    <div
      className={cn(
        'workflow-node bg-node-end-bg border-node-end-border min-w-[180px]',
        selected && 'ring-2 ring-node-end ring-offset-2',
        data.isExecuting && 'animate-pulse-glow ring-4 ring-sim-active'
      )}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-end !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-node-end-border/50">
        <div className="p-1.5 rounded-lg bg-node-end/10">
          <Flag className="w-4 h-4 text-node-end" />
        </div>
        <span className="font-semibold text-sm text-node-end">End</span>
        
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
        
        {/* Outcome */}
        {data.outcome && outcomeStyle && OutcomeIcon && (
          <div className="mt-2">
            <span className={cn('text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 capitalize', outcomeStyle.bg, outcomeStyle.color)}>
              <OutcomeIcon className="w-3 h-3" />
              {data.outcome}
            </span>
          </div>
        )}

        {/* Notification setting */}
        {data.notifyOnComplete && (
          <div className="mt-2 text-xs text-muted-foreground">
            📧 Notifications enabled
          </div>
        )}
      </div>

      {/* Mini metrics */}
      {data.isCompleted && data.executionTime && (
        <div className="px-4 py-2 border-t border-node-end-border/50 bg-node-end/5">
          <span className="text-xs text-status-success">
            ✓ Workflow completed in {Math.round(data.executionTime)}ms
          </span>
        </div>
      )}
    </div>
  );
});

EndNode.displayName = 'EndNode';

export default EndNode;
