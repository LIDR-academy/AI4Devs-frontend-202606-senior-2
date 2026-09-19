import axios from 'axios';
import { getInterviewFlow, getCandidatesByPosition, updateCandidateStage } from './positionService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('positionService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getInterviewFlow returns the position name and steps sorted by order', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                interviewFlow: {
                    positionName: 'Senior Backend Engineer',
                    interviewFlow: {
                        id: 1,
                        description: 'flow',
                        interviewSteps: [
                            { id: 2, name: 'Technical Interview', orderIndex: 2 },
                            { id: 1, name: 'Screening', orderIndex: 1 },
                        ],
                    },
                },
            },
        });

        const result = await getInterviewFlow(1);

        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3010/position/1/interviewflow');
        expect(result).toEqual({
            positionName: 'Senior Backend Engineer',
            interviewSteps: [
                { id: 1, name: 'Screening' },
                { id: 2, name: 'Technical Interview' },
            ],
        });
    });

    it('getCandidatesByPosition returns the raw candidates list', async () => {
        const candidates = [
            { id: 1, applicationId: 10, fullName: 'John Doe', currentInterviewStep: 'Screening', averageScore: 3 },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: candidates });

        const result = await getCandidatesByPosition(1);

        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3010/position/1/candidates');
        expect(result).toEqual(candidates);
    });

    it('updateCandidateStage sends the new step to the backend', async () => {
        mockedAxios.put.mockResolvedValueOnce({ data: { message: 'ok' } });

        await updateCandidateStage(1, 10, 2);

        expect(mockedAxios.put).toHaveBeenCalledWith('http://localhost:3010/candidates/1', {
            applicationId: 10,
            currentInterviewStep: 2,
        });
    });
});
