import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import KanbanColumn from './KanbanColumn';
import { getCandidatesByPosition, getInterviewFlowByPosition, updateCandidateStage } from '../services/positionService';
import { buildKanbanColumns, moveCandidateBetweenColumns } from '../utils/kanban';
import { KanbanColumnData } from '../types/position';
import './Position.css';

interface DragState {
  candidateId: number;
  sourceStepId: number;
}

const Position: React.FC = () => {
  const { id } = useParams<'id'>();
  const navigate = useNavigate();
  const positionId = Number(id);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [positionName, setPositionName] = useState('');
  const [columns, setColumns] = useState<KanbanColumnData[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [stageError, setStageError] = useState('');

  useEffect(() => {
    if (Number.isNaN(positionId)) {
      setLoadError('Identificador de posición inválido.');
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    setLoading(true);
    setLoadError('');

    const loadKanbanData = async () => {
      try {
        const [flowResponse, candidates] = await Promise.all([
          getInterviewFlowByPosition(positionId),
          getCandidatesByPosition(positionId),
        ]);

        if (!isMounted) return;

        const { positionName: name, interviewFlow } = flowResponse.interviewFlow;
        setPositionName(name);
        setColumns(buildKanbanColumns(interviewFlow.interviewSteps, candidates));
      } catch (error) {
        if (!isMounted) return;
        setLoadError('No se pudo cargar el proceso de selección de esta posición.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadKanbanData();

    return () => {
      isMounted = false;
    };
  }, [positionId]);

  const handleBack = useCallback(() => {
    navigate('/positions');
  }, [navigate]);

  const handleDragStartCandidate = useCallback((candidateId: number, sourceStepId: number) => {
    setDragState({ candidateId, sourceStepId });
  }, []);

  const handleDragEndCandidate = useCallback(() => {
    setDragState(null);
  }, []);

  const handleDropCandidate = useCallback(
    (targetStepId: number) => {
      if (!dragState) return;
      const { candidateId, sourceStepId } = dragState;
      setDragState(null);

      // No hacer nada (ni mover, ni llamar al PUT) si se suelta en la misma columna.
      if (sourceStepId === targetStepId) {
        return;
      }

      setStageError('');
      const previousColumns = columns;
      const nextColumns = moveCandidateBetweenColumns(columns, candidateId, targetStepId);
      setColumns(nextColumns);

      const movedCandidate = previousColumns
        .find((column) => column.stepId === sourceStepId)
        ?.candidates.find((candidate) => candidate.id === candidateId);

      if (!movedCandidate) {
        return;
      }

      updateCandidateStage(candidateId, movedCandidate.applicationId, targetStepId).catch(() => {
        setColumns(previousColumns);
        setStageError('No se pudo actualizar la fase del candidato. Se revirtió el cambio.');
      });
    },
    [columns, dragState]
  );

  if (loading) {
    return (
      <Container className="mt-5 text-center" data-testid="position-loading">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Cargando proceso de selección...</p>
      </Container>
    );
  }

  if (loadError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" data-testid="position-load-error">
          {loadError}
        </Alert>
      </Container>
    );
  }

  const totalCandidates = columns.reduce((total, column) => total + column.candidates.length, 0);

  return (
    <Container fluid className="mt-4">
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="link"
          onClick={handleBack}
          aria-label="Volver al listado de posiciones"
          className="p-0 me-3 text-decoration-none"
        >
          <ArrowLeft size={22} /> Volver
        </Button>
        <h2 className="mb-0">{positionName}</h2>
      </div>

      {stageError && (
        <Alert variant="danger" dismissible onClose={() => setStageError('')} data-testid="stage-update-error">
          {stageError}
        </Alert>
      )}

      {totalCandidates === 0 && (
        <Alert variant="info" data-testid="position-empty-state">
          Todavía no hay candidatos en el proceso de esta posición.
        </Alert>
      )}

      <div className="kanban-board">
        {columns.map((column) => (
          <KanbanColumn
            key={column.stepId}
            column={column}
            draggingCandidateId={dragState?.candidateId ?? null}
            onDragStartCandidate={handleDragStartCandidate}
            onDragEndCandidate={handleDragEndCandidate}
            onDropCandidate={handleDropCandidate}
          />
        ))}
      </div>
    </Container>
  );
};

export default Position;
