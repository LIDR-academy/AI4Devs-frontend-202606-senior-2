import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Link, useParams } from 'react-router-dom';
import {
    Candidate,
    InterviewStep,
    getCandidates,
    getInterviewFlow,
    updateCandidateStage,
} from '../services/positionService';

const scoreVariant = (score: number) => (score >= 4 ? 'success' : score >= 2 ? 'warning' : 'secondary');

const CandidateCard: React.FC<{
    candidate: Candidate;
    steps: InterviewStep[];
    onMove: (candidate: Candidate, step: InterviewStep) => void;
}> = ({ candidate, steps, onMove }) => (
    <Card
        className="mb-2 shadow-sm"
        draggable
        style={{ cursor: 'grab' }}
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
            // Safari/Firefox no inician el arrastre sin payload.
            e.dataTransfer.setData('text/plain', String(candidate.applicationId));
            e.dataTransfer.effectAllowed = 'move';
        }}
    >
        <Card.Body className="p-2">
            <div className="d-flex justify-content-between align-items-start gap-2">
                <span className="fw-medium">{candidate.fullName}</span>
                <Badge bg={scoreVariant(candidate.averageScore)}>
                    {Math.round(candidate.averageScore * 10) / 10}
                </Badge>
            </div>
            {/* Alternativa accesible / táctil al drag & drop */}
            <Form.Select
                size="sm"
                className="mt-2"
                aria-label={`Fase de ${candidate.fullName}`}
                value={candidate.currentInterviewStep}
                onChange={(e) => {
                    const step = steps.find((s) => s.name === e.target.value);
                    if (step) onMove(candidate, step);
                }}
            >
                {steps.map((s) => (
                    <option key={s.id} value={s.name}>
                        {s.name}
                    </option>
                ))}
            </Form.Select>
        </Card.Body>
    </Card>
);

const PositionDetail: React.FC = () => {
    const { id = '' } = useParams<{ id: string }>();
    const [positionName, setPositionName] = useState('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;
        Promise.all([getInterviewFlow(id), getCandidates(id)])
            .then(([flow, list]) => {
                if (!alive) return;
                setPositionName(flow.positionName);
                setSteps(flow.steps);
                setCandidates(list);
            })
            .catch((e: Error) => alive && setError(`No se pudo cargar la posición: ${e.message}`))
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        };
    }, [id]);

    const move = useCallback((candidate: Candidate, step: InterviewStep) => {
        if (candidate.currentInterviewStep === step.name) return;
        const previous = candidate.currentInterviewStep;
        // Optimista: la tarjeta guarda el NOMBRE de la fase, la API espera el ID.
        setCandidates((cs) =>
            cs.map((c) =>
                c.applicationId === candidate.applicationId ? { ...c, currentInterviewStep: step.name } : c,
            ),
        );
        updateCandidateStage(candidate.id, candidate.applicationId, step.id).catch((e: Error) => {
            setCandidates((cs) =>
                cs.map((c) =>
                    c.applicationId === candidate.applicationId ? { ...c, currentInterviewStep: previous } : c,
                ),
            );
            setError(`No se pudo mover a ${candidate.fullName}: ${e.message}`);
        });
    }, []);

    const drop = (step: InterviewStep) => (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const applicationId = Number(e.dataTransfer.getData('text/plain'));
        const candidate = candidates.find((c) => c.applicationId === applicationId);
        if (candidate) move(candidate, step);
    };

    // ponytail: sin esto, un candidato cuya fase no esta en el flujo desaparece sin rastro
    const huerfanos = candidates.filter((c) => !steps.some((s) => s.name === c.currentInterviewStep));

    if (loading)
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" />
            </Container>
        );

    return (
        <Container fluid className="mt-4 mb-5 px-4">
            <div className="d-flex align-items-center gap-2 mb-4">
                <Link to="/positions" className="text-dark" aria-label="Volver al listado de posiciones">
                    <ArrowLeft size={28} />
                </Link>
                <h2 className="mb-0">{positionName}</h2>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {steps.length === 0 && <Alert variant="warning">Este proceso no tiene fases definidas.</Alert>}
            {huerfanos.length > 0 && (
                <Alert variant="warning">
                    Fuera del proceso:{' '}
                    {huerfanos.map((c) => `${c.fullName} (${c.currentInterviewStep})`).join(', ')}
                </Alert>
            )}

            {/* Una columna por fase; en móvil se apilan a ancho completo */}
            <Row className="g-3">
                {steps.map((step) => (
                    <Col key={step.id} xs={12} md>
                        <div
                            className="bg-light rounded p-2 h-100"
                            onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                            onDrop={drop(step)}
                        >
                            <h6 className="text-center text-uppercase text-muted py-2">{step.name}</h6>
                            {candidates
                                .filter((c) => c.currentInterviewStep === step.name)
                                .map((c) => (
                                    <CandidateCard key={c.applicationId} candidate={c} steps={steps} onMove={move} />
                                ))}
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default PositionDetail;
