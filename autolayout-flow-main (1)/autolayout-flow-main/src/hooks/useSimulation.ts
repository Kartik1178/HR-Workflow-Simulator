import { useCallback, useRef, useEffect } from 'react';
import { useWorkflowStore } from '@/state/workflowStore';
import { createSimulationRunner, SimulationRunner } from '@/api/simulateMock';
import { SimulationStep } from '@/types/workflow';

export const useSimulation = () => {
  const {
    nodes,
    edges,
    simulation,
    setSimulation,
    setActiveNode,
    setActiveEdge,
    addSimulationStep,
    resetSimulation,
  } = useWorkflowStore();

  const runnerRef = useRef<SimulationRunner | null>(null);

  const handleStep = useCallback(
    (step: SimulationStep) => {
      addSimulationStep(step);
    },
    [addSimulationStep]
  );

  const handleComplete = useCallback(() => {
    setSimulation({ isRunning: false, isPaused: false });
  }, [setSimulation]);

  const start = useCallback(() => {
    resetSimulation();
    
    runnerRef.current = createSimulationRunner(
      nodes,
      edges,
      handleStep,
      handleComplete,
      setActiveNode,
      setActiveEdge
    );

    setSimulation({ isRunning: true, isPaused: false, startTime: Date.now() });
    runnerRef.current.start();
  }, [nodes, edges, handleStep, handleComplete, setActiveNode, setActiveEdge, setSimulation, resetSimulation]);

  const pause = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.pause();
      setSimulation({ isPaused: true });
    }
  }, [setSimulation]);

  const resume = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.resume();
      setSimulation({ isPaused: false });
    }
  }, [setSimulation]);

  const reset = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.reset();
    }
    resetSimulation();
  }, [resetSimulation]);

  const setSpeed = useCallback(
    (speed: 'slow' | 'normal' | 'fast') => {
      if (runnerRef.current) {
        runnerRef.current.setSpeed(speed);
      }
      setSimulation({ speed });
    },
    [setSimulation]
  );

  const stepForward = useCallback(() => {
    // For step-by-step, we'd pause between each step
    // This is a simplified version
    if (!simulation.isRunning) {
      start();
      setTimeout(() => pause(), 100);
    } else if (simulation.isPaused) {
      resume();
      setTimeout(() => pause(), 100);
    }
  }, [simulation.isRunning, simulation.isPaused, start, pause, resume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (runnerRef.current) {
        runnerRef.current.reset();
      }
    };
  }, []);

  return {
    simulation,
    start,
    pause,
    resume,
    reset,
    setSpeed,
    stepForward,
  };
};
