import { WorkflowEdge } from '@/types/workflow';

export interface EdgeMetrics {
  avgTime: number;
  passRate: number;
  totalExecutions: number;
}

// Mock metrics generator for demo purposes
export const generateMockMetrics = (): EdgeMetrics => {
  return {
    avgTime: Math.round(Math.random() * 300 + 10), // 10-310 seconds
    passRate: Math.round(Math.random() * 40 + 60), // 60-100%
    totalExecutions: Math.round(Math.random() * 1000 + 100),
  };
};

export const getEdgeMetrics = (edge: WorkflowEdge): EdgeMetrics | null => {
  if (edge.data?.metrics) {
    return {
      avgTime: edge.data.metrics.avgTime || 0,
      passRate: edge.data.metrics.passRate || 0,
      totalExecutions: 0,
    };
  }
  return null;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

export const getPassRateColor = (rate: number): string => {
  if (rate >= 90) return 'text-status-success bg-status-success/10';
  if (rate >= 70) return 'text-status-warning bg-status-warning/10';
  return 'text-status-error bg-status-error/10';
};

export const calculateEdgeWeight = (
  probability?: number,
  weight?: number
): number => {
  if (probability !== undefined) return probability;
  if (weight !== undefined) return weight;
  return 1;
};
