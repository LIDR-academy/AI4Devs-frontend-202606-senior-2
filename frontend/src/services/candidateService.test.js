import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { updateCandidateStage, sendCandidateData, uploadCV } from './candidateService';

const API_BASE_URL = 'http://localhost:3010';

describe('candidateService', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    describe('uploadCV', () => {
        it('should upload CV file successfully', async () => {
            const mockFile = new Blob(['test content'], { type: 'application/pdf' });
            const mockResponse = {
                filePath: '/uploads/test.pdf',
                fileType: 'application/pdf'
            };

            mockAxios.onPost(`${API_BASE_URL}/upload`).reply(200, mockResponse);

            const result = await uploadCV(mockFile);
            expect(result).toEqual(mockResponse);
        });

        it('should handle error when uploading CV', async () => {
            const mockFile = new Blob(['test content'], { type: 'application/pdf' });
            const errorMessage = 'Upload failed';

            mockAxios.onPost(`${API_BASE_URL}/upload`).reply(500, { message: errorMessage });

            await expect(uploadCV(mockFile)).rejects.toThrow(`Error al subir el archivo: ${errorMessage}`);
        });
    });

    describe('sendCandidateData', () => {
        it('should send candidate data successfully', async () => {
            const mockCandidateData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            };
            const mockResponse = { id: 1, ...mockCandidateData };

            mockAxios.onPost(`${API_BASE_URL}/candidates`).reply(201, mockResponse);

            const result = await sendCandidateData(mockCandidateData);
            expect(result).toEqual(mockResponse);
        });

        it('should handle error when sending candidate data', async () => {
            const mockCandidateData = { firstName: 'John' };
            const errorMessage = 'Invalid data';

            mockAxios.onPost(`${API_BASE_URL}/candidates`).reply(400, { message: errorMessage });

            await expect(sendCandidateData(mockCandidateData)).rejects.toThrow(`Error al enviar datos del candidato: ${errorMessage}`);
        });
    });

    describe('updateCandidateStage', () => {
        it('should update candidate stage successfully', async () => {
            const candidateId = 1;
            const applicationId = 1;
            const currentInterviewStep = 2;
            const mockResponse = { 
                message: 'Candidate stage updated successfully',
                data: { id: candidateId, currentInterviewStep } 
            };

            mockAxios.onPut(`${API_BASE_URL}/candidates/${candidateId}`).reply(200, mockResponse);

            const result = await updateCandidateStage(candidateId, applicationId, currentInterviewStep);
            expect(result).toEqual(mockResponse);
        });

        it('should handle error when updating candidate stage', async () => {
            const candidateId = 1;
            const applicationId = 1;
            const currentInterviewStep = 2;
            const errorMessage = 'Candidate not found';

            mockAxios.onPut(`${API_BASE_URL}/candidates/${candidateId}`).reply(404, { message: errorMessage });

            await expect(updateCandidateStage(candidateId, applicationId, currentInterviewStep))
                .rejects.toThrow('Error al actualizar el estado del candidato: Candidate not found');
        });
    });
});