import { candidatesFixture, interviewFlowResponseFixture } from './__fixtures__/pipelineFixtures';
import {
    API_BASE_URL,
    getInterviewFlow,
    getPositionCandidates,
    updateCandidateStage,
} from './pipelineService';

const mockFetch = jest.fn();

const okResponse = (body: unknown) => ({
    ok: true,
    status: 200,
    json: async () => body,
});

beforeEach(() => {
    mockFetch.mockReset();
    (global as unknown as { fetch: jest.Mock }).fetch = mockFetch;
});

describe('getInterviewFlow', () => {
    it('calls the as-built path: GET /position/:id/interviewflow', async () => {
        mockFetch.mockResolvedValue(okResponse(interviewFlowResponseFixture()));

        await getInterviewFlow(1);

        expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/position/1/interviewflow`);
    });

    it('returns the flattened flow with its phases in board order', async () => {
        mockFetch.mockResolvedValue(okResponse(interviewFlowResponseFixture()));

        const flow = await getInterviewFlow(1);

        expect(flow.positionName).toBe('Senior Full-Stack Engineer');
        expect(flow.phases.map((phase) => phase.name)).toEqual([
            'Initial Screening',
            'Technical Interview',
            'Manager Interview',
        ]);
    });

    it('rejects when the request fails', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });

        await expect(getInterviewFlow(999)).rejects.toThrow('404');
    });
});

describe('getPositionCandidates', () => {
    it('calls the as-built path: GET /position/:id/candidates', async () => {
        mockFetch.mockResolvedValue(okResponse(candidatesFixture()));

        const candidates = await getPositionCandidates(1);

        expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/position/1/candidates`);
        expect(candidates).toHaveLength(3);
        expect(candidates[1]).toMatchObject({ id: 2, applicationId: 3 });
    });
});

describe('updateCandidateStage', () => {
    // Scenario: The move identifies the target phase by id
    it('PUTs the candidate id in the path and the applicationId plus step id in the body', async () => {
        mockFetch.mockResolvedValue(
            okResponse({
                message: 'Candidate stage updated successfully',
                data: {
                    id: 1,
                    positionId: 1,
                    candidateId: 1,
                    applicationDate: '2024-05-02T09:00:00.000Z',
                    currentInterviewStep: 3,
                    notes: null,
                    interviews: [],
                },
            }),
        );

        const result = await updateCandidateStage({
            candidateId: 1,
            applicationId: 1,
            interviewStepId: 3,
        });

        const [url, init] = mockFetch.mock.calls[0];
        expect(url).toBe(`${API_BASE_URL}/candidates/1`);
        expect(init.method).toBe('PUT');
        expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(JSON.parse(init.body)).toEqual({ applicationId: 1, currentInterviewStep: 3 });
        expect(result.data.currentInterviewStep).toBe(3);
    });

    it('rejects when the update fails', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });

        await expect(
            updateCandidateStage({ candidateId: 1, applicationId: 99, interviewStepId: 3 }),
        ).rejects.toThrow('404');
    });
});
