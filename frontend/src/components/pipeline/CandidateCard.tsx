import React from 'react';
import { Card } from 'react-bootstrap';
import CandidateScore from './CandidateScore';
import { PipelineCandidate } from '../../types/pipeline';

/**
 * One candidate on the board: their full name and their average score.
 *
 * Presentational and stateless — the column it lands in is decided upstream by
 * `buildPipelineColumns`.
 *
 * This is also the draggable element: it forwards its ref and spreads any extra props
 * onto its root, so `PipelineBoard` hands it `provided.innerRef`, `provided.draggableProps`
 * and `provided.dragHandleProps` directly. The candidate and application ids a stage
 * update needs are on the element as data attributes.
 */

export interface CandidateCardProps extends React.HTMLAttributes<HTMLElement> {
    candidate: PipelineCandidate;
}

const CandidateCard = React.forwardRef<HTMLElement, CandidateCardProps>(
    ({ candidate, className, ...rest }, ref) => (
        <Card
            as="article"
            ref={ref}
            aria-label={candidate.fullName}
            data-testid="candidate-card"
            data-candidate-id={candidate.id}
            data-application-id={candidate.applicationId}
            className={['candidate-card', 'shadow-sm', className].filter(Boolean).join(' ')}
            {...rest}
        >
            <Card.Body className="p-2">
                <div className="candidate-card__name fw-semibold">{candidate.fullName}</div>
                <CandidateScore score={candidate.averageScore} />
            </Card.Body>
        </Card>
    ),
);

CandidateCard.displayName = 'CandidateCard';

export default CandidateCard;
