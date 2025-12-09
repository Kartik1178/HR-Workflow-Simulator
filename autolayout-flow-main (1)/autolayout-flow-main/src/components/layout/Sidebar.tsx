import { memo, DragEvent } from 'react';
import { Play, ClipboardList, UserCheck, Zap, Flag, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeType } from '@/types/workflow';

interface NodePaletteItem {
  type: NodeType;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const nodeTypes: NodePaletteItem[] = [
  {
    type: 'start',
    label: 'Start',
    icon: Play,
    color: 'text-node-start',
    bgColor: 'bg-node-start-bg',
    borderColor: 'border-node-start-border',
    description: 'Workflow entry point',
  },
  {
    type: 'task',
    label: 'Task',
    icon: ClipboardList,
    color: 'text-node-task',
    bgColor: 'bg-node-task-bg',
    borderColor: 'border-node-task-border',
    description: 'Manual task assignment',
  },
  {
    type: 'approval',
    label: 'Approval',
    icon: UserCheck,
    color: 'text-node-approval',
    bgColor: 'bg-node-approval-bg',
    borderColor: 'border-node-approval-border',
    description: 'Requires approval',
  },
  {
    type: 'automated',
    label: 'Automated',
    icon: Zap,
    color: 'text-node-automated',
    bgColor: 'bg-node-automated-bg',
    borderColor: 'border-node-automated-border',
    description: 'Automated action',
  },
  {
    type: 'end',
    label: 'End',
    icon: Flag,
    color: 'text-node-end',
    bgColor: 'bg-node-end-bg',
    borderColor: 'border-node-end-border',
    description: 'Workflow completion',
  },
];

const Sidebar = memo(() => {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Node Palette</h2>
        <p className="text-xs text-sidebar-foreground/60 mt-1">
          Drag nodes to the canvas
        </p>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              className={cn(
                'group flex items-center gap-3 p-3 rounded-lg cursor-grab active:cursor-grabbing',
                'border-2 transition-all duration-200',
                node.bgColor,
                node.borderColor,
                'hover:shadow-md hover:-translate-y-0.5',
                'active:scale-95'
              )}
            >
              <div className="flex items-center justify-center">
                <GripVertical className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/60" />
              </div>
              <div className={cn('p-2 rounded-lg', node.bgColor)}>
                <Icon className={cn('w-5 h-5', node.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('font-medium text-sm', node.color)}>
                  {node.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {node.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with keyboard shortcuts */}
      <div className="p-4 border-t border-sidebar-border">
        <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
          Shortcuts
        </h3>
        <div className="space-y-1.5 text-xs text-sidebar-foreground/60">
          <div className="flex justify-between">
            <span>Delete</span>
            <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-sidebar-accent-foreground">Del</kbd>
          </div>
          <div className="flex justify-between">
            <span>Duplicate</span>
            <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-sidebar-accent-foreground">⌘D</kbd>
          </div>
          <div className="flex justify-between">
            <span>Copy</span>
            <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-sidebar-accent-foreground">⌘C</kbd>
          </div>
          <div className="flex justify-between">
            <span>Paste</span>
            <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-sidebar-accent-foreground">⌘V</kbd>
          </div>
          <div className="flex justify-between">
            <span>Undo</span>
            <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-sidebar-accent-foreground">⌘Z</kbd>
          </div>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
