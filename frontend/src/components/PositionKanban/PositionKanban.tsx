import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Form, InputGroup, Toast, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Search, PeopleFill, CheckCircleFill, ExclamationTriangleFill } from 'react-bootstrap-icons';
import { Candidate, InterviewStep, PositionFlowResponse } from '../../types/position';
import { getInterviewFlow, getCandidatesByPosition, updateCandidateStage } from '../../services/positionService';
import { KanbanColumn } from './KanbanColumn';
import './PositionKanban.css';

const COLUMN_COLORS = [
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316'  // Orange
];

export const PositionKanban: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const positionId = id || '1';

  const [positionData, setPositionData] = useState<PositionFlowResponse | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    variant: 'success' | 'danger' | 'info';
  }>({
    show: false,
    message: '',
    variant: 'success'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [flowResponse, candidatesResponse] = await Promise.all([
        getInterviewFlow(positionId),
        getCandidatesByPosition(positionId)
      ]);
      setPositionData(flowResponse);
      setCandidates(candidatesResponse);
    } catch (err: any) {
      console.error('Error loading position kanban data:', err);
      setError('No se pudo cargar la información de la posición. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sort interview steps by orderIndex
  const sortedSteps: InterviewStep[] = useMemo(() => {
    if (!positionData?.interviewFlow?.interviewSteps) return [];
    return [...positionData.interviewFlow.interviewSteps].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [positionData]);

  // Filter candidates by search query
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const query = searchQuery.toLowerCase().trim();
    return candidates.filter((c) => c.fullName.toLowerCase().includes(query));
  }, [candidates, searchQuery]);

  // Group candidates by step name (case-insensitive)
  const candidatesByStepName = useMemo(() => {
    const map = new Map<string, Candidate[]>();
    sortedSteps.forEach((step) => {
      map.set(step.name.toLowerCase(), []);
    });

    filteredCandidates.forEach((candidate) => {
      const stepKey = (candidate.currentInterviewStep || '').toLowerCase();
      if (map.has(stepKey)) {
        map.get(stepKey)!.push(candidate);
      } else {
        // Fallback for unknown step: place in first step or create bucket
        const firstStepKey = sortedSteps[0]?.name.toLowerCase();
        if (firstStepKey && map.has(firstStepKey)) {
          map.get(firstStepKey)!.push(candidate);
        }
      }
    });

    return map;
  }, [filteredCandidates, sortedSteps]);

  // Move candidate handler
  const handleMoveCandidate = async (
    candidateId: number,
    applicationId: number,
    targetStepId: number,
    targetStepName: string
  ) => {
    const targetCandidate = candidates.find((c) => c.id === candidateId);
    if (!targetCandidate) return;

    if (targetCandidate.currentInterviewStep.toLowerCase() === targetStepName.toLowerCase()) {
      return; // Already in target step
    }

    const previousStepName = targetCandidate.currentInterviewStep;

    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, currentInterviewStep: targetStepName } : c
      )
    );

    setToast({
      show: true,
      message: `Candidato ${targetCandidate.fullName} movido a "${targetStepName}"`,
      variant: 'success'
    });

    try {
      await updateCandidateStage(candidateId, {
        applicationId,
        currentInterviewStep: targetStepId
      });
    } catch (err: any) {
      console.error('Error updating candidate stage:', err);
      // Rollback on error
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, currentInterviewStep: previousStepName } : c
        )
      );
      setToast({
        show: true,
        message: `Error al mover a ${targetCandidate.fullName}. Se ha revertido el cambio.`,
        variant: 'danger'
      });
    }
  };

  const handleDropCandidate = (dragData: any, targetStep: InterviewStep) => {
    if (!dragData || !dragData.id) return;
    handleMoveCandidate(
      Number(dragData.id),
      Number(dragData.applicationId),
      targetStep.id,
      targetStep.name
    );
  };

  const handleMoveStepManual = (
    candidate: Candidate,
    targetStepId: number,
    targetStepName: string
  ) => {
    handleMoveCandidate(
      candidate.id,
      candidate.applicationId,
      targetStepId,
      targetStepName
    );
  };

  const handleCandidateDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    candidate: Candidate
  ) => {
    // Handled in candidate card
  };

  return (
    <div className="position-kanban-container" data-testid="position-kanban-page">
      <Container fluid className="px-lg-4">
        {/* Header Card */}
        <div className="kanban-header-card">
          <div className="kanban-title-row">
            <div className="kanban-title-group">
              <Link
                to="/positions"
                className="kanban-back-btn"
                title="Volver al listado de posiciones"
                aria-label="Volver al listado de posiciones"
                data-testid="back-to-positions-btn"
              >
                <ArrowLeft size={22} />
              </Link>
              <div>
                <h1 className="kanban-title-text" data-testid="position-title">
                  {positionData?.positionName || `Posición #${positionId}`}
                </h1>
                <p className="kanban-meta-text">
                  {positionData?.interviewFlow?.description || 'Proceso de contratación y fases'} •{' '}
                  <span className="fw-semibold text-primary">
                    <PeopleFill className="me-1" />
                    {candidates.length} candidatos en proceso
                  </span>
                </p>
              </div>
            </div>

            {/* Controls / Search Filter */}
            <div className="kanban-controls">
              <InputGroup size="sm" className="kanban-search-input">
                <InputGroup.Text className="bg-white border-end-0">
                  <Search size={14} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar candidato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-start-0 ps-0 shadow-none"
                  aria-label="Buscar candidato por nombre"
                  data-testid="candidate-search-input"
                />
              </InputGroup>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="d-flex align-items-center gap-2 mb-4">
            <ExclamationTriangleFill size={20} />
            <span>{error}</span>
          </Alert>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="kanban-board-wrapper" data-testid="kanban-loading">
            {[1, 2, 3].map((n) => (
              <div key={n} className="kanban-skeleton-column d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
              </div>
            ))}
          </div>
        ) : (
          /* Kanban Board Columns */
          <div className="kanban-board-wrapper" data-testid="kanban-board">
            {sortedSteps.map((step, index) => {
              const stepCandidates = candidatesByStepName.get(step.name.toLowerCase()) || [];
              const columnColor = COLUMN_COLORS[index % COLUMN_COLORS.length];

              return (
                <KanbanColumn
                  key={step.id}
                  step={step}
                  candidates={stepCandidates}
                  allSteps={sortedSteps}
                  color={columnColor}
                  onDropCandidate={handleDropCandidate}
                  onCandidateDragStart={handleCandidateDragStart}
                  onMoveStep={handleMoveStepManual}
                />
              );
            })}
          </div>
        )}
      </Container>

      {/* Toast Notification Container */}
      <div className="kanban-toast-container">
        <Toast
          show={toast.show}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          delay={4000}
          autohide
          bg={toast.variant === 'danger' ? 'danger' : toast.variant === 'info' ? 'info' : 'dark'}
          className="text-white shadow-lg border-0"
        >
          <Toast.Body className="d-flex align-items-center gap-2">
            {toast.variant === 'danger' ? (
              <ExclamationTriangleFill size={18} className="text-warning" />
            ) : (
              <CheckCircleFill size={18} className="text-success" />
            )}
            <span>{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default PositionKanban;
