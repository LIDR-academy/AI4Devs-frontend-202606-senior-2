// Lógica pura de construcción/actualización del tablero Kanban, separada de la
// presentación para poder testearla sin renderizar componentes.
import { CandidateSummary, InterviewStep, KanbanColumnData } from '../types/position';

// Columna de respaldo para candidatos cuyo `currentInterviewStep` (nombre) no
// coincide con ninguna fase del interviewflow. Es un caso defensivo: con datos
// consistentes no debería ocurrir, pero evita que un dato inesperado rompa la UI.
export const UNASSIGNED_STEP_ID = -1;
export const UNASSIGNED_STEP_NAME = 'Sin fase asignada';

/**
 * Construye las columnas del Kanban a partir de las fases del interviewflow
 * (fuente de verdad para número/orden/nombre de columnas) y la lista de
 * candidatos de la posición, ubicando cada candidato en la columna cuyo
 * nombre coincide con su `currentInterviewStep`.
 */
export const buildKanbanColumns = (
  steps: InterviewStep[],
  candidates: CandidateSummary[]
): KanbanColumnData[] => {
  const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);

  const columns: KanbanColumnData[] = sortedSteps.map((step) => ({
    stepId: step.id,
    name: step.name,
    orderIndex: step.orderIndex,
    candidates: [],
  }));

  const unassignedCandidates: CandidateSummary[] = [];

  candidates.forEach((candidate) => {
    const column = columns.find((col) => col.name === candidate.currentInterviewStep);
    if (column) {
      column.candidates.push(candidate);
    } else {
      unassignedCandidates.push(candidate);
    }
  });

  if (unassignedCandidates.length > 0) {
    columns.push({
      stepId: UNASSIGNED_STEP_ID,
      name: UNASSIGNED_STEP_NAME,
      orderIndex: Number.MAX_SAFE_INTEGER,
      candidates: unassignedCandidates,
    });
  }

  return columns;
};

/**
 * Mueve un candidato de su columna actual a `targetStepId`, devolviendo un
 * nuevo array de columnas (no muta el original). Si el candidato no se
 * encuentra, devuelve las columnas sin cambios.
 */
export const moveCandidateBetweenColumns = (
  columns: KanbanColumnData[],
  candidateId: number,
  targetStepId: number
): KanbanColumnData[] => {
  let movedCandidate: CandidateSummary | undefined;

  const columnsWithoutCandidate = columns.map((column) => {
    const remainingCandidates = column.candidates.filter((candidate) => {
      const isMovedCandidate = candidate.id === candidateId;
      if (isMovedCandidate) {
        movedCandidate = candidate;
      }
      return !isMovedCandidate;
    });
    return { ...column, candidates: remainingCandidates };
  });

  if (!movedCandidate) {
    return columns;
  }

  const candidateToInsert = movedCandidate;

  return columnsWithoutCandidate.map((column) => {
    if (column.stepId !== targetStepId) {
      return column;
    }
    return {
      ...column,
      candidates: [...column.candidates, { ...candidateToInsert, currentInterviewStep: column.name }],
    };
  });
};
