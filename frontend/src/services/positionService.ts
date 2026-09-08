import axios from 'axios';

export type InterviewStep = {
    id: number;
    name: string;
    orderIndex: number;
};

export type Candidate = {
    id: number;
    applicationId: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
};

export type InterviewFlow = {
    positionName: string;
    interviewSteps: InterviewStep[];
};

export const getInterviewFlow = async (positionId: number): Promise<InterviewFlow> => {
    try {
        const response = await axios.get(`http://localhost:3010/position/${positionId}/interviewflow`);
        const { positionName, interviewFlow } = response.data.interviewFlow;
        const interviewSteps: InterviewStep[] = [...interviewFlow.interviewSteps].sort(
            (a, b) => a.orderIndex - b.orderIndex
        );
        return { positionName, interviewSteps };
    } catch (error: any) {
        throw new Error('Error al obtener el flujo de entrevistas: ' + error.message);
    }
};

export const getCandidatesByPosition = async (positionId: number): Promise<Candidate[]> => {
    try {
        const response = await axios.get(`http://localhost:3010/position/${positionId}/candidates`);
        return response.data;
    } catch (error: any) {
        throw new Error('Error al obtener los candidatos: ' + error.message);
    }
};
