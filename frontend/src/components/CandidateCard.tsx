import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Spinner } from 'react-bootstrap';
import ScoreDots from './ScoreDots';
import { BoardCandidate } from './PositionKanban.types';

interface CandidateCardProps {
    candidate: BoardCandidate;
    index: number;
    isSaving: boolean;
}

// Plain div instead of react-bootstrap's <Card> so there's no doubt about how
// {...provided.draggableProps} (which includes its own `style`) gets applied.
const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, index, isSaving }) => {
    return (
        <Draggable draggableId={String(candidate.applicationId)} index={index} isDragDisabled={isSaving}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`card mb-2 shadow-sm ${snapshot.isDragging ? 'border-primary' : ''} ${isSaving ? 'opacity-50' : ''}`}
                    style={provided.draggableProps.style}
                >
                    <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                        <div>
                            <div className="fw-medium">{candidate.fullName}</div>
                            <ScoreDots score={candidate.averageScore} />
                        </div>
                        {isSaving && <Spinner animation="border" size="sm" role="status" aria-label="Guardando" />}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default CandidateCard;
