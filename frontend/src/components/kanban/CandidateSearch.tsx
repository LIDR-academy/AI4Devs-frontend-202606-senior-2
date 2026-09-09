import React, { useId, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';

export interface CandidateSearchProps {
    query: string;
    visibleCount: number;
    totalCount: number;
    disabled: boolean;
    onQueryChange: (value: string) => void;
}

export const CandidateSearch = ({ query, visibleCount, totalCount, disabled, onQueryChange }: CandidateSearchProps) => {
    const id = useId();
    const input = useRef<HTMLInputElement>(null);
    return (
        <div className="candidate-search mb-3">
            <Form.Label htmlFor={id}>Buscar candidatos</Form.Label>
            <div className="candidate-search-controls">
                <Form.Control id={id} ref={input} type="search" value={query} disabled={disabled}
                    aria-describedby={`${id}-count`} onChange={event => onQueryChange(event.target.value)} />
                <Button variant="outline-secondary" disabled={disabled} onClick={() => {
                    onQueryChange('');
                    input.current?.focus();
                }}>Limpiar búsqueda</Button>
            </div>
            <p id={`${id}-count`} aria-live="polite" className="text-muted small mt-2 mb-0">
                {visibleCount} de {totalCount} candidatos
            </p>
        </div>
    );
};
