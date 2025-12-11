// src/components/panels/VersionPanel.tsx
import { memo, useState, useEffect, useCallback } from 'react';
import {
  X,
  History,
  Clock,
  Save,
  Trash2,
  RotateCcw,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useWorkflowStore } from '@/state/workflowStore';
import {
  getWorkflowVersions,
  saveWorkflowVersion,
  deleteVersion,
  calculateVersionDiff,
  WorkflowVersion,
  VersionDiff,
} from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

interface VersionPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VersionPanel = memo(({ isOpen, onClose }: VersionPanelProps) => {
  const { nodes, edges, setNodes, setEdges, runValidation } = useWorkflowStore();
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [versionName, setVersionName] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // helper to reload versions from storage
  const reloadVersions = useCallback(() => {
    try {
      const v = getWorkflowVersions();
      setVersions(v);
    } catch (err) {
      console.error('[VersionPanel] reloadVersions failed', err);
      setVersions([]);
    }
  }, []);

  // Load versions on open
  useEffect(() => {
    if (isOpen) reloadVersions();
  }, [isOpen, reloadVersions]);

  // Keep in sync with other tabs via storage event
  useEffect(() => {
    const handler = (ev: StorageEvent) => {
      if (ev.key && ev.key.startsWith('workflow-versions')) {
        reloadVersions();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [reloadVersions]);

  // Calculate diff when a version is selected
  useEffect(() => {
    if (!selectedVersionId) {
      setDiff(null);
      return;
    }
    const version = versions.find((v) => v.id === selectedVersionId);
    if (!version) {
      setDiff(null);
      return;
    }
    try {
      const calculated = calculateVersionDiff(nodes, edges, version.nodes, version.edges);
      setDiff(calculated);
    } catch (err) {
      console.error('[VersionPanel] calculateVersionDiff failed', err);
      setDiff(null);
    }
  }, [selectedVersionId, nodes, edges, versions]);

  const handleSaveVersion = () => {
    try {
      const name = versionName.trim() || undefined;
      const saved = saveWorkflowVersion(nodes, edges, name);
      reloadVersions();
      setVersionName('');
      toast({
        title: 'Version saved',
        description: `${saved.name || 'New version'} has been saved.`,
      });
    } catch (err) {
      console.error('[VersionPanel] handleSaveVersion error', err);
      toast({
        title: 'Save failed',
        description: 'Unable to save version (see console).',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreVersion = async (version: WorkflowVersion) => {
    if (isApplying) return;
    setIsApplying(true);
    try {
      console.debug('[VersionPanel] restoring version', version.id);
      // apply nodes/edges to store
      setNodes(version.nodes);
      setEdges(version.edges);
      // re-run validation (and any other effects)
      runValidation();

      // Make sure UI refreshes versions (no change to versions list but keep consistent)
      reloadVersions();

      toast({
        title: 'Version restored',
        description: `Restored to "${version.name}"`,
      });

      // Close panel after restore
      onClose();
    } catch (err) {
      console.error('[VersionPanel] handleRestoreVersion error', err);
      toast({
        title: 'Restore failed',
        description: 'Unable to restore version (see console).',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeleteVersion = (id: string) => {
    try {
      console.debug('[VersionPanel] deleting version', id);
      deleteVersion(id);
      reloadVersions();
      if (selectedVersionId === id) setSelectedVersionId(null);
      toast({
        title: 'Version deleted',
        description: 'The version has been removed.',
      });
    } catch (err) {
      console.error('[VersionPanel] handleDeleteVersion error', err);
      toast({
        title: 'Delete failed',
        description: 'Unable to delete version (see console).',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-background border-l border-border shadow-xl z-20 slide-in-right flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Version History</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Save New Version */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex gap-2">
          <Input
            placeholder="Version name (optional)"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSaveVersion}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Save current state with {nodes.length} nodes and {edges.length} edges
        </p>
      </div>

      {/* Version Diff Summary */}
      {diff && (
        <div className="p-4 border-b border-border bg-card/50">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Changes from selected version
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-status-success/10 rounded">
              <Plus className="w-3 h-3 mx-auto mb-1 text-status-success" />
              <div className="font-medium text-status-success">{diff.nodesAdded}</div>
              <div className="text-muted-foreground">Added</div>
            </div>
            <div className="p-2 bg-status-error/10 rounded">
              <Minus className="w-3 h-3 mx-auto mb-1 text-status-error" />
              <div className="font-medium text-status-error">{diff.nodesRemoved}</div>
              <div className="text-muted-foreground">Removed</div>
            </div>
            <div className="p-2 bg-status-warning/10 rounded">
              <RefreshCw className="w-3 h-3 mx-auto mb-1 text-status-warning" />
              <div className="font-medium text-status-warning">{diff.nodesChanged}</div>
              <div className="text-muted-foreground">Changed</div>
            </div>
          </div>
        </div>
      )}

      {/* Version List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No saved versions yet</p>
              <p className="text-xs mt-1">Save your first version above</p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className={cn(
                  'p-3 rounded-lg border transition-all cursor-pointer',
                  selectedVersionId === version.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                )}
                onClick={() =>
                  setSelectedVersionId((prev) => (prev === version.id ? null : version.id))
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {version.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(version.timestamp)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {version.nodes.length} nodes
                    </Badge>
                  </div>
                </div>
{/* ... inside versions.map(...) ... */}
{selectedVersionId === version.id && (
  <div className="mt-3 pt-3 border-t border-border flex gap-2 items-center">
    <Button
      size="sm"
      className="flex-1"
      onClick={() => {
        console.debug('[Test] direct restore click', version.id);
        try {
          setNodes(version.nodes);
          setEdges(version.edges);
          runValidation();
          reloadVersions();
          toast({ title: 'Restored (test)', description: `Restored ${version.name}` });
        } catch (err) {
          console.error('[Test] direct restore failed', err);
          toast({ title: 'Restore failed', description: String(err), variant: 'destructive' });
        }
      }}
    >
      Direct Restore
    </Button>

    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        console.debug('[Test] direct delete click', version.id);
        try {
          deleteVersion(version.id);
          reloadVersions();
          toast({ title: 'Deleted (test)', description: `${version.name} removed.` });
        } catch (err) {
          console.error('[Test] direct delete failed', err);
          toast({ title: 'Delete failed', description: String(err), variant: 'destructive' });
        }
      }}
    >
      Direct Delete
    </Button>
  </div>
)}

              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border text-center text-xs text-muted-foreground">
        {versions.length} / 20 versions saved
      </div>
    </div>
  );
});

VersionPanel.displayName = 'VersionPanel';

export default VersionPanel;
