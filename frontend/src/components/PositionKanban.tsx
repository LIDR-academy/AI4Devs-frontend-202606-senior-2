import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import {
    InterviewStep,
    getCandidatesByPosition,
    getInterviewFlowByPosition,
    updateCandidateStage,
} from '../services/positionService';
import { BoardCandidate } from './PositionKanban.types';
import KanbanColumn from './KanbanColumn';
import './PositionKanban.css';

const ORPHAN_COLUMN_ID = 'orphan';

type Status = 'loading' | 'ready' | 'error';

const PositionKanban: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const [positionName, setPositionName] = useState('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<BoardCandidate[]>([]);
    const [status, setStatus] = useState<Status>('loading');
    const [loadError, setLoadError] = useState<string | null>(null);
    const [savingIds, setSavingIds] = useState<number[]>([]);
    const [moveError, setMoveError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    // Read from the async onDragEnd closure without adding `candidates` to any
    // effect's dependency list.
    const candidatesRef = useRef(candidates);
    useEffect(() => {
        candidatesRef.current = candidates;
    }, [candidates]);

    const isValidId = id !== undefined && !Number.isNaN(Number(id));

    useEffect(() => {
        if (!isValidId) {
            setStatus('error');
            setLoadError('Identificador de posición no válido.');
            return;
        }

        const controller = new AbortController();
        setStatus('loading');
        setLoadError(null);

        Promise.all([
            getInterviewFlowByPosition(id as string, controller.signal),
            getCandidatesByPosition(id as string, controller.signal),
        ])
            .then(([flow, list]) => {
                const stepIdByName = new Map(flow.interviewSteps.map((s) => [s.name, s.id]));
                setPositionName(flow.positionName);
                setSteps(flow.interviewSteps);
                setCandidates(
                    list.map((c) => ({
                        ...c,
                        stepId: stepIdByName.get(c.currentInterviewStep) ?? null,
                    }))
                );
                setStatus('ready');
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                setLoadError(error instanceof Error ? error.message : 'Error al cargar la posición.');
                setStatus('error');
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isValidId, reloadKey]);

    const candidatesByStepId = useMemo(() => {
        const map = new Map<number, BoardCandidate[]>(steps.map((s) => [s.id, []]));
        candidates.forEach((c) => {
            if (c.stepId != null && map.has(c.stepId)) {
                map.get(c.stepId)!.push(c);
            }
        });
        return map;
    }, [steps, candidates]);

    const orphans = useMemo(
        () => candidates.filter((c) => c.stepId == null || !candidatesByStepId.has(c.stepId)),
        [candidates, candidatesByStepId]
    );

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        const toStepId = Number(destination.droppableId);
        if (Number.isNaN(toStepId)) return; // dropped on the read-only orphan column

        const applicationId = Number(draggableId);
        const moved = candidatesRef.current.find((c) => c.applicationId === applicationId);
        if (!moved) return;

        const fromStepId = moved.stepId;
        const toStepName = steps.find((s) => s.id === toStepId)?.name ?? moved.currentInterviewStep;
        const previousStepName = moved.currentInterviewStep;

        setCandidates((cs) =>
            cs.map((c) =>
                c.applicationId === applicationId ? { ...c, stepId: toStepId, currentInterviewStep: toStepName } : c
            )
        );
        setSavingIds((ids) => [...ids, applicationId]);
        setMoveError(null);

        try {
            await updateCandidateStage(moved.id, applicationId, toStepId);
        } catch (error) {
            setCandidates((cs) =>
                cs.map((c) =>
                    c.applicationId === applicationId
                        ? { ...c, stepId: fromStepId, currentInterviewStep: previousStepName }
                        : c
                )
            );
            const message = error instanceof Error ? error.message : 'Error desconocido';
            setMoveError(`No se pudo mover a ${moved.fullName}: ${message}`);
        } finally {
            setSavingIds((ids) => ids.filter((i) => i !== applicationId));
        }
    };

    const header = (
        <div className="d-flex align-items-center gap-2 mb-4">
            <Link to="/positions" className="p-0 text-dark" aria-label="Volver al listado de posiciones">
                <ArrowLeft size={28} />
            </Link>
            <h2 className="fw-bold mb-0">{positionName || 'Posición'}</h2>
        </div>
    );

    if (!isValidId || status === 'error') {
        return (
            <Container fluid className="mt-4 px-4">
                {header}
                <Alert variant="danger">{loadError}</Alert>
                {isValidId && (
                    <Button variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
                        Reintentar
                    </Button>
                )}
            </Container>
        );
    }

    if (status === 'loading') {
        return (
            <Container fluid className="mt-4 px-4">
                {header}
                <div className="text-center py-5">
                    <Spinner animation="border" role="status" aria-label="Cargando" />
                </div>
            </Container>
        );
    }

    const board = (
        <div className="d-flex flex-column flex-lg-row gap-3 overflow-x-auto pb-3">
            {steps.map((step) => (
                <KanbanColumn
                    key={step.id}
                    droppableId={String(step.id)}
                    title={step.name}
                    candidates={candidatesByStepId.get(step.id) ?? []}
                    savingIds={savingIds}
                    isDroppable
                />
            ))}
            {orphans.length > 0 && (
                <KanbanColumn
                    droppableId={ORPHAN_COLUMN_ID}
                    title="Sin fase asignada"
                    candidates={orphans}
                    savingIds={savingIds}
                    isDroppable={false}
                />
            )}
        </div>
    );

    return (
        <Container fluid className="mt-4 px-4">
            {header}
            {moveError && (
                <Alert variant="danger" dismissible onClose={() => setMoveError(null)}>
                    {moveError}
                </Alert>
            )}
            {steps.length === 0 && (
                <Alert variant="warning">Esta posición no tiene fases definidas en su proceso de contratación.</Alert>
            )}
            {steps.length > 0 && candidates.length === 0 && (
                <Alert variant="info">Aún no hay candidatos en esta posición.</Alert>
            )}
            {/*
              Always mounted, even with zero steps: the orphan column (rendered
              whenever there are unmatched candidates, e.g. position 2's flow with
              no steps at all) still renders a <Droppable>, which throws if it's
              not inside a DragDropContext. isDropDisabled/isDragDisabled on the
              columns already prevent unwanted drags when there's nothing to drop into.
            */}
            <DragDropContext onDragEnd={handleDragEnd}>{board}</DragDropContext>
        </Container>
    );
};

export default PositionKanban;
