import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3010';

export interface InterviewStep {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
}

export interface PositionInterviewFlow {
    positionName: string;
    interviewSteps: InterviewStep[];
}

export interface PositionCandidate {
    id: number; // candidate id
    applicationId: number;
    fullName: string;
    currentInterviewStep: string; // step NAME, not id (asymmetric with updateCandidateStage)
    averageScore: number;
}

// Raw HTTP shape of GET /position/:id/interviewflow. The controller wraps a service
// result that is already `{ positionName, interviewFlow }`, so the real body is
// double-nested under `interviewFlow`. Do not "simplify" this away without checking
// backend/src/presentation/controllers/positionController.ts:22 first.
interface InterviewFlowRawResponse {
    interviewFlow: {
        positionName: string;
        interviewFlow: {
            id: number;
            description: string | null;
            interviewSteps: InterviewStep[];
        };
    };
}

export interface UpdateCandidateStageResponse {
    message: string;
    data: {
        id: number;
        positionId: number;
        candidateId: number;
        applicationDate: string;
        currentInterviewStep: number;
        notes: string | null;
    };
}

const sortSteps = (a: InterviewStep, b: InterviewStep) =>
    // Seeded data has two steps sharing orderIndex 2, so orderIndex alone is not a
    // stable sort key: tie-break by id or column order becomes non-deterministic.
    a.orderIndex - b.orderIndex || a.id - b.id;

const toErrorMessage = (error: unknown): string => {
    if (axios.isCancel(error)) throw error;
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? error.response?.data?.error ?? error.message;
    }
    return error instanceof Error ? error.message : 'Error desconocido';
};

export const getInterviewFlowByPosition = async (
    positionId: string | number,
    signal?: AbortSignal
): Promise<PositionInterviewFlow> => {
    try {
        // NOTE: the real route is singular ("/position", not "/positions") and lowercase
        // ("interviewflow", not "interviewFlow"). This is not a typo - see
        // backend/src/routes/positionRoutes.ts.
        const { data } = await axios.get<InterviewFlowRawResponse>(
            `${API_BASE_URL}/position/${positionId}/interviewflow`,
            { signal }
        );
        const steps = data.interviewFlow.interviewFlow?.interviewSteps ?? [];
        return {
            positionName: data.interviewFlow.positionName,
            interviewSteps: [...steps].sort(sortSteps),
        };
    } catch (error) {
        throw new Error(toErrorMessage(error));
    }
};

export const getCandidatesByPosition = async (
    positionId: string | number,
    signal?: AbortSignal
): Promise<PositionCandidate[]> => {
    try {
        const { data } = await axios.get<PositionCandidate[]>(
            `${API_BASE_URL}/position/${positionId}/candidates`,
            { signal }
        );
        return data;
    } catch (error) {
        throw new Error(toErrorMessage(error));
    }
};

export const updateCandidateStage = async (
    candidateId: number,
    applicationId: number,
    interviewStepId: number
): Promise<UpdateCandidateStageResponse> => {
    try {
        // currentInterviewStep here is the InterviewStep ID, not its name and not its
        // orderIndex - asymmetric with what getCandidatesByPosition returns.
        const { data } = await axios.put<UpdateCandidateStageResponse>(
            `${API_BASE_URL}/candidates/${candidateId}`,
            { applicationId, currentInterviewStep: interviewStepId }
        );
        return data;
    } catch (error) {
        throw new Error(toErrorMessage(error));
    }
};
