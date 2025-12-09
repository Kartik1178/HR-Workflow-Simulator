import { memo } from 'react';
import {
  Copy,
  Trash2,
  Edit3,
  ClipboardCopy,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/state/workflowStore';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string | null;
  onClose: () => void;
  onEdit: () => void;
}

const ContextMenu = memo(({ x, y, nodeId, onClose, onEdit }: ContextMenuProps) => {
  const { deleteNode, duplicateNode, copyNodes, updateNode, nodes } = useWorkflowStore();

  const node = nodes.find((n) => n.id === nodeId);

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleDelete = () => {
    if (nodeId) {
      deleteNode(nodeId);
    }
    onClose();
  };

  const handleDuplicate = () => {
    if (nodeId) {
      duplicateNode(nodeId);
    }
    onClose();
  };

  const handleCopy = () => {
    if (nodeId) {
      copyNodes([nodeId]);
    }
    onClose();
  };

  const handleAddNote = () => {
    if (nodeId && node) {
      const currentDesc = node.data.description || '';
      const note = prompt('Add a note:', currentDesc);
      if (note !== null) {
        updateNode(nodeId, { description: note });
      }
    }
    onClose();
  };

  const menuItems = [
    { icon: Edit3, label: 'Edit node', action: handleEdit, shortcut: 'Enter' },
    { icon: ClipboardCopy, label: 'Duplicate', action: handleDuplicate, shortcut: '⌘D' },
    { icon: Copy, label: 'Copy', action: handleCopy, shortcut: '⌘C' },
    { icon: MessageSquare, label: 'Add note', action: handleAddNote },
    { divider: true },
    { icon: Trash2, label: 'Delete', action: handleDelete, shortcut: 'Del', destructive: true },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        style={{ left: x, top: y }}
        className={cn(
          'fixed z-50 min-w-[180px] bg-popover border border-border rounded-lg shadow-xl overflow-hidden',
          'animate-in'
        )}
      >
        {menuItems.map((item, index) => {
          if ('divider' in item) {
            return <div key={index} className="h-px bg-border my-1" />;
          }

          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                'hover:bg-accent',
                item.destructive && 'text-status-error hover:bg-status-error/10'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-muted-foreground">{item.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
});

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;
