import React, { useState } from 'react';
import CandidateCard from './CandidateCard';
import type {
  CandidateDragPayload,
  InterviewStep,
  PositionCandidate,
} from '../types/position';

type KanbanColumnProps = {
  step: InterviewStep;
  candidates: PositionCandidate[];
  steps: InterviewStep[];
  movingId: number | null;
  onMove: (candidate: PositionCandidate, stepId: number, stepName: string) => void;
  onDropCandidate: (payload: CandidateDragPayload, step: InterviewStep) => void;
};

function isCandidateDragPayload(value: unknown): value is CandidateDragPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('candidateId' in value) || !('applicationId' in value)) {
    return false;
  }
  return typeof value.candidateId === 'number' && typeof value.applicationId === 'number';
}

function parseDragPayload(raw: string): CandidateDragPayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isCandidateDragPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  step,
  candidates,
  steps,
  movingId,
  onMove,
  onDropCandidate,
}) => {
  const [isOver, setIsOver] = useState(false);
  const headingId = `kanban-column-${step.id}`;

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsOver(false);
    const payload = parseDragPayload(event.dataTransfer.getData('text/plain'));
    if (!payload) {
      return;
    }
    onDropCandidate(payload, step);
  };

  const panelClass = isOver
    ? 'kanban-column-panel kanban-column-panel--over'
    : 'kanban-column-panel';

  return (
    <section className="kanban-column" aria-labelledby={headingId}>
      <div
        className={panelClass}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h2 className="kanban-column-title" id={headingId}>
          {step.name}
          <span className="visually-hidden">, {candidates.length} candidatos</span>
        </h2>
        <div className="kanban-column-body">
          {candidates.length === 0 ? (
            <p className="kanban-column-empty mb-0">No hay candidatos en esta fase</p>
          ) : (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                steps={steps}
                disabled={movingId === candidate.id}
                onMove={onMove}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default KanbanColumn;
