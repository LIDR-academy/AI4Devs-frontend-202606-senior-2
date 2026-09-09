import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { DropResult } from '@hello-pangea/dnd';
import { getInterviewFlow, getCandidatesByPosition, InterviewStep, Candidate } from '../services/positionService';
import { updateCandidateStage } from '../services/candidateService';
import './PositionKanbanDetail.css';
import { KanbanBoard } from './kanban/KanbanBoard';
import { CandidateSearch } from './kanban/CandidateSearch';
import { MoveStatus } from './kanban/MoveStatus';

type RequestStatus = 'loading' | 'error' | 'loaded';
type ColumnsState = Record<number, Candidate[]>;

export const defaultKanbanServices = { getInterviewFlow, getCandidatesByPosition, updateCandidateStage };
export type KanbanServices = typeof defaultKanbanServices;

const PositionKanbanDetail: React.FC<{ services?: KanbanServices }> = ({ services = defaultKanbanServices }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [positionName, setPositionName] = useState('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [rawCandidates, setRawCandidates] = useState<Candidate[]>([]);
    const [columns, setColumns] = useState<ColumnsState>({});
    const [flowStatus, setFlowStatus] = useState<RequestStatus>('loading');
    const [candidatesStatus, setCandidatesStatus] = useState<RequestStatus>('loading');
    const savingRef = useRef(false);
    const [isSaving, setIsSaving] = useState(false);
    const [query, setQuery] = useState('');
    const [dragError, setDragError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        services.getInterviewFlow(id)
            .then(({ positionName: name, interviewSteps }) => {
                setPositionName(name);
                setSteps(interviewSteps);
                setFlowStatus('loaded');
            })
            .catch(() => setFlowStatus('error'));

        services.getCandidatesByPosition(id)
            .then((candidates) => {
                setRawCandidates(candidates);
                setCandidatesStatus('loaded');
            })
            .catch(() => setCandidatesStatus('error'));
    }, [id, services]);

    useEffect(() => {
        if (flowStatus !== 'loaded') return;

        const nameToStepId = new Map(steps.map((step) => [step.name, step.id]));
        const grouped: ColumnsState = {};
        steps.forEach((step) => {
            grouped[step.id] = [];
        });

        rawCandidates.forEach((candidate) => {
            let stepId = nameToStepId.get(candidate.currentInterviewStep);
            if (stepId === undefined) {
                console.warn(
                    `No se encontró la fase "${candidate.currentInterviewStep}" para el candidato ${candidate.id}; se ubicará en la primera columna.`
                );
                stepId = steps[0]?.id;
            }
            if (stepId !== undefined) {
                grouped[stepId] = [...(grouped[stepId] ?? []), candidate];
            }
        });

        setColumns(grouped);
    }, [flowStatus, steps, rawCandidates]);

    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    const normalizedQuery = normalize(query);
    const visibleColumns: ColumnsState = Object.fromEntries(
        Object.entries(columns).map(([step, candidates]) => [step,
            candidates.filter(candidate => normalize(candidate.fullName).includes(normalizedQuery))])
    );
    const totalCount = Object.values(columns).reduce((count, candidates) => count + candidates.length, 0);
    const visibleCount = Object.values(visibleColumns).reduce((count, candidates) => count + candidates.length, 0);

    const handleDragEnd = useCallback(
        (result: DropResult) => {
            if (savingRef.current) return;
            const { source, destination } = result;
            if (!destination) return;
            if (destination.droppableId === source.droppableId) return;

            const sourceStepId = Number(source.droppableId);
            const destStepId = Number(destination.droppableId);

            const visibleCandidate = visibleColumns[sourceStepId]?.[source.index];
            if (!visibleCandidate || (result.draggableId && result.draggableId !== `candidate-${visibleCandidate.applicationId}`)) return;
            const sourceList = [...(columns[sourceStepId] ?? [])];
            const sourceIndex = sourceList.findIndex(candidate => candidate.applicationId === visibleCandidate.applicationId);
            if (sourceIndex < 0 || !steps.some(step => step.id === destStepId)) return;
            const [movedCandidate] = sourceList.splice(sourceIndex, 1);
            if (!movedCandidate) return;

            const destList = [...(columns[destStepId] ?? [])];
            const anchor = visibleColumns[destStepId]?.[destination.index];
            const anchorIndex = anchor ? destList.findIndex(candidate => candidate.applicationId === anchor.applicationId) : -1;
            destList.splice(anchorIndex < 0 ? destList.length : anchorIndex, 0, movedCandidate);

            savingRef.current = true;
            setIsSaving(true);
            const previousColumns = columns;
            setColumns({
                ...columns,
                [sourceStepId]: sourceList,
                [destStepId]: destList,
            });
            setDragError(null);

            services.updateCandidateStage(movedCandidate.id, movedCandidate.applicationId, destStepId).catch(() => {
                setColumns(previousColumns);
                setDragError('No se pudo actualizar la fase del candidato. Inténtalo nuevamente.');
            }).finally(() => {
                savingRef.current = false;
                setIsSaving(false);
            });
        },
        [columns, visibleColumns, services, steps]
    );

    if (flowStatus === 'loading' || candidatesStatus === 'loading') {
        return (
            <Container className="mt-5 text-center kanban-session">
                <Spinner animation="border" role="status" aria-label="Cargando candidatos" />
            </Container>
        );
    }

    if (flowStatus === 'error') {
        return (
            <Container className="mt-5 kanban-session">
                <Alert variant="danger">No se pudo cargar el proceso de esta posición.</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5 kanban-session">
            <div className="d-flex align-items-center mb-4">
                <Button
                    variant="link"
                    className="p-0 me-2"
                    aria-label="Volver a posiciones"
                    onClick={() => navigate('/positions')}
                >
                    <ArrowLeft size={24} />
                </Button>
                <h2 className="mb-0">{positionName}</h2>
            </div>

            {candidatesStatus === 'error' && (
                <Alert variant="danger">No se pudieron cargar los candidatos de esta posición.</Alert>
            )}
            {dragError && (
                <Alert variant="danger" dismissible onClose={() => setDragError(null)}>
                    {dragError}
                </Alert>
            )}

            {candidatesStatus === 'loaded' && <>
                <CandidateSearch query={query} visibleCount={visibleCount} totalCount={totalCount}
                    disabled={isSaving} onQueryChange={value => { if (!savingRef.current) setQuery(value); }} />
                {totalCount === 0 ? <p>Esta posición todavía no tiene candidatos.</p>
                    : visibleCount === 0 && <p>No hay candidatos que coincidan con la búsqueda.</p>}
            </>}
            <MoveStatus pending={isSaving} />
            <KanbanBoard steps={steps} columns={visibleColumns} disabled={isSaving} onDragEnd={handleDragEnd} />
        </Container>
    );
};

export default PositionKanbanDetail;
