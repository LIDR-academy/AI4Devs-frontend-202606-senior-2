import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Positions from './Positions';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Positions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to /position/{index} when "Ver proceso" is clicked', async () => {
        render(
            <MemoryRouter>
                <Positions />
            </MemoryRouter>
        );

        const verProcesoButtons = screen.getAllByRole('button', { name: /ver proceso/i });
        await userEvent.click(verProcesoButtons[1]);

        expect(mockNavigate).toHaveBeenCalledWith('/position/1');
    });
});
