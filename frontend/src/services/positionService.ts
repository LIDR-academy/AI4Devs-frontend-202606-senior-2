import axios from 'axios';

export interface InterviewStep {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
}

export interface InterviewFlowData {
    positionName: string;
    interviewSteps: InterviewStep[];
}

export interface Candidate {
    id: number;
    applicationId: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
}

export const getInterviewFlow = async (positionId: string | number): Promise<InterviewFlowData> => {
    try {
        const response = await axios.get(`http://localhost:3010/position/${positionId}/interviewflow`);
        const { positionName, interviewFlow } = response.data.interviewFlow;
        const interviewSteps: InterviewStep[] = [...interviewFlow.interviewSteps].sort(
            (a, b) => a.orderIndex - b.orderIndex
        );
        return { positionName, interviewSteps };
    } catch (error: any) {
        throw new Error('Error al obtener el flujo de entrevista: ' + error.message);
    }
};

export const getCandidatesByPosition = async (positionId: string | number): Promise<Candidate[]> => {
    try {
        const response = await axios.get(`http://localhost:3010/position/${positionId}/candidates`);
        return response.data;
    } catch (error: any) {
        throw new Error('Error al obtener los candidatos: ' + error.message);
    }
};
