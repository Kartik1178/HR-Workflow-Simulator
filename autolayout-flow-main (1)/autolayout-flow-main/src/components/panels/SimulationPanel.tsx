import { memo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Gauge,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSimulation } from '@/hooks/useSimulation';
import { useValidation } from '@/hooks/useValidation';

interface SimulationPanelProps {
  isOpen: boolean;
}

const speedOptions = [
  { value: 'slow', label: 'Slow (2s)', icon: '🐢' },
  { value: 'normal', label: 'Normal (1s)', icon: '🏃' },
  { value: 'fast', label: 'Fast (0.5s)', icon: '⚡' },
];

const SimulationPanel = memo(({ isOpen }: SimulationPanelProps) => {
  const { simulation, start, pause, resume, reset, setSpeed, stepForward } = useSimulation();
  const { isValid, errorCount } = useValidation();

  if (!isOpen) return null;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'executing':
        return <Activity className="w-4 h-4 text-status-info animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-status-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-status-error" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[500px] bg-card border border-border rounded-xl shadow-xl z-20 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">Simulation</h2>
          {simulation.isRunning && !simulation.isPaused && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-status-success/10 text-status-success animate-pulse">
              Running
            </span>
          )}
          {simulation.isPaused && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-status-warning/10 text-status-warning">
              Paused
            </span>
          )}
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-muted-foreground" />
          <Select value={simulation.speed} onValueChange={(v: any) => setSpeed(v)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {speedOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        {!simulation.isRunning ? (
          <Button
            onClick={start}
            disabled={!isValid}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Simulation
          </Button>
        ) : simulation.isPaused ? (
          <Button onClick={resume} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary" className="flex-1">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={stepForward}
          disabled={!isValid}
          title="Step forward"
        >
          <StepForward className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={reset}
          title="Reset simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Validation warning */}
      {!isValid && (
        <div className="px-4 py-3 bg-status-error/10 border-b border-status-error/20">
          <div className="flex items-center gap-2 text-status-error">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Fix {errorCount} validation error{errorCount !== 1 ? 's' : ''} to run simulation
            </span>
          </div>
        </div>
      )}

      {/* Execution logs */}
      <ScrollArea className="h-48">
        <div className="p-4 space-y-2">
          {simulation.steps.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No simulation steps yet</p>
              <p className="text-xs mt-1">Click Start to begin</p>
            </div>
          ) : (
            simulation.steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-2 rounded-lg transition-colors',
                  step.status === 'executing' && 'bg-status-info/5',
                  step.status === 'completed' && 'bg-status-success/5',
                  step.status === 'failed' && 'bg-status-error/5'
                )}
              >
                {getStepIcon(step.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {step.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(step.timestamp)}
                    </span>
                    {step.duration && (
                      <span className="text-xs text-muted-foreground">
                        • {Math.round(step.duration)}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

SimulationPanel.displayName = 'SimulationPanel';

export default SimulationPanel;
