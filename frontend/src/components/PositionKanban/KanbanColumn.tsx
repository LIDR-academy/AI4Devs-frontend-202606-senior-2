import React, { useState } from 'react';
import { InterviewStep, Candidate } from '../../types/position';
import { CandidateCard } from './CandidateCard';
import { People } from 'react-bootstrap-icons';

interface KanbanColumnProps {
  step: InterviewStep;
  candidates: Candidate[];
  allSteps: InterviewStep[];
  color: string;
  onDropCandidate: (candidateData: any, targetStep: InterviewStep) => void;
  onCandidateDragStart: (e: React.DragEvent<HTMLDivElement>, candidate: Candidate) => void;
  onMoveStep: (candidate: Candidate, targetStepId: number, targetStepName: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  step,
  candidates,
  allSteps,
  color,
  onDropCandidate,
  onCandidateDragStart,
  onMoveStep
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only remove highlight if leaving column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const rawData = e.dataTransfer.getData('text/plain');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        onDropCandidate(parsed, step);
      } catch (err) {
        console.error('Error parsing dragged candidate data:', err);
      }
    }
  };

  return (
    <div
      className={`kanban-column ${isDragOver ? 'is-drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`kanban-column-${step.id}`}
      aria-label={`Fase ${step.name}, ${candidates.length} candidatos`}
    >
      <div className="kanban-column-header">
        <h3 className="kanban-column-title">
          <span className="kanban-column-dot" style={{ backgroundColor: color }} />
          <span>{step.name}</span>
        </h3>
        <span className="kanban-column-badge" data-testid={`column-count-${step.id}`}>
          {candidates.length}
        </span>
      </div>

      <div className="kanban-column-cards" role="list">
        {candidates.length === 0 ? (
          <div className="kanban-empty-state">
            <People className="kanban-empty-icon" />
            <p className="kanban-empty-text">Sin candidatos en esta fase</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              steps={allSteps}
              onDragStart={onCandidateDragStart}
              onMoveStep={onMoveStep}
            />
          ))
        )}
      </div>
    </div>
  );
};
