import type { DropResult } from '@hello-pangea/dnd';
import type { InterviewStep, PositionCandidate } from '../services/positionService';

export interface BoardCandidate extends PositionCandidate {
    stepId: number;
}

export interface Board {
    candidates: BoardCandidate[];
    unassigned: PositionCandidate[];
}

export interface BoardColumn {
    step: InterviewStep;
    candidates: BoardCandidate[];
}

export interface CandidateMove {
    applicationId: number;
    fromStepId: number;
    toStepId: number;
}

export const sortSteps = (steps: InterviewStep[]): InterviewStep[] =>
    [...steps].sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id);

// La API identifica la fase del candidato por nombre; se resuelve una vez al id de la primera fase que coincide
export const buildBoard = (steps: InterviewStep[], candidates: PositionCandidate[]): Board => {
    const sortedSteps = sortSteps(steps);
    const board: Board = { candidates: [], unassigned: [] };

    candidates.forEach((candidate) => {
        const step = sortedSteps.find((s) => s.name === candidate.currentInterviewStep);
        if (step) {
            board.candidates.push({ ...candidate, stepId: step.id });
        } else {
            board.unassigned.push(candidate);
        }
    });

    return board;
};

export const groupByStep = (steps: InterviewStep[], candidates: BoardCandidate[]): BoardColumn[] =>
    sortSteps(steps).map((step) => ({
        step,
        candidates: candidates.filter((candidate) => candidate.stepId === step.id),
    }));

export const moveCandidate = (
    candidates: BoardCandidate[],
    applicationId: number,
    toStepId: number,
): BoardCandidate[] =>
    candidates.map((candidate) =>
        candidate.applicationId === applicationId ? { ...candidate, stepId: toStepId } : candidate,
    );

// Solo revierte si la tarjeta sigue donde la dejó el movimiento fallido, para no pisar un movimiento posterior
export const revertMove = (candidates: BoardCandidate[], move: CandidateMove): BoardCandidate[] =>
    candidates.map((candidate) =>
        candidate.applicationId === move.applicationId && candidate.stepId === move.toStepId
            ? { ...candidate, stepId: move.fromStepId }
            : candidate,
    );

export const getMoveFromDropResult = (
    result: Pick<DropResult, 'draggableId' | 'source' | 'destination'>,
): CandidateMove | null => {
    const { draggableId, source, destination } = result;
    if (!destination || destination.droppableId === source.droppableId) {
        return null;
    }
    return {
        applicationId: Number(draggableId),
        fromStepId: Number(source.droppableId),
        toStepId: Number(destination.droppableId),
    };
};
