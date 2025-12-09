// src/components/edges/CustomEdge.tsx
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import { useWorkflowStore } from '@/state/workflowStore';
import { EdgeData } from '@/types/workflow';

/**
 * CustomEdge
 * - Always visible midpoint metric pill (foreignObject)
 * - Color-coded stroke from data.color or probability/weight
 * - Wider invisible hit-path for easy hover/click
 * - Click sets selectedEdge in global store to open EdgeInspectorPanel
 */

function probabilityToColor(prob?: number | null) {
  if (prob === undefined || prob === null) return '#9CA3AF'; // neutral gray
  if (prob >= 75) return '#10B981'; // green
  if (prob >= 40) return '#6366F1'; // purple-ish / neutral positive
  if (prob >= 15) return '#F59E0B'; // orange/warning
  return '#EF4444'; // red
}

const formatProb = (p?: number | null) => {
  if (p === undefined || p === null) return '';
  // show integer % if given as 0-100, else if 0-1 convert
  if (p <= 1) return `${Math.round(p * 100)}%`;
  return `${Math.round(p)}%`;
};

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  color: '#fff',
  boxShadow: '0 6px 14px rgba(2,6,23,0.08)',
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  selected,
  markerEnd,
}: EdgeProps<EdgeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const setSelectedEdge = useWorkflowStore((s) => s.setSelectedEdge);

  // Build bezier path
  const [edgePath, labelX, labelY] = useMemo(() => getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
    curvature: 0.25,
  }), [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  // derive display values
  const probability = data?.probability ?? data?.weight ?? null; // probability in 0-100 or 0-1 ambiguous, we treat as 0-100 if >1
  const probNumber = typeof probability === 'number' ? probability : parseFloat(String(probability || 'NaN'));
  const normalizedProb = Number.isFinite(probNumber) ? probNumber : undefined;
  const pillText = data?.label
    ? data.label
    : normalizedProb !== undefined
      ? formatProb(normalizedProb <= 1 ? normalizedProb * 100 : normalizedProb)
      : (data?.weight ? `w:${data.weight}` : '');

  const strokeColor = data?.color ?? probabilityToColor(normalizedProb);

  const handleClick = useCallback((evt: React.MouseEvent) => {
    // prevent canvas pan/select behavior
    evt.stopPropagation();
    // set selected edge in store so EdgeInspectorPanel opens (Designer listens to store.selectedEdgeId)
    setSelectedEdge?.(id);
  }, [id, setSelectedEdge]);

  return (
    <>
      {/* Invisible thick path to allow easy hover/click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Visible edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: selected || isHovered ? 3 : 2,
          stroke: selected ? 'var(--primary)' : strokeColor,
          strokeLinecap: 'round',
          transition: 'stroke 0.12s ease, stroke-width 0.12s ease',
          ...style,
        }}
      />

      {/* Midpoint pill (always visible) */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            left: labelX,
            top: labelY,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none', // default - pill itself will handle pointer events below by nested element
          }}
          className="nodrag nopan"
        >
          {/* Pill */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e);
            }}
            style={{
              ...pillStyle,
              background: strokeColor,
              pointerEvents: 'auto', // allow clicks on pill
            }}
            role="button"
            aria-label={data?.label ? data.label : `edge ${id} metrics`}
            title={data?.label ? data.label : (pillText || 'Edge')}
          >
            <span style={{ marginRight: data?.label ? 0 : 6 }}>
              {pillText || '—'}
            </span>
          </div>

          {/* Hover tooltip (slightly below pill) */}
          {isHovered && (
            <div style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
              <div style={{
                background: 'var(--card)',
                color: 'var(--foreground)',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                boxShadow: '0 8px 22px rgba(2,6,23,0.12)',
                fontSize: 12,
                whiteSpace: 'nowrap'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{data?.label ? data.label : 'Edge Details'}</div>
                {data?.weight !== undefined && <div style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Weight: {data.weight}</div>}
                {data?.probability !== undefined && <div style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Probability: {typeof data.probability === 'number' ? (data.probability <= 1 ? `${Math.round(data.probability*100)}%` : `${Math.round(data.probability)}%`) : data.probability}</div>}
                {data?.condition && <div style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Condition: {data.condition}</div>}
                {!data?.weight && data?.probability === undefined && !data?.condition && <div style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Click to edit</div>}
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';

export default CustomEdge;
