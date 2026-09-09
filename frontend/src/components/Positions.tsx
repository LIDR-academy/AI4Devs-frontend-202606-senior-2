import React, { useState } from 'react';
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PositionListItem } from '../types/position';

const mockPositions: PositionListItem[] = [
    { id: 1, title: 'Senior Backend Engineer', manager: 'John Doe', deadline: '2024-12-31', status: 'Abierto' },
    { id: 2, title: 'Junior Android Engineer', manager: 'Jane Smith', deadline: '2024-11-15', status: 'Contratado' },
    { id: 3, title: 'Product Manager', manager: 'Alex Jones', deadline: '2024-07-31', status: 'Borrador' }
];

const Positions: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [managerFilter, setManagerFilter] = useState('');

    const filteredPositions = mockPositions.filter((pos) => {
        const matchesSearch = pos.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || pos.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesManager = !managerFilter || pos.manager.toLowerCase().includes(managerFilter.toLowerCase());
        return matchesSearch && matchesStatus && matchesManager;
    });

    return (
        <Container className="mt-5 pb-5">
            <h2 className="text-center mb-4">Posiciones</h2>
            <Row className="mb-4">
                <Col md={4} className="mb-2">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por título"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col md={4} className="mb-2">
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Todos los Estados</option>
                        <option value="Abierto">Abierto</option>
                        <option value="Contratado">Contratado</option>
                        <option value="Cerrado">Cerrado</option>
                        <option value="Borrador">Borrador</option>
                    </Form.Select>
                </Col>
                <Col md={4} className="mb-2">
                    <Form.Select
                        value={managerFilter}
                        onChange={(e) => setManagerFilter(e.target.value)}
                    >
                        <option value="">Todos los Managers</option>
                        <option value="John Doe">John Doe</option>
                        <option value="Jane Smith">Jane Smith</option>
                        <option value="Alex Jones">Alex Jones</option>
                    </Form.Select>
                </Col>
            </Row>
            <Row>
                {filteredPositions.map((position) => (
                    <Col md={4} key={position.id} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="fw-bold">{position.title}</Card.Title>
                                <Card.Text className="text-muted flex-grow-1">
                                    <strong>Manager:</strong> {position.manager}<br />
                                    <strong>Deadline:</strong> {position.deadline}
                                </Card.Text>
                                <div>
                                    <span className={`badge ${position.status === 'Abierto' ? 'bg-primary' : position.status === 'Contratado' ? 'bg-success' : position.status === 'Borrador' ? 'bg-secondary' : 'bg-warning'} text-white`}>
                                        {position.status}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mt-3 gap-2">
                                    <Link to={`/positions/${position.id}`} className="btn btn-primary flex-grow-1" data-testid={`view-process-btn-${position.id}`}>
                                        Ver proceso
                                    </Link>
                                    <Button variant="outline-secondary">Editar</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                {filteredPositions.length === 0 && (
                    <Col xs={12} className="text-center py-5 text-muted">
                        No se encontraron posiciones con los filtros seleccionados.
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default Positions;