import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export type InterviewStep = {
    id: number;
    name: string;
};

export type InterviewFlow = {
    positionName: string;
    interviewSteps: InterviewStep[];
};

export type CandidateDTO = {
    id: number;
    applicationId: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
};

export const getInterviewFlow = async (positionId: string | number): Promise<InterviewFlow> => {
    const response = await axios.get(`${API_BASE_URL}/position/${positionId}/interviewflow`);
    const { interviewFlow } = response.data;
    return {
        positionName: interviewFlow.positionName,
        interviewSteps: interviewFlow.interviewFlow.interviewSteps
            .slice()
            .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
            .map((step: any) => ({ id: step.id, name: step.name })),
    };
};

export const getCandidatesByPosition = async (positionId: string | number): Promise<CandidateDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/position/${positionId}/candidates`);
    return response.data;
};

export const updateCandidateStage = async (
    candidateId: number,
    applicationId: number,
    currentInterviewStep: number
) => {
    const response = await axios.put(`${API_BASE_URL}/candidates/${candidateId}`, {
        applicationId,
        currentInterviewStep,
    });
    return response.data;
};
