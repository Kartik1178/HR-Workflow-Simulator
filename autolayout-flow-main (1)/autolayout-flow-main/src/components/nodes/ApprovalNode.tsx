import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { UserCheck, AlertCircle, CheckCircle, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApprovalNodeData } from '@/types/workflow';
import { useValidation } from '@/hooks/useValidation';

const approvalTypeLabels = {
  any: 'Any approver',
  all: 'All approvers',
  majority: 'Majority',
};

const ApprovalNode = memo(({ data, selected, id }: NodeProps<ApprovalNodeData>) => {
  const { getNodeStatus } = useValidation();
  const status = getNodeStatus(id);

  return (
    <div
      className={cn(
        'workflow-node bg-node-approval-bg border-node-approval-border min-w-[200px]',
        selected && 'ring-2 ring-node-approval ring-offset-2',
        data.isExecuting && 'animate-pulse-glow ring-4 ring-sim-active'
      )}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-approval !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-node-approval-border/50">
        <div className="p-1.5 rounded-lg bg-node-approval/10">
          <UserCheck className="w-4 h-4 text-node-approval" />
        </div>
        <span className="font-semibold text-sm text-node-approval">Approval</span>
        
        {/* Approval type badge */}
        {data.approvalType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-node-approval/10 text-node-approval">
            {approvalTypeLabels[data.approvalType]}
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
        
        {/* Approvers & Deadline */}
        <div className="mt-3 flex flex-wrap gap-2">
          {data.approvers && data.approvers.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{data.approvers.length} approver{data.approvers.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {data.deadline && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{data.deadline}</span>
            </div>
          )}
        </div>

        {/* Approver avatars */}
        {data.approvers && data.approvers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {data.approvers.slice(0, 3).map((approver, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {approver}
              </span>
            ))}
            {data.approvers.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{data.approvers.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mini metrics */}
      {data.isCompleted && data.executionTime && (
        <div className="px-4 py-2 border-t border-node-approval-border/50 bg-node-approval/5">
          <span className="text-xs text-status-success">
            ✓ Approved in {Math.round(data.executionTime)}ms
          </span>
        </div>
      )}

      {/* Output handles - Approved/Rejected */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="approved"
        className="!bg-status-success !border-white !left-1/3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rejected"
        className="!bg-status-error !border-white !left-2/3"
      />
    </div>
  );
});

ApprovalNode.displayName = 'ApprovalNode';

export default ApprovalNode;
