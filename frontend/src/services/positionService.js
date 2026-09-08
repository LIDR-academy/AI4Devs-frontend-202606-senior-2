import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export const getInterviewFlowByPosition = async (positionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/positions/${positionId}/interviewflow`);
        return response.data;
    } catch (error) {
        throw new Error('Error al obtener el flujo de entrevistas:', error.response?.data);
    }
};

export const getCandidatesByPosition = async (positionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/positions/${positionId}/candidates`);
        return response.data;
    } catch (error) {
        throw new Error('Error al obtener candidatos por posicion:', error.response?.data);
    }
};