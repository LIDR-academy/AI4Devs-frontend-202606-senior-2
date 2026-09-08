import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type CandidateCardProps = {
    id: number;
    fullName: string;
    averageScore: number;
    columnId?: string;
};

const getScoreBadgeColor = (score: number) => {
    if (score >= 4) {
        return <Badge bg="success">{score.toFixed(1)}/5</Badge>;
    }
    if (score >= 3) {
        return <Badge bg="warning">{score.toFixed(1)}/5</Badge>;
    }
    return <Badge bg="danger">{score.toFixed(1)}/5</Badge>;
};

const CandidateCard: React.FC<CandidateCardProps> = ({ id, fullName, averageScore, columnId }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        data: { columnId }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        touchAction: 'none',
    };

    return (
        <Card 
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="shadow-sm border-primary"
        >
            <Card.Body className="p-3">
                <Row className="align-items-center">
                    <Col xs={9}>
                        <h6 className="mb-1">{fullName}</h6>
                    </Col>
                    <Col xs={3} className="text-end">
                        {getScoreBadgeColor(averageScore)}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default CandidateCard;