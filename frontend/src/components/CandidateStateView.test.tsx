import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CandidateStateView from './CandidateStateView';

// Mock all the dnd-kit imports
jest.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    closestCenter: jest.fn(),
    KeyboardSensor: jest.fn(),
    PointerSensor: jest.fn(),
    useSensor: jest.fn(() => ({})),
    useSensors: jest.fn(() => []),
    DragEndEvent: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    sortableKeyboardCoordinates: jest.fn(),
    verticalListSortingStrategy: jest.fn(),
    arrayMove: jest.fn(),
}));

jest.mock('@dnd-kit/modifiers', () => ({
    restrictToParentElement: jest.fn(),
}));

// Mock service functions
jest.mock('../services/positionService', () => ({
    getInterviewFlowByPosition: jest.fn(),
    getCandidatesByPosition: jest.fn(),
}));

jest.mock('../services/candidateService', () => ({
    updateCandidateStage: jest.fn(),
}));

// Mock child components
jest.mock('./KanbanColumn', () => ({ id, title, candidates, isMobile }: any) => (
    <div data-testid={`column-${id}`}>
        <h5>{title} ({candidates.length})</h5>
        {candidates.map((candidate: any) => (
            <div key={candidate.id} data-testid={`candidate-${candidate.id}`}>
                {candidate.fullName} - {candidate.averageScore}
            </div>
        ))}
    </div>
));

describe('CandidateStateView Component', () => {
    const mockPositionId = '1';
    
    const mockInterviewFlowData = {
        interviewFlow: {
            interviewSteps: [
                { id: 1, name: 'Application Review', orderIndex: 0 },
                { id: 2, name: 'Technical Interview', orderIndex: 1 },
                { id: 3, name: 'Final Interview', orderIndex: 2 }
            ]
        }
    };

    const mockCandidatesData = [
        { id: 1, fullName: 'John Doe', averageScore: 4.5, currentInterviewStep: 'Application Review', applicationId: 1 },
        { id: 2, fullName: 'Jane Smith', averageScore: 3.8, currentInterviewStep: 'Technical Interview', applicationId: 2 }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock successful API responses
        require('../services/positionService').getInterviewFlowByPosition.mockResolvedValue(mockInterviewFlowData);
        require('../services/positionService').getCandidatesByPosition.mockResolvedValue(mockCandidatesData);
    });

    it('renders loading spinner initially', async () => {
        render(
            <MemoryRouter initialEntries={[`/positions/${mockPositionId}/candidates`]}>
                <Routes>
                    <Route path="/positions/:positionId/candidates" element={<CandidateStateView />} />
                </Routes>
            </MemoryRouter>
        );

        // Initially should show loading
        expect(screen.getByRole('status')).toBeInTheDocument();
        
        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Estado de Candidatos')).toBeInTheDocument();
        });
    });

    it('renders page title and back button', async () => {
        render(
            <MemoryRouter initialEntries={[`/positions/${mockPositionId}/candidates`]}>
                <Routes>
                    <Route path="/positions/:positionId/candidates" element={<CandidateStateView />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Estado de Candidatos')).toBeInTheDocument();
        });
    });

    it('renders kanban columns for each interview step', async () => {
        render(
            <MemoryRouter initialEntries={[`/positions/${mockPositionId}/candidates`]}>
                <Routes>
                    <Route path="/positions/:positionId/candidates" element={<CandidateStateView />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('column-column-1')).toBeInTheDocument();
            expect(screen.getByTestId('column-column-2')).toBeInTheDocument();
            expect(screen.getByTestId('column-column-3')).toBeInTheDocument();
        });
    });

    it('renders column titles correctly', async () => {
        render(
            <MemoryRouter initialEntries={[`/positions/${mockPositionId}/candidates`]}>
                <Routes>
                    <Route path="/positions/:positionId/candidates" element={<CandidateStateView />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Application Review (1)')).toBeInTheDocument();
            expect(screen.getByText('Technical Interview (1)')).toBeInTheDocument();
            expect(screen.getByText('Final Interview (0)')).toBeInTheDocument();
        });
    });

    it('handles error when fetching data', async () => {
        const errorMessage = 'Failed to load data';
        require('../services/positionService').getInterviewFlowByPosition.mockRejectedValue(new Error(errorMessage));
        require('../services/positionService').getCandidatesByPosition.mockRejectedValue(new Error(errorMessage));

        render(
            <MemoryRouter initialEntries={[`/positions/${mockPositionId}/candidates`]}>
                <Routes>
                    <Route path="/positions/:positionId/candidates" element={<CandidateStateView />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(screen.getByText('Volver a Posiciones')).toBeInTheDocument();
        });
    });

    it('navigates back to positions when back button is clicked', async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

        render(
            <MemoryRouter initialEntries={[`/positions/${mockPositionId}/candidates`]}>
                <Routes>
                    <Route path="/positions/:positionId/candidates" element={<CandidateStateView />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            const backButton = screen.getByRole('link');
            fireEvent.click(backButton);
            expect(mockNavigate).toHaveBeenCalledWith('/positions');
        });
    });
});