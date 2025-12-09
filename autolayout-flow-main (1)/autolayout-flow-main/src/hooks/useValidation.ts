import { useMemo } from 'react';
import { useWorkflowStore } from '@/state/workflowStore';
import { ValidationError } from '@/types/workflow';

export const useValidation = () => {
  const { validationErrors, runValidation } = useWorkflowStore();

  const errorCount = useMemo(
    () => validationErrors.filter((e) => e.type === 'error').length,
    [validationErrors]
  );

  const warningCount = useMemo(
    () => validationErrors.filter((e) => e.type === 'warning').length,
    [validationErrors]
  );

  const isValid = errorCount === 0;

  const getNodeErrors = (nodeId: string): ValidationError[] => {
    return validationErrors.filter((e) => e.nodeId === nodeId);
  };

  const getNodeStatus = (
    nodeId: string
  ): { isValid: boolean; hasWarnings: boolean; errors: ValidationError[] } => {
    const nodeErrors = getNodeErrors(nodeId);
    return {
      isValid: !nodeErrors.some((e) => e.type === 'error'),
      hasWarnings: nodeErrors.some((e) => e.type === 'warning'),
      errors: nodeErrors,
    };
  };

  const globalErrors = useMemo(
    () => validationErrors.filter((e) => !e.nodeId && !e.edgeId),
    [validationErrors]
  );

  return {
    validationErrors,
    errorCount,
    warningCount,
    isValid,
    getNodeErrors,
    getNodeStatus,
    globalErrors,
    runValidation,
  };
};
