import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import ScoreDots from './ScoreDots';
import type { BoardCandidate } from '../../utils/kanban';

type CandidateCardProps = {
    candidate: BoardCandidate;
    index: number;
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, index }) => (
    <Draggable draggableId={String(candidate.applicationId)} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`candidate-card${snapshot.isDragging ? ' is-dragging' : ''}`}
                data-testid="candidate-card"
            >
                <div className="candidate-name">{candidate.fullName}</div>
                <ScoreDots score={candidate.averageScore} />
            </div>
        )}
    </Draggable>
);

export default CandidateCard;
