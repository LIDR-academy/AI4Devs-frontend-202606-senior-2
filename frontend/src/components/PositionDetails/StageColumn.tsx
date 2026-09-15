import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import CandidateCard from './CandidateCard';
import type { InterviewStep } from '../../services/positionService';
import type { BoardCandidate } from '../../utils/kanban';

type StageColumnProps = {
    step: InterviewStep;
    candidates: BoardCandidate[];
};

const StageColumn: React.FC<StageColumnProps> = ({ step, candidates }) => {
    const titleId = `stage-${step.id}-title`;

    return (
        <section className="stage-column" aria-labelledby={titleId}>
            <h3 id={titleId} className="stage-column-title">
                {step.name}
            </h3>
            <Droppable droppableId={String(step.id)}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`stage-column-list${snapshot.isDraggingOver ? ' is-over' : ''}`}
                    >
                        {candidates.map((candidate, index) => (
                            <CandidateCard key={candidate.applicationId} candidate={candidate} index={index} />
                        ))}
                        {provided.placeholder}
                        {candidates.length === 0 && !snapshot.isDraggingOver && (
                            <p className="stage-column-empty">Sin candidatos</p>
                        )}
                    </div>
                )}
            </Droppable>
        </section>
    );
};

export default StageColumn;
