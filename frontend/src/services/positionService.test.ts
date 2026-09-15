import {
    API_BASE_URL,
    ApiError,
    getCandidates,
    getInterviewFlow,
    NotFoundError,
    updateCandidateStage,
} from './positionService';

const fetchMock = jest.fn();

const respondWith = (status: number, body: unknown = {}) =>
    fetchMock.mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
    });

beforeEach(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
});

describe('getInterviewFlow', () => {
    it('llama a la ruta real y desanida la respuesta', async () => {
        const interviewSteps = [
            { id: 1, interviewFlowId: 1, interviewTypeId: 1, name: 'Initial Screening', orderIndex: 1 },
        ];
        respondWith(200, {
            interviewFlow: {
                positionName: 'Senior Full-Stack Engineer',
                interviewFlow: { id: 1, description: 'Standard', interviewSteps },
            },
        });

        const result = await getInterviewFlow(1);

        expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/position/1/interviewflow`, undefined);
        expect(result).toEqual({ positionName: 'Senior Full-Stack Engineer', steps: interviewSteps });
    });

    it('lanza NotFoundError si la posición no existe', async () => {
        respondWith(404, { message: 'Position not found' });

        await expect(getInterviewFlow(99)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('lanza ApiError con el estado si el servidor falla', async () => {
        respondWith(500);

        const error = await getInterviewFlow(1).catch((e) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).not.toBeInstanceOf(NotFoundError);
        expect(error.status).toBe(500);
    });

    it('lanza ApiError si hay un error de red', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(getInterviewFlow(1)).rejects.toBeInstanceOf(ApiError);
    });
});

describe('getCandidates', () => {
    it('devuelve los candidatos de la posición', async () => {
        const candidates = [
            { id: 1, applicationId: 1, fullName: 'John Doe', currentInterviewStep: 'Technical Interview', averageScore: 5 },
        ];
        respondWith(200, candidates);

        await expect(getCandidates(1)).resolves.toEqual(candidates);
        expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/position/1/candidates`, undefined);
    });

    it('lanza ApiError si el servidor falla', async () => {
        respondWith(500);

        await expect(getCandidates(1)).rejects.toBeInstanceOf(ApiError);
    });
});

describe('updateCandidateStage', () => {
    it('hace PUT a /candidates/:candidateId con la aplicación y el id de la nueva fase', async () => {
        respondWith(200, { message: 'Candidate stage updated successfully' });

        await updateCandidateStage(2, 3, 4);

        expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/candidates/2`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: 3, currentInterviewStep: 4 }),
        });
    });

    it('lanza ApiError si la actualización falla', async () => {
        respondWith(400);

        await expect(updateCandidateStage(2, 3, 4)).rejects.toBeInstanceOf(ApiError);
    });
});
