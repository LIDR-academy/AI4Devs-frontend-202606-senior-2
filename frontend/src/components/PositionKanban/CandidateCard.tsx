import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { StarFill, ThreeDotsVertical, ArrowRightCircle } from 'react-bootstrap-icons';
import { Candidate, InterviewStep } from '../../types/position';

interface CandidateCardProps {
  candidate: Candidate;
  steps: InterviewStep[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, candidate: Candidate) => void;
  onMoveStep: (candidate: Candidate, targetStepId: number, targetStepName: string) => void;
}

const getInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  steps,
  onDragStart,
  onMoveStep
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: candidate.id,
      applicationId: candidate.applicationId,
      currentInterviewStep: candidate.currentInterviewStep
    }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(e, candidate);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const initials = getInitials(candidate.fullName);
  const scoreDisplay = typeof candidate.averageScore === 'number'
    ? candidate.averageScore.toFixed(1)
    : '0.0';

  return (
    <div
      className={`candidate-card ${isDragging ? 'is-dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="listitem"
      aria-label={`Candidato ${candidate.fullName}, puntuación ${scoreDisplay}`}
      data-testid={`candidate-card-${candidate.id}`}
    >
      <div className="candidate-card-header">
        <div className="candidate-card-info">
          <div className="candidate-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <h4 className="candidate-name">{candidate.fullName}</h4>
            <span className="candidate-id-badge">ID: #{candidate.id}</span>
          </div>
        </div>

        {/* Quick Move Dropdown for Touch / Keyboard Accessibility */}
        <Dropdown className="candidate-quick-move" align="end">
          <Dropdown.Toggle
            as="button"
            className="btn btn-sm btn-link text-secondary p-0 border-0 shadow-none"
            aria-label="Opciones de candidato"
          >
            <ThreeDotsVertical size={16} />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-sm">
            <Dropdown.Header>Mover a fase:</Dropdown.Header>
            {steps.map((step) => {
              const isCurrent = step.name.toLowerCase() === candidate.currentInterviewStep?.toLowerCase();
              return (
                <Dropdown.Item
                  key={step.id}
                  disabled={isCurrent}
                  onClick={() => onMoveStep(candidate, step.id, step.name)}
                  className="d-flex align-items-center justify-content-between gap-2"
                >
                  <span>{step.name}</span>
                  {isCurrent ? (
                    <span className="badge bg-light text-muted">Actual</span>
                  ) : (
                    <ArrowRightCircle size={14} className="text-primary" />
                  )}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="candidate-card-body">
        <div className="candidate-score-container" title={`Puntuación media: ${scoreDisplay} sobre 5`}>
          <StarFill className="candidate-score-star" />
          <span className="candidate-score-value">{scoreDisplay}</span>
          <span className="candidate-score-max">/ 5.0</span>
        </div>
      </div>
    </div>
  );
};
