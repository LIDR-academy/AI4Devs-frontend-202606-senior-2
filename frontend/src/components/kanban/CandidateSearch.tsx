import React, { useRef } from 'react';
import { Button, Form } from 'react-bootstrap';

export interface CandidateSearchProps {
    query: string;
    visibleCount: number;
    totalCount: number;
    disabled: boolean;
    onQueryChange: (value: string) => void;
}

// Molecule: controlled input and feedback, independent of routing, data fetching and DnD.
export const CandidateSearch = ({ query, visibleCount, totalCount, disabled, onQueryChange }: CandidateSearchProps) => {
    const searchRef = useRef<HTMLInputElement>(null);
    return (
            <div className="kanban-search mb-3">
                <Form.Label htmlFor="candidate-search">Buscar candidatos</Form.Label>
                <div className="d-flex gap-2">
                    <Form.Control id="candidate-search" ref={searchRef} type="search" value={query}
                        placeholder="Nombre del candidato" disabled={disabled}
                        onChange={event => onQueryChange(event.target.value)} aria-describedby="candidate-search-results" />
                    <Button variant="outline-secondary" disabled={!query || disabled}
                        onClick={() => { onQueryChange(''); searchRef.current?.focus(); }}>Limpiar búsqueda</Button>
                </div>
                <div id="candidate-search-results" aria-label="Resultados de búsqueda" aria-live="polite" className="text-secondary mt-2">
                    {visibleCount} de {totalCount} candidatos
                </div>
                {totalCount > 0 && visibleCount === 0 && <p className="mt-2 mb-0">No hay candidatos que coincidan con la búsqueda.</p>}
                {totalCount === 0 && <p className="mt-2 mb-0">Esta posición todavía no tiene candidatos.</p>}
            </div>
    );
};
