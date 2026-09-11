import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    TouchSensor,
    closestCorners,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { ArrowLeft, Diagram3 } from 'react-bootstrap-icons';
import {
    getCandidatesByPosition,
    getInterviewFlow,
    updateCandidateStage,
} from '../../services/positionService';
import { CandidateCard, InterviewStep } from '../../types/position';
import KanbanColumn from './KanbanColumn';
import './PositionDetails.css';

const PositionDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const [positionName, setPositionName] = useState<string>('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<CandidateCard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Sensores: puntero (desktop) y táctil (móvil). Una pequeña distancia/retardo
    // de activación evita que un click normal se interprete como arrastre.
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 150, tolerance: 5 },
        }),
    );

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [flow, rawCandidates] = await Promise.all([
                    getInterviewFlow(id),
                    getCandidatesByPosition(id),
                ]);
                if (cancelled) return;

                setPositionName(flow.positionName);
                setSteps(flow.steps);

                // Resolver la fase (nombre) de cada candidato a su id de step.
                const nameToStepId = new Map(
                    flow.steps.map((s) => [s.name, s.id]),
                );
                setCandidates(
                    rawCandidates.map((c) => ({
                        applicationId: c.applicationId,
                        candidateId: c.id,
                        fullName: c.fullName,
                        averageScore: c.averageScore,
                        currentStepId:
                            nameToStepId.get(c.currentInterviewStep) ?? null,
                    })),
                );
            } catch (e) {
                if (!cancelled) {
                    setError(
                        'No se pudo cargar la posición. Verifica que el backend esté disponible.',
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const candidatesByStep = useMemo(() => {
        const grouped = new Map<number, CandidateCard[]>();
        steps.forEach((s) => grouped.set(s.id, []));
        candidates.forEach((c) => {
            if (c.currentStepId != null && grouped.has(c.currentStepId)) {
                grouped.get(c.currentStepId)!.push(c);
            }
        });
        return grouped;
    }, [steps, candidates]);

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over) return;

            const applicationId = Number(active.id);
            const targetStepId = Number(over.id);

            const candidate = candidates.find(
                (c) => c.applicationId === applicationId,
            );
            if (!candidate || candidate.currentStepId === targetStepId) return;

            const previousStepId = candidate.currentStepId;

            // Actualización optimista.
            setCandidates((prev) =>
                prev.map((c) =>
                    c.applicationId === applicationId
                        ? { ...c, currentStepId: targetStepId }
                        : c,
                ),
            );

            try {
                await updateCandidateStage(
                    candidate.candidateId,
                    candidate.applicationId,
                    targetStepId,
                );
            } catch (e) {
                // Revertir si el backend falla.
                setCandidates((prev) =>
                    prev.map((c) =>
                        c.applicationId === applicationId
                            ? { ...c, currentStepId: previousStepId }
                            : c,
                    ),
                );
                setError(
                    `No se pudo actualizar la fase de ${candidate.fullName}. Inténtalo de nuevo.`,
                );
            }
        },
        [candidates],
    );

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status" />
                <p className="mt-2">Cargando posición…</p>
            </Container>
        );
    }

    return (
        <Container fluid className="position-details mt-4 mb-5 px-4">
            <div className="position-header d-flex align-items-center mb-4">
                <Link
                    to="/positions"
                    className="back-link me-3"
                    aria-label="Volver al listado de posiciones"
                >
                    <ArrowLeft size={28} />
                </Link>
                <h2 className="m-0">{positionName || 'Posición'}</h2>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            {steps.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                >
                    <div className="kanban-board">
                        {steps.map((step) => (
                            <KanbanColumn
                                key={step.id}
                                step={step}
                                candidates={candidatesByStep.get(step.id) ?? []}
                            />
                        ))}
                    </div>
                </DndContext>
            ) : (
                // Estado vacío solo cuando la posición existe pero no tiene fases.
                // Si la carga falló (p. ej. 404), se muestra únicamente el Alert de error.
                !error && (
                    <div className="kanban-empty-state text-center text-muted">
                        <Diagram3 size={48} className="mb-3" />
                        <h5 className="mb-1">
                            Esta posición no tiene fases configuradas
                        </h5>
                        <p className="mb-0">
                            No hay un flujo de entrevistas definido, por lo que aún
                            no se puede mostrar el tablero de candidatos.
                        </p>
                    </div>
                )
            )}
        </Container>
    );
};

export default PositionDetails;
