import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ClipboardList, AlertCircle, CheckCircle, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskNodeData } from '@/types/workflow';
import { useValidation } from '@/hooks/useValidation';

const priorityColors = {
  low: 'bg-status-success/10 text-status-success',
  medium: 'bg-status-warning/10 text-status-warning',
  high: 'bg-status-error/10 text-status-error',
};

const TaskNode = memo(({ data, selected, id }: NodeProps<TaskNodeData>) => {
  const { getNodeStatus } = useValidation();
  const status = getNodeStatus(id);

  return (
    <div
      className={cn(
        'workflow-node bg-node-task-bg border-node-task-border min-w-[200px]',
        selected && 'ring-2 ring-node-task ring-offset-2',
        data.isExecuting && 'animate-pulse-glow ring-4 ring-sim-active'
      )}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-task !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-node-task-border/50">
        <div className="p-1.5 rounded-lg bg-node-task/10">
          <ClipboardList className="w-4 h-4 text-node-task" />
        </div>
        <span className="font-semibold text-sm text-node-task">Task</span>
        
        {/* Priority badge */}
        {data.priority && (
          <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', priorityColors[data.priority])}>
            {data.priority}
          </span>
        )}
        
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
        
        {/* Assignee & Due date */}
        <div className="mt-3 flex flex-wrap gap-2">
          {data.assignee && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{data.assignee}</span>
            </div>
          )}
          {data.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{data.dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mini metrics */}
      {(data.estimatedHours || data.isCompleted) && (
        <div className="px-4 py-2 border-t border-node-task-border/50 bg-node-task/5 flex justify-between">
          {data.estimatedHours && (
            <span className="text-xs text-muted-foreground">
              Est. {data.estimatedHours}h
            </span>
          )}
          {data.isCompleted && data.executionTime && (
            <span className="text-xs text-status-success">
              ✓ {Math.round(data.executionTime)}ms
            </span>
          )}
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-node-task !border-white"
      />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

export default TaskNode;
