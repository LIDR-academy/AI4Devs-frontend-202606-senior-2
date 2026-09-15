import {
    buildBoard,
    getMoveFromDropResult,
    groupByStep,
    moveCandidate,
    revertMove,
    sortSteps,
} from './kanban';
import type { InterviewStep, PositionCandidate } from '../services/positionService';

const step = (id: number, name: string, orderIndex: number): InterviewStep => ({
    id,
    interviewFlowId: 1,
    interviewTypeId: id,
    name,
    orderIndex,
});

const candidate = (applicationId: number, fullName: string, currentInterviewStep: string): PositionCandidate => ({
    id: applicationId + 100,
    applicationId,
    fullName,
    currentInterviewStep,
    averageScore: 0,
});

// Mismo caso que el seed: dos fases con orderIndex 2, desordenadas
const steps = [
    step(3, 'Manager Interview', 2),
    step(1, 'Initial Screening', 1),
    step(2, 'Technical Interview', 2),
];

describe('sortSteps', () => {
    it('ordena por orderIndex y desempata por id', () => {
        expect(sortSteps(steps).map((s) => s.id)).toEqual([1, 2, 3]);
    });

    it('no muta el array recibido', () => {
        const input = [...steps];
        sortSteps(input);
        expect(input.map((s) => s.id)).toEqual([3, 1, 2]);
    });
});

describe('buildBoard', () => {
    it('asigna a cada candidato el id de la fase con su mismo nombre', () => {
        const board = buildBoard(steps, [
            candidate(1, 'Jane Smith', 'Technical Interview'),
            candidate(2, 'Carlos García', 'Initial Screening'),
        ]);

        expect(board.candidates.map((c) => [c.fullName, c.stepId])).toEqual([
            ['Jane Smith', 2],
            ['Carlos García', 1],
        ]);
        expect(board.unassigned).toEqual([]);
    });

    it('separa los candidatos cuya fase no pertenece al flujo', () => {
        const board = buildBoard(steps, [candidate(1, 'John Doe', 'Fase de otro flujo')]);

        expect(board.candidates).toEqual([]);
        expect(board.unassigned.map((c) => c.fullName)).toEqual(['John Doe']);
    });

    it('con nombres de fase duplicados usa la primera fase en orden', () => {
        const duplicated = [step(8, 'Entrevista', 3), step(5, 'Entrevista', 1)];
        const board = buildBoard(duplicated, [candidate(1, 'Eva White', 'Entrevista')]);

        expect(board.candidates[0].stepId).toBe(5);
    });
});

describe('groupByStep', () => {
    it('devuelve una columna por fase, en orden y con sus candidatos', () => {
        const { candidates } = buildBoard(steps, [
            candidate(1, 'Jane Smith', 'Technical Interview'),
            candidate(2, 'Carlos García', 'Initial Screening'),
        ]);

        const columns = groupByStep(steps, candidates);

        expect(columns.map((c) => c.step.name)).toEqual(['Initial Screening', 'Technical Interview', 'Manager Interview']);
        expect(columns.map((c) => c.candidates.map((x) => x.fullName))).toEqual([['Carlos García'], ['Jane Smith'], []]);
    });
});

describe('moveCandidate y revertMove', () => {
    const { candidates } = buildBoard(steps, [
        candidate(1, 'Jane Smith', 'Technical Interview'),
        candidate(2, 'Carlos García', 'Initial Screening'),
    ]);
    const move = { applicationId: 1, fromStepId: 2, toStepId: 3 };

    it('moveCandidate cambia solo la fase del candidato indicado sin mutar la entrada', () => {
        const moved = moveCandidate(candidates, 1, 3);

        expect(moved.map((c) => c.stepId)).toEqual([3, 1]);
        expect(candidates.map((c) => c.stepId)).toEqual([2, 1]);
    });

    it('revertMove devuelve la tarjeta a su fase original si sigue en la fase destino', () => {
        const moved = moveCandidate(candidates, 1, 3);

        expect(revertMove(moved, move).map((c) => c.stepId)).toEqual([2, 1]);
    });

    it('revertMove no pisa un movimiento posterior de la misma tarjeta', () => {
        const movedAgain = moveCandidate(moveCandidate(candidates, 1, 3), 1, 1);

        expect(revertMove(movedAgain, move).map((c) => c.stepId)).toEqual([1, 1]);
    });
});

describe('getMoveFromDropResult', () => {
    const source = { droppableId: '2', index: 0 };

    it('devuelve null si se suelta fuera de cualquier columna', () => {
        expect(getMoveFromDropResult({ draggableId: '1', source, destination: null })).toBeNull();
    });

    it('devuelve null si se suelta en la misma columna', () => {
        expect(getMoveFromDropResult({ draggableId: '1', source, destination: { droppableId: '2', index: 1 } })).toBeNull();
    });

    it('devuelve la aplicación y las fases de origen y destino como números', () => {
        expect(
            getMoveFromDropResult({ draggableId: '1', source, destination: { droppableId: '3', index: 0 } }),
        ).toEqual({ applicationId: 1, fromStepId: 2, toStepId: 3 });
    });
});
