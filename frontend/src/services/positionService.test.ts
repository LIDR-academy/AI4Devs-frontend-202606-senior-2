import axios from 'axios';
import { getInterviewFlow, getCandidatesByPosition } from './positionService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('positionService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getInterviewFlow', () => {
        it('returns interview steps sorted by orderIndex along with the position name', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    interviewFlow: {
                        positionName: 'Senior Backend Engineer',
                        interviewFlow: {
                            id: 1,
                            description: 'Standard flow',
                            interviewSteps: [
                                { id: 2, interviewFlowId: 1, interviewTypeId: 1, name: 'Technical Interview', orderIndex: 2 },
                                { id: 1, interviewFlowId: 1, interviewTypeId: 2, name: 'Phone Screen', orderIndex: 1 },
                            ],
                        },
                    },
                },
            });

            const result = await getInterviewFlow(5);

            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3010/position/5/interviewflow');
            expect(result.positionName).toBe('Senior Backend Engineer');
            expect(result.interviewSteps.map((s) => s.name)).toEqual(['Phone Screen', 'Technical Interview']);
        });

        it('throws when the request fails', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

            await expect(getInterviewFlow(5)).rejects.toThrow('Error al obtener el flujo de entrevista');
        });
    });

    describe('getCandidatesByPosition', () => {
        it('returns the candidates array as-is', async () => {
            const candidates = [
                { id: 1, applicationId: 10, fullName: 'Jane Doe', currentInterviewStep: 'Phone Screen', averageScore: 8 },
            ];
            mockedAxios.get.mockResolvedValueOnce({ data: candidates });

            const result = await getCandidatesByPosition(5);

            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3010/position/5/candidates');
            expect(result).toEqual(candidates);
        });

        it('throws when the request fails', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

            await expect(getCandidatesByPosition(5)).rejects.toThrow('Error al obtener los candidatos');
        });
    });
});
