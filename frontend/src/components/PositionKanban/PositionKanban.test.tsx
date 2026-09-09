import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PositionKanban from './PositionKanban';
import * as positionService from '../../services/positionService';

jest.mock('../../services/positionService');

const mockFlow = {
  positionName: 'Senior Backend Engineer',
  interviewFlow: {
    id: 1,
    description: 'Standard development interview process',
    interviewSteps: [
      { id: 1, interviewFlowId: 1, interviewTypeId: 1, name: 'Initial Screening', orderIndex: 1 },
      { id: 2, interviewFlowId: 1, interviewTypeId: 2, name: 'Technical Interview', orderIndex: 2 },
      { id: 3, interviewFlowId: 1, interviewTypeId: 3, name: 'Manager Interview', orderIndex: 3 }
    ]
  }
};

const mockCandidates = [
  {
    id: 1,
    applicationId: 101,
    fullName: 'Jane Smith',
    currentInterviewStep: 'Technical Interview',
    averageScore: 4.5
  },
  {
    id: 2,
    applicationId: 102,
    fullName: 'Carlos García',
    currentInterviewStep: 'Initial Screening',
    averageScore: 3.8
  },
  {
    id: 3,
    applicationId: 103,
    fullName: 'John Doe',
    currentInterviewStep: 'Manager Interview',
    averageScore: 5.0
  }
];

const renderComponent = (positionId = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/positions/${positionId}`]}>
      <Routes>
        <Route path="/positions/:id" element={<PositionKanban />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PositionKanban Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (positionService.getInterviewFlow as jest.Mock).mockResolvedValue(mockFlow);
    (positionService.getCandidatesByPosition as jest.Mock).mockResolvedValue(mockCandidates);
    (positionService.updateCandidateStage as jest.Mock).mockResolvedValue({
      message: 'Candidate stage updated successfully'
    });
  });

  it('renders position title and interview flow description', async () => {
    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByTestId('position-title')).toHaveTextContent('Senior Backend Engineer');
    });

    expect(screen.getByText(/Standard development interview process/i)).toBeInTheDocument();
    expect(screen.getByText(/3 candidatos en proceso/i)).toBeInTheDocument();
  });

  it('renders the back button linking to positions list', async () => {
    renderComponent('1');

    await waitFor(() => {
      const backBtn = screen.getByTestId('back-to-positions-btn');
      expect(backBtn).toBeInTheDocument();
      expect(backBtn).toHaveAttribute('href', '/positions');
    });
  });

  it('renders all interview step columns dynamically based on API response', async () => {
    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByText('Initial Screening')).toBeInTheDocument();
      expect(screen.getByText('Technical Interview')).toBeInTheDocument();
      expect(screen.getByText('Manager Interview')).toBeInTheDocument();
    });
  });

  it('places candidates in their corresponding stage columns with full name and score', async () => {
    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Carlos García')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Jane Smith is in Technical Interview
    const janeCard = screen.getByTestId('candidate-card-1');
    expect(janeCard).toHaveTextContent('Jane Smith');
    expect(janeCard).toHaveTextContent('4.5');

    // Carlos García is in Initial Screening
    const carlosCard = screen.getByTestId('candidate-card-2');
    expect(carlosCard).toHaveTextContent('Carlos García');
    expect(carlosCard).toHaveTextContent('3.8');

    // John Doe is in Manager Interview
    const johnCard = screen.getByTestId('candidate-card-3');
    expect(johnCard).toHaveTextContent('John Doe');
    expect(johnCard).toHaveTextContent('5.0');
  });

  it('filters candidates in real-time when typing in the search input', async () => {
    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('candidate-search-input');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });

    expect(screen.getByText('Carlos García')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('allows moving candidate to another stage and calls updateCandidateStage API', async () => {
    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByText('Carlos García')).toBeInTheDocument();
    });

    // Drop Carlos (ID 2, AppID 102) into Manager Interview (ID 3)
    const managerColumn = screen.getByTestId('kanban-column-3');

    const dragData = JSON.stringify({
      id: 2,
      applicationId: 102,
      currentInterviewStep: 'Initial Screening'
    });

    fireEvent.drop(managerColumn, {
      dataTransfer: {
        getData: (format: string) => (format === 'text/plain' ? dragData : '')
      }
    });

    await waitFor(() => {
      expect(positionService.updateCandidateStage).toHaveBeenCalledWith(2, {
        applicationId: 102,
        currentInterviewStep: 3
      });
    });
  });

  it('displays an error alert if loading data fails', async () => {
    (positionService.getInterviewFlow as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderComponent('1');

    await waitFor(() => {
      expect(
        screen.getByText(/No se pudo cargar la información de la posición/i)
      ).toBeInTheDocument();
    });
  });
});
