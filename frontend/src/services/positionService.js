const API_BASE_URL = 'http://localhost:3010';

export const getInterviewFlow = async (positionId) => {
    const res = await fetch(`${API_BASE_URL}/position/${positionId}/interviewflow`);
    if (!res.ok) {
        throw new Error('Error al obtener el flujo de entrevistas');
    }
    const data = await res.json();
    const flow = data.interviewFlow.interviewFlow;
    const interviewSteps = [...flow.interviewSteps].sort((a, b) => a.orderIndex - b.orderIndex);
    return {
        positionName: data.interviewFlow.positionName,
        interviewSteps
    };
};

export const getCandidatesByPosition = async (positionId) => {
    const res = await fetch(`${API_BASE_URL}/position/${positionId}/candidates`);
    if (!res.ok) {
        throw new Error('Error al obtener los candidatos de la posición');
    }
    return res.json();
};

export const updateCandidateStage = async (candidateId, applicationId, interviewStepId) => {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            applicationId,
            currentInterviewStep: interviewStepId
        })
    });
    if (!res.ok) {
        throw new Error('Error al actualizar la fase del candidato');
    }
    return res.json();
};
