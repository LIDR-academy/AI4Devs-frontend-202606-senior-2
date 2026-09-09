import axios from 'axios';
import { getCandidatesByPosition, getInterviewFlow, updateCandidateStage } from './positionService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('positionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInterviewFlow', () => {
    it('solicita la URL correcta del endpoint de interviewflow', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          interviewFlow: {
            positionName: 'QA Lead',
            interviewFlow: { id: 2, description: 'd', interviewSteps: [] },
          },
        },
      });

      await getInterviewFlow(5);

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3010/position/5/interviewflow');
    });

    it('desanida la respuesta doblemente anidada del backend', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          interviewFlow: {
            positionName: 'QA Lead',
            interviewFlow: {
              id: 2,
              description: 'd',
              interviewSteps: [
                { id: 9, interviewFlowId: 2, interviewTypeId: 1, name: 'Offer', orderIndex: 3 },
              ],
            },
          },
        },
      });

      const result = await getInterviewFlow(5);

      expect(result).toEqual({
        positionName: 'QA Lead',
        steps: [{ id: 9, name: 'Offer', orderIndex: 3 }],
      });
    });

    it('ordena las fases por orderIndex ascendente', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          interviewFlow: {
            positionName: 'QA Lead',
            interviewFlow: {
              id: 2,
              description: 'd',
              interviewSteps: [
                { id: 3, interviewFlowId: 2, interviewTypeId: 1, name: 'C', orderIndex: 3 },
                { id: 1, interviewFlowId: 2, interviewTypeId: 1, name: 'A', orderIndex: 1 },
                { id: 2, interviewFlowId: 2, interviewTypeId: 1, name: 'B', orderIndex: 2 },
              ],
            },
          },
        },
      });

      const result = await getInterviewFlow(5);

      expect(result.steps.map((s) => s.orderIndex)).toEqual([1, 2, 3]);
    });
  });

  describe('getCandidatesByPosition', () => {
    it('solicita la URL correcta del endpoint de candidates', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await getCandidatesByPosition(5);

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3010/position/5/candidates');
    });

    it('conserva id y applicationId de cada candidato', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            id: 4,
            applicationId: 7,
            fullName: 'Ana Ruiz',
            currentInterviewStep: 'Technical Interview',
            averageScore: 4.5,
          },
        ],
      });

      const result = await getCandidatesByPosition(5);

      expect(result).toEqual([
        {
          id: 4,
          applicationId: 7,
          fullName: 'Ana Ruiz',
          currentInterviewStep: 'Technical Interview',
          averageScore: 4.5,
        },
      ]);
    });
  });

  describe('updateCandidateStage', () => {
    it('emite PUT /candidates/:id con el cuerpo correcto', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: {} });

      await updateCandidateStage(4, 7, 9);

      expect(mockedAxios.put).toHaveBeenCalledWith('http://localhost:3010/candidates/4', {
        applicationId: 7,
        currentInterviewStep: 9,
      });
    });
  });
});
