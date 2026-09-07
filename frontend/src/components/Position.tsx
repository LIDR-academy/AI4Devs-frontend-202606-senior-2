import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Col, Container, Row, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

type InterviewStep = {
    id: number;
    name: string;
    orderIndex: number;
};

type Candidate = {
    id: number;
    applicationId: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
};

const MAX_SCORE_DOTS = 10;

const ScoreDots: React.FC<{ score: number }> = ({ score }) => {
    const dots = Math.max(0, Math.min(MAX_SCORE_DOTS, Math.round(score)));
    return (
        <div>
            {Array.from({ length: dots }, (_, i) => (
                <span
                    key={i}
                    className="d-inline-block rounded-circle bg-success me-1"
                    style={{ width: '0.75rem', height: '0.75rem' }}
                />
            ))}
        </div>
    );
};

const Position: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [positionName, setPositionName] = useState('');
    const [interviewSteps, setInterviewSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [movingCandidateId, setMovingCandidateId] = useState<number | null>(null);
    const [moveError, setMoveError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [flowRes, candidatesRes] = await Promise.all([
                    fetch(`http://localhost:3010/position/${id}/interviewflow`),
                    fetch(`http://localhost:3010/position/${id}/candidates`),
                ]);

                if (!flowRes.ok || !candidatesRes.ok) {
                    throw new Error('Failed to load position data');
                }

                const flowData = await flowRes.json();
                const candidatesData = await candidatesRes.json();

                if (cancelled) return;

                setPositionName(flowData.interviewFlow.positionName);
                setInterviewSteps(
                    [...flowData.interviewFlow.interviewFlow.interviewSteps].sort(
                        (a: InterviewStep, b: InterviewStep) => a.orderIndex - b.orderIndex,
                    ),
                );
                setCandidates(candidatesData);
            } catch (err) {
                if (!cancelled) setError('No se pudo cargar el proceso de esta posición.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const moveCandidate = async (candidate: Candidate, targetStep: InterviewStep) => {
        if (candidate.currentInterviewStep === targetStep.name) return;

        setMovingCandidateId(candidate.id);
        setMoveError(null);
        try {
            const res = await fetch(`http://localhost:3010/candidates/${candidate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: candidate.applicationId,
                    currentInterviewStep: targetStep.id,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update candidate stage');
            }

            setCandidates((prev) =>
                prev.map((c) => (c.id === candidate.id ? { ...c, currentInterviewStep: targetStep.name } : c)),
            );
        } catch (err) {
            setMoveError('No se pudo mover al candidato a la nueva fase.');
        } finally {
            setMovingCandidateId(null);
        }
    };

    const handleDragStart = (candidate: Candidate) => (event: React.DragEvent) => {
        event.dataTransfer.setData('text/plain', String(candidate.id));
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const handleDrop = (targetStep: InterviewStep) => (event: React.DragEvent) => {
        event.preventDefault();
        const candidateId = Number(event.dataTransfer.getData('text/plain'));
        const candidate = candidates.find((c) => c.id === candidateId);
        if (candidate) {
            moveCandidate(candidate, targetStep);
        }
    };

    return (
        <Container className="mt-5">
            <div className="d-flex align-items-center mb-4">
                <Link to="/positions" className="me-3 text-dark" aria-label="Volver a posiciones">
                    <ArrowLeft size={24} />
                </Link>
                <h2 className="mb-0 fw-bold">{positionName}</h2>
            </div>

            {loading && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {moveError && (
                <Alert variant="danger" dismissible onClose={() => setMoveError(null)}>
                    {moveError}
                </Alert>
            )}

            {!loading && !error && (
                <Row>
                    {interviewSteps.map((step) => (
                        <Col xs={12} md key={step.id} className="mb-4">
                            <div
                                className="bg-light rounded p-3 h-100"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop(step)}
                            >
                                <h5 className="fw-bold">{step.name}</h5>
                                {candidates
                                    .filter((candidate) => candidate.currentInterviewStep === step.name)
                                    .map((candidate) => (
                                        <Card
                                            key={candidate.id}
                                            className="shadow-sm border-0 mb-3"
                                            draggable={movingCandidateId !== candidate.id}
                                            onDragStart={handleDragStart(candidate)}
                                            style={{ opacity: movingCandidateId === candidate.id ? 0.5 : 1 }}
                                        >
                                            <Card.Body>
                                                <Card.Title as="p" className="fw-bold mb-2">
                                                    {candidate.fullName}
                                                </Card.Title>
                                                <ScoreDots score={candidate.averageScore} />
                                            </Card.Body>
                                        </Card>
                                    ))}
                            </div>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Position;
