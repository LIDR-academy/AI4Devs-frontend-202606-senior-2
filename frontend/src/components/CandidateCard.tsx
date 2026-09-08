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
                        <Badge bg={averageScore >= 4 ? 'success' : averageScore >= 3 ? 'warning' : 'danger'}>
                            {averageScore.toFixed(1)}/5
                        </Badge>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default CandidateCard;