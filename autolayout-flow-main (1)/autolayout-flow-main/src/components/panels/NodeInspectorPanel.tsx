import { memo, useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/state/workflowStore';
import { WorkflowNode, Automation } from '@/types/workflow';
import { useValidation } from '@/hooks/useValidation';
import { getAutomations } from '@/api/simulateMock';

interface NodeInspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NodeInspectorPanel = memo(({ isOpen, onClose }: NodeInspectorPanelProps) => {
  const { nodes, selectedNodeId, updateNode, deleteNode, automations, setAutomations } = useWorkflowStore();
  const { getNodeStatus } = useValidation();
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const nodeStatus = selectedNodeId ? getNodeStatus(selectedNodeId) : null;

  useEffect(() => {
    getAutomations().then(setAutomations);
  }, [setAutomations]);

  useEffect(() => {
    if (selectedNode?.data.type === 'task' && selectedNode.data.customFields) {
      setCustomFields(selectedNode.data.customFields);
    } else {
      setCustomFields({});
    }
  }, [selectedNode]);

  if (!isOpen || !selectedNode) return null;

  const handleChange = (field: string, value: any) => {
    updateNode(selectedNode.id, { [field]: value });
  };

  const handleAddCustomField = () => {
    const newKey = `field_${Object.keys(customFields).length + 1}`;
    const newFields = { ...customFields, [newKey]: '' };
    setCustomFields(newFields);
    handleChange('customFields', newFields);
  };

  const handleCustomFieldChange = (key: string, value: string) => {
    const newFields = { ...customFields, [key]: value };
    setCustomFields(newFields);
    handleChange('customFields', newFields);
  };

  const handleRemoveCustomField = (key: string) => {
    const newFields = { ...customFields };
    delete newFields[key];
    setCustomFields(newFields);
    handleChange('customFields', newFields);
  };

  const handleApproversChange = (value: string) => {
    const approvers = value.split(',').map((s) => s.trim()).filter(Boolean);
    handleChange('approvers', approvers);
  };

  const handleParamChange = (paramKey: string, value: string) => {
    if (selectedNode.data.type === 'automated') {
      const currentParams = selectedNode.data.params || {};
      handleChange('params', { ...currentParams, [paramKey]: value });
    }
  };

  const automatedData = selectedNode.data.type === 'automated' ? selectedNode.data : null;
  
  const selectedAutomation = automatedData 
    ? automations.find((a) => a.id === automatedData.actionId)
    : null;

  return (
    <div
      className={cn(
        'absolute right-0 top-0 h-full w-80 bg-card border-l border-border shadow-xl z-20',
        'slide-in-right'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold text-foreground">Node Inspector</h2>
          <p className="text-xs text-muted-foreground capitalize">{selectedNode.data.type} Node</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-130px)]">
        <div className="p-4 space-y-4">
          {/* Validation errors */}
          {nodeStatus && !nodeStatus.isValid && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20">
              <p className="text-sm font-medium text-status-error mb-1">Validation Errors</p>
              {nodeStatus.errors.map((e, i) => (
                <p key={i} className="text-xs text-status-error/80">{e.message}</p>
              ))}
            </div>
          )}

          {/* Common fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={selectedNode.data.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Node label"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={selectedNode.data.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Type-specific fields */}
          {selectedNode.data.type === 'start' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="trigger">Trigger Type</Label>
                <Select
                  value={selectedNode.data.trigger || 'manual'}
                  onValueChange={(v) => handleChange('trigger', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="event">Event-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {selectedNode.data.type === 'task' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={selectedNode.data.assignee || ''}
                  onChange={(e) => handleChange('assignee', e.target.value)}
                  placeholder="Enter assignee name"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={selectedNode.data.dueDate || ''}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={selectedNode.data.priority || 'medium'}
                  onValueChange={(v) => handleChange('priority', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={selectedNode.data.estimatedHours || ''}
                  onChange={(e) => handleChange('estimatedHours', parseFloat(e.target.value) || undefined)}
                  placeholder="0"
                />
              </div>

              <Separator />

              {/* Custom fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Custom Fields</Label>
                  <Button variant="ghost" size="sm" onClick={handleAddCustomField}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(customFields).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input
                        value={key}
                        className="w-1/3"
                        placeholder="Key"
                        onChange={(e) => {
                          const newFields = { ...customFields };
                          delete newFields[key];
                          newFields[e.target.value] = value;
                          setCustomFields(newFields);
                          handleChange('customFields', newFields);
                        }}
                      />
                      <Input
                        value={value}
                        className="flex-1"
                        placeholder="Value"
                        onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCustomField(key)}
                      >
                        <Trash2 className="w-4 h-4 text-status-error" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedNode.data.type === 'approval' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="approvers">Approvers (comma-separated)</Label>
                <Input
                  id="approvers"
                  value={selectedNode.data.approvers?.join(', ') || ''}
                  onChange={(e) => handleApproversChange(e.target.value)}
                  placeholder="John, Jane, Bob"
                />
              </div>

              <div>
                <Label htmlFor="approvalType">Approval Type</Label>
                <Select
                  value={selectedNode.data.approvalType || 'any'}
                  onValueChange={(v) => handleChange('approvalType', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any approver</SelectItem>
                    <SelectItem value="all">All approvers</SelectItem>
                    <SelectItem value="majority">Majority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={selectedNode.data.deadline || ''}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="escalationEmail">Escalation Email</Label>
                <Input
                  id="escalationEmail"
                  type="email"
                  value={selectedNode.data.escalationEmail || ''}
                  onChange={(e) => handleChange('escalationEmail', e.target.value)}
                  placeholder="escalation@company.com"
                />
              </div>
            </div>
          )}

          {selectedNode.data.type === 'automated' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="action">Automation Action</Label>
                <Select
                  value={selectedNode.data.actionId || ''}
                  onValueChange={(v) => {
                    const automation = automations.find((a) => a.id === v);
                    handleChange('actionId', v);
                    handleChange('actionLabel', automation?.label || '');
                    handleChange('params', {});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {automations.map((automation) => (
                      <SelectItem key={automation.id} value={automation.id}>
                        {automation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAutomation?.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedAutomation.description}
                  </p>
                )}
              </div>

              {/* Action parameters */}
              {selectedAutomation && selectedAutomation.params.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Action Parameters</Label>
                    {selectedAutomation.params.map((param) => (
                      <div key={param}>
                        <Label htmlFor={param} className="text-xs capitalize">{param}</Label>
                        <Input
                          id={param}
                          value={automatedData?.params?.[param] || ''}
                          onChange={(e) => handleParamChange(param, e.target.value)}
                          placeholder={`Enter ${param}`}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />

              <div>
                <Label htmlFor="retryCount">Retry Count</Label>
                <Input
                  id="retryCount"
                  type="number"
                  value={selectedNode.data.retryCount || 0}
                  onChange={(e) => handleChange('retryCount', parseInt(e.target.value) || 0)}
                  min={0}
                  max={5}
                />
              </div>

              <div>
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={selectedNode.data.timeout || ''}
                  onChange={(e) => handleChange('timeout', parseInt(e.target.value) || undefined)}
                  placeholder="30"
                />
              </div>
            </div>
          )}

          {selectedNode.data.type === 'end' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="outcome">Outcome</Label>
                <Select
                  value={selectedNode.data.outcome || 'success'}
                  onValueChange={(v) => handleChange('outcome', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notifyOnComplete">Notify on Complete</Label>
                <Switch
                  id="notifyOnComplete"
                  checked={selectedNode.data.notifyOnComplete || false}
                  onCheckedChange={(v) => handleChange('notifyOnComplete', v)}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            deleteNode(selectedNode.id);
            onClose();
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
});

NodeInspectorPanel.displayName = 'NodeInspectorPanel';

export default NodeInspectorPanel;
