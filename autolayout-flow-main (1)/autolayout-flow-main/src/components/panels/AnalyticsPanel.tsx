import { memo, useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  BarChart3,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Search,
  X,
  Zap,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowStore } from '@/state/workflowStore';
import { useValidation } from '@/hooks/useValidation';
import { useReactFlow } from 'reactflow';

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CollapsibleCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
}

const CollapsibleCard = memo(({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
  badgeVariant = 'secondary',
}: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{title}</span>
          {badge !== undefined && (
            <Badge variant={badgeVariant} className="ml-1 text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50 animate-in">
          {children}
        </div>
      )}
    </div>
  );
});

CollapsibleCard.displayName = 'CollapsibleCard';

const AnalyticsPanel = memo(({ isOpen, onClose }: AnalyticsPanelProps) => {
  const { nodes, edges, setSelectedNode } = useWorkflowStore();
  const { validationErrors, isValid } = useValidation();
  
  const errors = validationErrors.filter((e) => e.type === 'error');
  const warnings = validationErrors.filter((e) => e.type === 'warning');
  const { fitView, setCenter } = useReactFlow();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate metrics
  const metrics = useMemo(() => {
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    
    // Automation coverage
    const automatedNodes = nodes.filter((n) => n.type === 'automated').length;
    const automationCoverage = nodeCount > 0 
      ? Math.round((automatedNodes / nodeCount) * 100) 
      : 0;
    
    // Estimated cycle time (rough estimate based on node types)
    const taskNodes = nodes.filter((n) => n.type === 'task').length;
    const approvalNodes = nodes.filter((n) => n.type === 'approval').length;
    const estimatedCycleTime = taskNodes * 2 + approvalNodes * 4 + automatedNodes * 0.5;
    
    // Health score
    const errorPenalty = errors.length * 15;
    const warningPenalty = warnings.length * 5;
    const baseScore = nodeCount > 0 ? 100 : 0;
    const healthScore = Math.max(0, Math.min(100, baseScore - errorPenalty - warningPenalty));
    
    // Last modified (from localStorage)
    const stored = localStorage.getItem('workflow-storage');
    let lastModified: Date | null = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state) {
          lastModified = new Date();
        }
      } catch {
        // ignore
      }
    }
    
    return {
      nodeCount,
      edgeCount,
      automatedNodes,
      automationCoverage,
      estimatedCycleTime,
      healthScore,
      lastModified,
      taskNodes,
      approvalNodes,
    };
  }, [nodes, edges, errors, warnings]);

  // Filter problem nodes
  const problemNodes = useMemo(() => {
    const nodeProblems: Array<{
      nodeId: string;
      label: string;
      type: string;
      issues: string[];
    }> = [];

    nodes.forEach((node) => {
      const issues: string[] = [];
      
      errors.forEach((err) => {
        if (err.nodeId === node.id) {
          issues.push(err.message);
        }
      });
      
      warnings.forEach((warn) => {
        if (warn.nodeId === node.id) {
          issues.push(warn.message);
        }
      });

      if (issues.length > 0) {
        nodeProblems.push({
          nodeId: node.id,
          label: node.data.label || 'Unnamed',
          type: node.type || 'unknown',
          issues,
        });
      }
    });

    return nodeProblems;
  }, [nodes, errors, warnings]);

  // Filtered problem nodes by search
  const filteredProblems = useMemo(() => {
    if (!searchQuery) return problemNodes;
    const query = searchQuery.toLowerCase();
    return problemNodes.filter(
      (p) =>
        p.label.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.issues.some((i) => i.toLowerCase().includes(query))
    );
  }, [problemNodes, searchQuery]);

  const handleFocusNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(nodeId);
      setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.5, duration: 500 });
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-status-success';
    if (score >= 50) return 'text-status-warning';
    return 'text-status-error';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-status-success/10';
    if (score >= 50) return 'bg-status-warning/10';
    return 'bg-status-error/10';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-background border-l border-border shadow-xl z-20 slide-in-right flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Analytics</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {/* Workflow Summary */}
          <CollapsibleCard title="Workflow Summary" icon={GitBranch}>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">
                  {metrics.nodeCount}
                </div>
                <div className="text-xs text-muted-foreground">Nodes</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">
                  {metrics.edgeCount}
                </div>
                <div className="text-xs text-muted-foreground">Connections</div>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Task Nodes</span>
                <span className="font-medium">{metrics.taskNodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approval Nodes</span>
                <span className="font-medium">{metrics.approvalNodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Automated Nodes</span>
                <span className="font-medium">{metrics.automatedNodes}</span>
              </div>
            </div>
          </CollapsibleCard>

          {/* Automation Coverage */}
          <CollapsibleCard
            title="Automation Coverage"
            icon={Zap}
            badge={`${metrics.automationCoverage}%`}
          >
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-node-automated rounded-full transition-all duration-500"
                  style={{ width: `${metrics.automationCoverage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.automatedNodes} of {metrics.nodeCount} nodes are automated
              </p>
            </div>
          </CollapsibleCard>

          {/* Estimated Cycle Time */}
          <CollapsibleCard title="Estimated Cycle Time" icon={Clock}>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-primary">
                {metrics.estimatedCycleTime.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                hours<br />
                <span className="text-xs">(approximate)</span>
              </div>
            </div>
          </CollapsibleCard>

          {/* Health Score */}
          <CollapsibleCard
            title="Workflow Health"
            icon={Activity}
            badge={isValid ? 'Healthy' : 'Issues'}
            badgeVariant={isValid ? 'secondary' : 'destructive'}
          >
            <div className={cn('p-4 rounded-lg text-center', getHealthBg(metrics.healthScore))}>
              <div className={cn('text-4xl font-bold', getHealthColor(metrics.healthScore))}>
                {metrics.healthScore}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Health Score</div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-status-error" />
                <span>{errors.length} errors</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                <span>{warnings.length} warnings</span>
              </div>
            </div>
          </CollapsibleCard>

          {/* Problem Nodes */}
          <CollapsibleCard
            title="Problem Nodes"
            icon={AlertTriangle}
            badge={filteredProblems.length}
            badgeVariant={filteredProblems.length > 0 ? 'destructive' : 'secondary'}
            defaultOpen={filteredProblems.length > 0}
          >
            {filteredProblems.length === 0 ? (
              <div className="flex flex-col items-center py-4 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 text-status-success mb-2" />
                <span className="text-sm">No issues found</span>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProblems.map((problem) => (
                  <button
                    key={problem.nodeId}
                    onClick={() => handleFocusNode(problem.nodeId)}
                    className="w-full p-2 bg-status-error/5 border border-status-error/20 rounded-lg text-left hover:bg-status-error/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{problem.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {problem.type}
                      </Badge>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {problem.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-status-error mt-0.5">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            )}
          </CollapsibleCard>

          {/* Last Modified */}
          <CollapsibleCard title="Last Modified" icon={CalendarDays} defaultOpen={false}>
            <div className="text-sm text-muted-foreground">
              {metrics.lastModified
                ? metrics.lastModified.toLocaleString()
                : 'Never saved'}
            </div>
          </CollapsibleCard>
        </div>
      </ScrollArea>
    </div>
  );
});

AnalyticsPanel.displayName = 'AnalyticsPanel';

export default AnalyticsPanel;
