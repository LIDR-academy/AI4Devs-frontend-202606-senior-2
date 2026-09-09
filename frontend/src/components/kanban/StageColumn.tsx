import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { InterviewStep, CandidateCard as CandidateCardModel } from '../../types/position';
import CandidateCard from './CandidateCard';

interface StageColumnProps {
  step: InterviewStep;
  candidates: CandidateCardModel[];
}

const StageColumn: React.FC<StageColumnProps> = ({ step, candidates }) => {
  return (
    <div className="kanban-column" data-testid={`kanban-column-${step.id}`}>
      <div className="kanban-column-header">
        <h6 className="mb-0">{step.name}</h6>
        <span className="badge bg-secondary">{candidates.length}</span>
      </div>
      <Droppable droppableId={String(step.id)}>
        {(provided, snapshot) => (
          <div
            className={`kanban-column-body ${snapshot.isDraggingOver ? 'kanban-column-body-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {candidates.map((candidate, index) => (
              <CandidateCard key={candidate.applicationId} candidate={candidate} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default StageColumn;
