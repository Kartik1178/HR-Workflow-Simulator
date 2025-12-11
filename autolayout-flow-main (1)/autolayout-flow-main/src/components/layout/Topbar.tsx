// src/components/layout/Topbar.tsx
import { memo, useRef, useState } from 'react';
import {
  LayoutGrid,
  LayoutList,
  Save,
  Undo2,
  Redo2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileJson,
  Upload,
  History,
  BarChart3,
  PlusSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/state/workflowStore';
import { useValidation } from '@/hooks/useValidation';
import { toast } from '@/hooks/use-toast';
import { parseWorkflowFile, exportWorkflow, saveWorkflowVersion } from '@/utils/storage';

// ShadCN AlertDialog components
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

interface TopbarProps {
  onAutoLayout: (direction: 'TB' | 'LR') => void;
  onOpenVersions: () => void;
  onOpenAnalytics: () => void;
}

const Topbar = memo(({ onAutoLayout, onOpenVersions, onOpenAnalytics }: TopbarProps) => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    undo,
    redo,
    history,
    historyIndex,
    runValidation,
    saveToHistory,
  } = useWorkflowStore();

  const { errorCount, warningCount, isValid } = useValidation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isNewDialogSavingBlank, setIsNewDialogSavingBlank] = useState(false); // checkbox state (save blank)
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSave = () => {
    const workflow = { nodes, edges };
    try {
      localStorage.setItem('workflow-backup', JSON.stringify(workflow));
      toast({
        title: 'Workflow saved',
        description: 'Your workflow has been saved to local storage.',
      });
    } catch (e) {
      toast({
        title: 'Save failed',
        description: 'Unable to save workflow to local storage.',
        variant: 'destructive',
      });
      console.error('[Topbar] save failed', e);
    }
  };

  const handleExport = () => {
    const json = exportWorkflow(nodes, edges);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Workflow exported',
      description: 'Your workflow has been downloaded as JSON.',
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await parseWorkflowFile(file);
    if (result) {
      setNodes(result.nodes);
      setEdges(result.edges);
      runValidation();
      toast({
        title: 'Workflow imported',
        description: `Loaded ${result.nodes.length} nodes and ${result.edges.length} edges.`,
      });
    } else {
      toast({
        title: 'Import failed',
        description: 'Invalid workflow file format.',
        variant: 'destructive',
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createNewWorkflow = async (saveBlankVersion: boolean) => {
    // Save current to history so undo works
    try {
      saveToHistory();
    } catch (e) {
      console.debug('[Topbar] saveToHistory failed', e);
    }

    // Clear the canvas
    setNodes([]);
    setEdges([]);
    runValidation();

    // Optionally save the blank workflow as a version
    if (saveBlankVersion) {
      try {
        saveWorkflowVersion([], [], 'Blank Workflow');
      } catch (e) {
        console.warn('[Topbar] save blank workflow version failed', e);
      }
    }

    toast({
      title: 'New workflow created',
      description: 'Canvas has been reset to an empty workflow.',
    });
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left section - Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">HR Workflow Designer</h1>
          </div>
        </div>

        {/* Validation status */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
          {isValid ? (
            <div className="flex items-center gap-1.5 text-status-success">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Valid</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {errorCount > 0 && (
                <div className="flex items-center gap-1.5 text-status-error">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center gap-1.5 text-status-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center section - Quick stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{nodes.length} nodes</span>
        <span>•</span>
        <span>{edges.length} connections</span>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="rounded-none h-8"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (⌘Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="rounded-none h-8 border-l border-border"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
          </Tooltip>
        </div>

        {/* Auto Layout */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <LayoutList className="w-4 h-4 mr-2" />
                  Tidy Layout
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Auto-arrange nodes</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAutoLayout('TB')}>
              <LayoutList className="w-4 h-4 mr-2" />
              Top to Bottom
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAutoLayout('LR')}>
              <LayoutList className="w-4 h-4 mr-2 rotate-90" />
              Left to Right
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import JSON workflow</TooltipContent>
        </Tooltip>

        {/* Export */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8">
              <FileJson className="w-4 h-4 mr-2" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export as JSON</TooltipContent>
        </Tooltip>

        {/* New Workflow - custom dialog with "save blank" checkbox */}
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 flex items-center gap-2">
                  <PlusSquare className="w-4 h-4 mr-0" />
                  New
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Create a new blank workflow</TooltipContent>
          </Tooltip>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Workflow?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all existing nodes and edges. You can undo if your history contains
                the previous state. Optionally save the blank workflow as a version.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="px-4">
              <label className="inline-flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={isNewDialogSavingBlank}
                  onChange={(e) => setIsNewDialogSavingBlank(e.target.checked)}
                  className="rounded border"
                />
                <span className="text-sm text-muted-foreground">Also save blank workflow as a version</span>
              </label>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  // create new workflow and optionally save blank
                  createNewWorkflow(isNewDialogSavingBlank);
                  // reset checkbox for next time
                  setIsNewDialogSavingBlank(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Create New
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Versions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onOpenVersions} className="h-8">
              <History className="w-4 h-4 mr-2" />
              Versions
            </Button>
          </TooltipTrigger>
          <TooltipContent>Version history</TooltipContent>
        </Tooltip>

        {/* Analytics */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onOpenAnalytics} className="h-8 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 mr-0" />
              Analytics
            </Button>
          </TooltipTrigger>
          <TooltipContent>Show analytics</TooltipContent>
        </Tooltip>

        {/* Save */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={handleSave} className="h-8">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save workflow (⌘S)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
});

Topbar.displayName = 'Topbar';

export default Topbar;
