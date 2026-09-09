import React, { useEffect, useState } from 'react';
import { Alert, Spinner, Card, Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type Position = {
    id: number;
    title: string;
    company: string;
    deadline: string;
    status: 'Abierto' | 'Contratado' | 'Cerrado' | 'Borrador';
};

const Positions: React.FC = () => {
    const navigate = useNavigate();
    const [positions, setPositions] = useState<Position[]>([]);
    const [status, setStatus] = useState('loading');
    useEffect(() => {
        let active = true;
        axios.get('http://localhost:3010/position').then(({ data }) => {
            if (!active) return;
            setPositions(data.map((p: { id: number; title: string; status: string; applicationDeadline: string | null; company: { name: string } }) => ({
                id: p.id, title: p.title, company: p.company.name,
                deadline: p.applicationDeadline?.slice(0, 10) ?? 'Sin fecha',
                status: ({ Open: 'Abierto', Closed: 'Cerrado', Draft: 'Borrador', Filled: 'Contratado' } as Record<string, Position['status']>)[p.status] ?? 'Borrador',
            })));
            setStatus('loaded');
        }).catch(() => { if (active) setStatus('error'); });
        return () => { active = false; };
    }, []);

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Posiciones</h2>
            <Row>
                {status === 'loading' && <Spinner role="status" aria-label="Cargando posiciones" />}
                {status === 'error' && <Alert variant="danger">No se pudieron cargar las posiciones. Comprueba el backend.</Alert>}
                {status === 'loaded' && positions.length === 0 && <p>No hay posiciones disponibles.</p>}
                {positions.map((position) => (
                    <Col md={4} key={position.id} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>{position.title}</Card.Title>
                                <Card.Text>
                                    <strong>Empresa:</strong> {position.company}<br />
                                    <strong>Deadline:</strong> {position.deadline}
                                </Card.Text>
                                <span className={`badge ${position.status === 'Abierto' ? 'bg-warning' : position.status === 'Contratado' ? 'bg-success' : position.status === 'Borrador' ? 'bg-secondary' : 'bg-warning'} text-white`}>
                                    {position.status}
                                </span>
                                <div className="d-flex justify-content-between mt-3">
                                    <Button variant="primary" onClick={() => navigate(`/position/${position.id}`)}>
                                        Ver proceso
                                    </Button>

                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Positions;
