import { memo, useState, useEffect } from 'react';
import { X, GitBranch, Percent, MessageSquare, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useWorkflowStore } from '@/state/workflowStore';

interface EdgeInspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const EDGE_COLORS = [
  { value: 'default', label: 'Default', color: 'hsl(220 9% 46%)' },
  { value: 'success', label: 'Success', color: 'hsl(142 76% 36%)' },
  { value: 'warning', label: 'Warning', color: 'hsl(43 96% 56%)' },
  { value: 'error', label: 'Error', color: 'hsl(0 84% 60%)' },
  { value: 'primary', label: 'Primary', color: 'hsl(221 83% 53%)' },
];

const EdgeInspectorPanel = memo(({ isOpen, onClose }: EdgeInspectorPanelProps) => {
  const { edges, selectedEdgeId, updateEdge, nodes } = useWorkflowStore();
  
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);
  const sourceNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.source) : null;
  const targetNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.target) : null;

  const [label, setLabel] = useState('');
  const [probability, setProbability] = useState(100);
  const [notes, setNotes] = useState('');
  const [colorPreset, setColorPreset] = useState('default');

  // Sync form with selected edge
  useEffect(() => {
    if (selectedEdge) {
      setLabel(selectedEdge.data?.label || '');
      setProbability(selectedEdge.data?.probability || 100);
      setNotes(selectedEdge.data?.notes || '');
      setColorPreset(selectedEdge.data?.colorPreset || 'default');
    }
  }, [selectedEdge]);

  // Update edge data
  useEffect(() => {
    if (!selectedEdgeId) return;
    
    const selectedColor = EDGE_COLORS.find((c) => c.value === colorPreset);
    
    updateEdge(selectedEdgeId, {
      label,
      probability,
      notes,
      colorPreset,
      color: selectedColor?.color,
    });
  }, [label, probability, notes, colorPreset, selectedEdgeId, updateEdge]);

  if (!isOpen || !selectedEdge) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-background border-l border-border shadow-xl z-20 slide-in-right flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Edge Properties</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Connection Info */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <div className="px-2 py-1 bg-card rounded border border-border">
            {sourceNode?.data.label || 'Unknown'}
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-2 py-1 bg-card rounded border border-border">
            {targetNode?.data.label || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="edge-label" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Label
          </Label>
          <Input
            id="edge-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Approved, Rejected, Next..."
          />
        </div>

        {/* Probability */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Probability / Weight
            <span className="ml-auto text-primary font-medium">{probability}%</span>
          </Label>
          <Slider
            value={[probability]}
            onValueChange={(v) => setProbability(v[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Set the likelihood of this path being taken in simulation
          </p>
        </div>

        {/* Color */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Edge Color
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {EDGE_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setColorPreset(color.value)}
                className={cn(
                  'w-full aspect-square rounded-lg border-2 transition-all',
                  colorPreset === color.value
                    ? 'border-primary scale-110 shadow-md'
                    : 'border-transparent hover:border-border'
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="edge-notes" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Notes
          </Label>
          <Textarea
            id="edge-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this connection..."
            rows={4}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Edge ID: {selectedEdge.id.substring(0, 20)}...
        </p>
      </div>
    </div>
  );
});

EdgeInspectorPanel.displayName = 'EdgeInspectorPanel';

export default EdgeInspectorPanel;
