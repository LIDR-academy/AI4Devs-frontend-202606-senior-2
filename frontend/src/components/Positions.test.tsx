import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Positions from './Positions';
import axios from 'axios';
jest.mock('axios');
const get = axios.get as jest.Mock;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Positions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        get.mockResolvedValue({ data: [{ id: 42, title: 'Frontend Engineer', status: 'Open', applicationDeadline: null, company: { name: 'LTI' } }] });
    });

    it('navigates using the real position ID when "Ver proceso" is clicked', async () => {
        render(
            <MemoryRouter>
                <Positions />
            </MemoryRouter>
        );

        const verProcesoButtons = await screen.findAllByRole('button', { name: /ver proceso/i });
        await userEvent.click(verProcesoButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith('/position/42');
    });
});
