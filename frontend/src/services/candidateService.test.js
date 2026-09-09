import axios from 'axios';
import { updateCandidateStage } from './candidateService';

jest.mock('axios');

describe('updateCandidateStage', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('calls PUT /candidates/{candidateId} with the applicationId and currentInterviewStep', async () => {
        axios.put.mockResolvedValueOnce({ data: { message: 'Candidate stage updated successfully' } });

        await updateCandidateStage(1, 10, 3);

        expect(axios.put).toHaveBeenCalledWith('http://localhost:3010/candidates/1', {
            applicationId: 10,
            currentInterviewStep: 3,
        });
    });

    it('throws when the request fails', async () => {
        axios.put.mockRejectedValueOnce(new Error('Network error'));

        await expect(updateCandidateStage(1, 10, 3)).rejects.toThrow('Error al actualizar la fase del candidato');
    });
});
