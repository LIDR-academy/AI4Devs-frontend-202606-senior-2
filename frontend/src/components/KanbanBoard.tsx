import React from 'react';
import KanbanColumn from './KanbanColumn';
import './KanbanBoard.css';
import type {
  CandidateDragPayload,
  InterviewStep,
  PositionCandidate,
} from '../types/position';

type KanbanBoardProps = {
  steps: InterviewStep[];
  candidates: PositionCandidate[];
  movingId: number | null;
  onMove: (candidate: PositionCandidate, stepId: number, stepName: string) => void;
  onDropCandidate: (payload: CandidateDragPayload, step: InterviewStep) => void;
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  steps,
  candidates,
  movingId,
  onMove,
  onDropCandidate,
}) => {
  if (steps.length === 0) {
    return <p className="text-muted">Esta posición no tiene fases de entrevista.</p>;
  }

  return (
    <div className="kanban-board">
      {steps.map((step) => (
        <KanbanColumn
          key={step.id}
          step={step}
          steps={steps}
          candidates={candidates.filter(
            (candidate) => candidate.currentInterviewStep === step.name
          )}
          movingId={movingId}
          onMove={onMove}
          onDropCandidate={onDropCandidate}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
