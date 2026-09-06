import React from 'react';
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

type Position = {
    // Matches the id of the seeded position in the backend, so "Ver proceso"
    // opens a pipeline that actually has data behind it.
    id: number;
    title: string;
    manager: string;
    deadline: string;
    status: 'Abierto' | 'Contratado' | 'Cerrado' | 'Borrador';
};

// Titles mirror the seeded positions so that a card and the board it opens name
// the same role. The ids are the real ones: 3 is the five-phase fixture and 4
// has no candidates at all, which is the only way to reach an empty board from
// the list.
const mockPositions: Position[] = [
    { id: 1, title: 'Senior Full-Stack Engineer', manager: 'John Doe', deadline: '2024-12-31', status: 'Abierto' },
    { id: 2, title: 'Data Scientist', manager: 'Jane Smith', deadline: '2024-11-15', status: 'Contratado' },
    { id: 3, title: 'Platform Engineer', manager: 'Alex Jones', deadline: '2024-07-31', status: 'Abierto' },
    { id: 4, title: 'Technical Writer', manager: 'Alex Jones', deadline: '2024-09-30', status: 'Borrador' }
];

const Positions: React.FC = () => {
    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Posiciones</h2>
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Control type="text" placeholder="Buscar por título" />
                </Col>
                <Col md={3}>
                    <Form.Control type="date" placeholder="Buscar por fecha" />
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">Estado</option>
                        <option value="open">Abierto</option>
                        <option value="filled">Contratado</option>
                        <option value="closed">Cerrado</option>
                        <option value="draft">Borrador</option>
                    </Form.Control>
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">Manager</option>
                        <option value="john_doe">John Doe</option>
                        <option value="jane_smith">Jane Smith</option>
                        <option value="alex_jones">Alex Jones</option>
                    </Form.Control>
                </Col>
            </Row>
            <Row>
                {mockPositions.map((position) => (
                    <Col md={4} key={position.id} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>{position.title}</Card.Title>
                                <Card.Text>
                                    <strong>Manager:</strong> {position.manager}<br />
                                    <strong>Deadline:</strong> {position.deadline}
                                </Card.Text>
                                <span className={`badge ${position.status === 'Abierto' ? 'bg-warning' : position.status === 'Contratado' ? 'bg-success' : position.status === 'Borrador' ? 'bg-secondary' : 'bg-warning'} text-white`}>
                                    {position.status}
                                </span>
                                <div className="d-flex justify-content-between mt-3">
                                    <Link to={`/positions/${position.id}`} className="btn btn-primary">Ver proceso</Link>
                                    <Button variant="secondary">Editar</Button>
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