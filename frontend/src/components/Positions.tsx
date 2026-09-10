import React, { useEffect, useState } from 'react';
import { Alert, Spinner, Container } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { PositionsList } from './positions/PositionsList';
import { Position } from './positions/PositionCard';
export const defaultPositionsServices = { list: () => axios.get('http://localhost:3010/position') };

const Positions = ({ services = defaultPositionsServices }) => {
    const navigate = useNavigate();
    const [positions, setPositions] = useState<Position[]>([]);
    const [status, setStatus] = useState('loading');
    useEffect(() => {
        let active = true;
        services.list().then(({ data }) => {
            if (!active) return;
            setPositions(data.map((p: { id: number; title: string; status: string; applicationDeadline: string | null; company: { name: string } }) => ({
                id: p.id, title: p.title, company: p.company.name,
                deadline: p.applicationDeadline?.slice(0, 10) ?? 'Sin fecha',
                status: ({ Open: 'Abierto', Closed: 'Cerrado', Draft: 'Borrador', Filled: 'Contratado' } as Record<string, Position['status']>)[p.status] ?? 'Borrador',
            })));
            setStatus('loaded');
        }).catch(() => { if (active) setStatus('error'); });
        return () => { active = false; };
    }, [services]);

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Posiciones</h2>
            <div>
                {status === 'loading' && <Spinner role="status" aria-label="Cargando posiciones" />}
                {status === 'error' && <Alert variant="danger">No se pudieron cargar las posiciones. Comprueba el backend.</Alert>}
                {status === 'loaded' && positions.length === 0 && <p>No hay posiciones disponibles.</p>}
                {status === 'loaded' && <PositionsList positions={positions} onOpen={id => navigate(`/position/${id}`)}/>}
            </div>
        </Container>
    );
};

export default Positions;
