import { buildKanbanColumns, moveCandidateBetweenColumns, UNASSIGNED_STEP_ID, UNASSIGNED_STEP_NAME } from './kanban';
import { CandidateSummary, InterviewStep } from '../types/position';

const steps: InterviewStep[] = [
  { id: 10, interviewFlowId: 1, interviewTypeId: 1, name: 'Phase 1', orderIndex: 1 },
  { id: 20, interviewFlowId: 1, interviewTypeId: 2, name: 'Phase 2', orderIndex: 2 },
  { id: 30, interviewFlowId: 1, interviewTypeId: 3, name: 'Phase 3', orderIndex: 3 },
];

const candidate = (overrides: Partial<CandidateSummary>): CandidateSummary => ({
  id: 1,
  applicationId: 100,
  fullName: 'Jane Doe',
  currentInterviewStep: 'Phase 1',
  averageScore: 0,
  ...overrides,
});

describe('buildKanbanColumns', () => {
  it('genera una columna por cada fase recibida', () => {
    const columns = buildKanbanColumns(steps, []);
    expect(columns).toHaveLength(3);
  });

  it('respeta el orden recibido por el backend (orderIndex), incluso si llega desordenado', () => {
    const shuffledSteps = [steps[2], steps[0], steps[1]];
    const columns = buildKanbanColumns(shuffledSteps, []);
    expect(columns.map((col) => col.name)).toEqual(['Phase 1', 'Phase 2', 'Phase 3']);
  });

  it('funciona con diferente cantidad de fases (1 fase)', () => {
    const columns = buildKanbanColumns([steps[0]], []);
    expect(columns).toHaveLength(1);
    expect(columns[0].name).toBe('Phase 1');
  });

  it('funciona con diferente cantidad de fases (0 fases)', () => {
    const columns = buildKanbanColumns([], []);
    expect(columns).toHaveLength(0);
  });

  it('una fase sin candidatos se sigue generando, vacía', () => {
    const columns = buildKanbanColumns(steps, []);
    columns.forEach((column) => {
      expect(column.candidates).toEqual([]);
    });
  });

  it('ubica cada candidato en la columna correspondiente a su fase actual', () => {
    const candidates = [
      candidate({ id: 1, currentInterviewStep: 'Phase 1' }),
      candidate({ id: 2, currentInterviewStep: 'Phase 3' }),
    ];
    const columns = buildKanbanColumns(steps, candidates);

    expect(columns.find((c) => c.name === 'Phase 1')?.candidates).toHaveLength(1);
    expect(columns.find((c) => c.name === 'Phase 2')?.candidates).toHaveLength(0);
    expect(columns.find((c) => c.name === 'Phase 3')?.candidates).toHaveLength(1);
  });

  it('permite múltiples candidatos en la misma fase', () => {
    const candidates = [
      candidate({ id: 1, currentInterviewStep: 'Phase 2' }),
      candidate({ id: 2, currentInterviewStep: 'Phase 2' }),
      candidate({ id: 3, currentInterviewStep: 'Phase 2' }),
    ];
    const columns = buildKanbanColumns(steps, candidates);
    expect(columns.find((c) => c.name === 'Phase 2')?.candidates).toHaveLength(3);
  });

  it('un candidato cuya fase no coincide con ninguna columna conocida no rompe el build y se agrupa en una columna de respaldo', () => {
    const candidates = [candidate({ id: 1, currentInterviewStep: 'Fase inexistente' })];
    const columns = buildKanbanColumns(steps, candidates);

    const fallbackColumn = columns.find((c) => c.stepId === UNASSIGNED_STEP_ID);
    expect(fallbackColumn).toBeDefined();
    expect(fallbackColumn?.name).toBe(UNASSIGNED_STEP_NAME);
    expect(fallbackColumn?.candidates).toHaveLength(1);
  });

  it('no agrega columna de respaldo si todos los candidatos matchean alguna fase', () => {
    const candidates = [candidate({ id: 1, currentInterviewStep: 'Phase 1' })];
    const columns = buildKanbanColumns(steps, candidates);
    expect(columns.some((c) => c.stepId === UNASSIGNED_STEP_ID)).toBe(false);
  });
});

describe('moveCandidateBetweenColumns', () => {
  it('mueve un candidato de su columna de origen a la columna destino', () => {
    const columns = buildKanbanColumns(steps, [candidate({ id: 1, currentInterviewStep: 'Phase 1' })]);
    const result = moveCandidateBetweenColumns(columns, 1, 20);

    expect(result.find((c) => c.stepId === 10)?.candidates).toHaveLength(0);
    expect(result.find((c) => c.stepId === 20)?.candidates).toHaveLength(1);
    expect(result.find((c) => c.stepId === 20)?.candidates[0].id).toBe(1);
  });

  it('actualiza currentInterviewStep del candidato movido al nombre de la nueva columna', () => {
    const columns = buildKanbanColumns(steps, [candidate({ id: 1, currentInterviewStep: 'Phase 1' })]);
    const result = moveCandidateBetweenColumns(columns, 1, 20);
    expect(result.find((c) => c.stepId === 20)?.candidates[0].currentInterviewStep).toBe('Phase 2');
  });

  it('no muta el array de columnas original', () => {
    const columns = buildKanbanColumns(steps, [candidate({ id: 1, currentInterviewStep: 'Phase 1' })]);
    moveCandidateBetweenColumns(columns, 1, 20);
    expect(columns.find((c) => c.stepId === 10)?.candidates).toHaveLength(1);
  });

  it('si el candidato no existe, devuelve las columnas sin cambios', () => {
    const columns = buildKanbanColumns(steps, [candidate({ id: 1, currentInterviewStep: 'Phase 1' })]);
    const result = moveCandidateBetweenColumns(columns, 999, 20);
    expect(result).toEqual(columns);
  });
});
