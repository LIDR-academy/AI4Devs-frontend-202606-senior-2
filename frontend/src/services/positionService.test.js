import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getInterviewFlowByPosition, getCandidatesByPosition } from './positionService';

const API_BASE_URL = 'http://localhost:3010';

describe('positionService', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    describe('getInterviewFlowByPosition', () => {
        it('should fetch interview flow by position successfully', async () => {
            const positionId = 1;
            const mockResponse = {
                positionName: 'Senior Developer',
                interviewFlow: {
                    id: 1,
                    description: 'Technical interview flow',
                    interviewSteps: [
                        { id: 1, name: 'Application Review', orderIndex: 0 },
                        { id: 2, name: 'Technical Interview', orderIndex: 1 },
                        { id: 3, name: 'Final Interview', orderIndex: 2 }
                    ]
                }
            };

            mockAxios.onGet(`${API_BASE_URL}/positions/${positionId}/interviewflow`).reply(200, mockResponse);

            const result = await getInterviewFlowByPosition(positionId);
            expect(result).toEqual(mockResponse);
        });

        it('should handle error when fetching interview flow', async () => {
            const positionId = 999;
            const errorMessage = 'Position not found';

            mockAxios.onGet(`${API_BASE_URL}/positions/${positionId}/interviewflow`).reply(404, { message: errorMessage });

            await expect(getInterviewFlowByPosition(positionId))
                .rejects.toThrow(`Error al obtener el flujo de entrevistas: Position not found`);
        });
    });

    describe('getCandidatesByPosition', () => {
        it('should fetch candidates by position successfully', async () => {
            const positionId = 1;
            const mockCandidates = [
                {
                    fullName: 'John Doe',
                    currentInterviewStep: 'Technical Interview',
                    averageScore: 4.5,
                    id: 1,
                    applicationId: 1
                },
                {
                    fullName: 'Jane Smith',
                    currentInterviewStep: 'Application Review',
                    averageScore: 3.8,
                    id: 2,
                    applicationId: 2
                }
            ];

            mockAxios.onGet(`${API_BASE_URL}/positions/${positionId}/candidates`).reply(200, mockCandidates);

            const result = await getCandidatesByPosition(positionId);
            expect(result).toEqual(mockCandidates);
        });

        it('should handle error when fetching candidates by position', async () => {
            const positionId = 999;
            const errorMessage = 'Error retrieving candidates';

            mockAxios.onGet(`${API_BASE_URL}/positions/${positionId}/candidates`).reply(500, { message: errorMessage });

            await expect(getCandidatesByPosition(positionId))
                .rejects.toThrow(`Error al obtener candidatos por posicion: Error retrieving candidates`);
        });

        it('should return empty array when no candidates found', async () => {
            const positionId = 1;

            mockAxios.onGet(`${API_BASE_URL}/positions/${positionId}/candidates`).reply(200, []);

            const result = await getCandidatesByPosition(positionId);
            expect(result).toEqual([]);
        });
    });
});