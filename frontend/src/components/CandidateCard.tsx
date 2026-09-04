import React from 'react';
import ScoreDots from './ScoreDots';
import type { InterviewStep, PositionCandidate } from '../types/position';

type CandidateCardProps = {
  candidate: PositionCandidate;
  steps: InterviewStep[];
  disabled: boolean;
  onMove: (candidate: PositionCandidate, stepId: number, stepName: string) => void;
};

function currentStepId(candidate: PositionCandidate, steps: InterviewStep[]): string {
  const match = steps.find((step) => step.name === candidate.currentInterviewStep);
  return match ? String(match.id) : '';
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  steps,
  disabled,
  onMove,
}) => {
  const selectId = `move-candidate-${candidate.id}`;

  const handleDragStart = (event: React.DragEvent<HTMLElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        candidateId: candidate.id,
        applicationId: candidate.applicationId,
      })
    );
  };

  const handleStageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stepId = parseInt(event.target.value, 10);
    const step = steps.find((item) => item.id === stepId);
    if (!step) {
      return;
    }
    onMove(candidate, step.id, step.name);
  };

  return (
    <article
      className="candidate-card"
      draggable={!disabled}
      onDragStart={handleDragStart}
    >
      <h3 className="candidate-card-name">{candidate.fullName}</h3>
      <ScoreDots score={candidate.averageScore} />
      {steps.length > 0 && (
        <>
          <label htmlFor={selectId} className="visually-hidden">
            Mover a {candidate.fullName} de fase
          </label>
          <select
            id={selectId}
            className="candidate-card-move visually-hidden-focusable"
            value={currentStepId(candidate, steps)}
            disabled={disabled}
            draggable={false}
            onPointerDown={(event) => event.stopPropagation()}
            onChange={handleStageChange}
          >
            {currentStepId(candidate, steps) === '' && (
              <option value="">Seleccionar fase</option>
            )}
            {steps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.name}
              </option>
            ))}
          </select>
        </>
      )}
    </article>
  );
};

export default CandidateCard;
