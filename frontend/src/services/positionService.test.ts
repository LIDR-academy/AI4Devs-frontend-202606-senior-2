import { getCandidatesByPosition, getInterviewFlowByPosition, updateCandidateStage } from './positionService';

const mockJsonResponse = (body: unknown, ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);

describe('positionService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getInterviewFlowByPosition', () => {
    it('llama al endpoint con el id de posición correcto', async () => {
      (global.fetch as jest.Mock).mockReturnValue(
        mockJsonResponse({ interviewFlow: { positionName: 'Dev', interviewFlow: { id: 1, description: null, interviewSteps: [] } } })
      );

      await getInterviewFlowByPosition(1);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/position/1/interviewflow');
    });

    it('propaga un error si la respuesta no es ok', async () => {
      (global.fetch as jest.Mock).mockReturnValue(mockJsonResponse({}, false));
      await expect(getInterviewFlowByPosition(1)).rejects.toThrow();
    });
  });

  describe('getCandidatesByPosition', () => {
    it('llama al endpoint real /position/:id/candidates (singular) con el id correcto', async () => {
      (global.fetch as jest.Mock).mockReturnValue(mockJsonResponse([]));

      await getCandidatesByPosition(1);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/position/1/candidates');
    });

    it('propaga un error si la respuesta no es ok', async () => {
      (global.fetch as jest.Mock).mockReturnValue(mockJsonResponse({}, false));
      await expect(getCandidatesByPosition(1)).rejects.toThrow();
    });
  });

  describe('updateCandidateStage', () => {
    it('llama a PUT /candidates/:id con el payload real del backend (applicationId + currentInterviewStep)', async () => {
      (global.fetch as jest.Mock).mockReturnValue(mockJsonResponse({ message: 'ok', data: {} }));

      await updateCandidateStage(5, 100, 20);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/candidates/5', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: 100, currentInterviewStep: 20 }),
      });
    });

    it('propaga un error si la respuesta no es ok', async () => {
      (global.fetch as jest.Mock).mockReturnValue(mockJsonResponse({}, false));
      await expect(updateCandidateStage(5, 100, 20)).rejects.toThrow();
    });
  });
});
