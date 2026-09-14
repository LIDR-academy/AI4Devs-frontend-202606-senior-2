import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

type InterviewStep = {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
};

type CandidateCard = {
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
    id: number;
    applicationId: number;
};

type Column = {
    key: string;
    name: string;
    candidates: CandidateCard[];
};

const UNMATCHED_COLUMN_KEY = '__unmatched__';

const mockInterviewFlowData = {
    positionName: 'Senior backend engineer',
    interviewFlow: {
        id: 1,
        description: 'Standard development interview process',
        interviewSteps: [
            {
                id: 1,
                interviewFlowId: 1,
                interviewTypeId: 1,
                name: 'Initial Screening',
                orderIndex: 1
            },
            {
                id: 2,
                interviewFlowId: 1,
                interviewTypeId: 2,
                name: 'Technical Interview',
                orderIndex: 2
            },
            {
                id: 3,
                interviewFlowId: 1,
                interviewTypeId: 3,
                name: 'Manager Interview',
                orderIndex: 2
            }
        ]
    }
};

const mockCandidates: CandidateCard[] = [
    { fullName: 'Jane Smith', currentInterviewStep: 'Initial Screening', averageScore: 4, id: 1, applicationId: 1 },
    { fullName: 'John Doe', currentInterviewStep: 'Technical Interview', averageScore: 3.5, id: 2, applicationId: 2 },
    { fullName: 'Alex Jones', currentInterviewStep: 'Manager Interview', averageScore: 4.5, id: 3, applicationId: 3 }
];

const PositionKanban: React.FC = () => {
    const navigate = useNavigate();
    const [positionName, setPositionName] = useState('');
    const [columns, setColumns] = useState<Column[]>([]);

    useEffect(() => {
        const steps: InterviewStep[] = mockInterviewFlowData.interviewFlow.interviewSteps;
        const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);

        const builtColumns: Column[] = sortedSteps.map((step) => ({
            key: String(step.id),
            name: step.name,
            candidates: mockCandidates.filter((c) => c.currentInterviewStep === step.name)
        }));

        const unmatched = mockCandidates.filter(
            (c) => !sortedSteps.some((step) => step.name === c.currentInterviewStep)
        );
        if (unmatched.length > 0) {
            builtColumns.push({ key: UNMATCHED_COLUMN_KEY, name: 'Unmatched', candidates: unmatched });
        }

        setPositionName(mockInterviewFlowData.positionName);
        setColumns(builtColumns);
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLElement>, applicationId: number) => {
        e.dataTransfer.setData('applicationId', String(applicationId));
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>, targetColumnKey: string) => {
        e.preventDefault();
        const applicationId = Number(e.dataTransfer.getData('applicationId'));

        setColumns((prevColumns) => {
            let movedCandidate: CandidateCard | undefined;
            const withoutCandidate = prevColumns.map((column) => {
                const remaining = column.candidates.filter((c) => {
                    if (c.applicationId === applicationId) {
                        movedCandidate = c;
                        return false;
                    }
                    return true;
                });
                return { ...column, candidates: remaining };
            });

            if (!movedCandidate) {
                return prevColumns;
            }

            return withoutCandidate.map((column) =>
                column.key === targetColumnKey
                    ? { ...column, candidates: [...column.candidates, movedCandidate as CandidateCard] }
                    : column
            );
        });
    };

    return (
        <Container className="mt-5">
            <Row className="align-items-center mb-4">
                <Col xs="auto">
                    <Button variant="link" className="p-0" onClick={() => navigate('/positions')} aria-label="Volver a posiciones">
                        <ArrowLeft size={24} />
                    </Button>
                </Col>
                <Col>
                    <h2 className="mb-0">{positionName}</h2>
                </Col>
            </Row>
            <Row className="flex-md-nowrap overflow-auto">
                {columns.map((column) => (
                    <Col
                        xs={12}
                        md={3}
                        key={column.key}
                        className="mb-4"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, column.key)}
                    >
                        <Card>
                            <Card.Header>{column.name}</Card.Header>
                            <Card.Body className="d-flex flex-column gap-2">
                                {column.candidates.map((candidate) => (
                                    <Card
                                        key={candidate.applicationId}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, candidate.applicationId)}
                                        className="shadow-sm"
                                        style={{ cursor: 'grab' }}
                                    >
                                        <Card.Body className="p-2">
                                            <div>{candidate.fullName}</div>
                                            <small className="text-muted">Score: {candidate.averageScore}</small>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default PositionKanban;
