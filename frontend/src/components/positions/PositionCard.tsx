import React from 'react';
import { Card, Button } from 'react-bootstrap';
export type Position = {
    id: number;
    title: string;
    company: string;
    deadline: string;
    status: 'Abierto' | 'Contratado' | 'Cerrado' | 'Borrador';
};


/** Position summary. Emits the real position ID; does not navigate or fetch. */
export const PositionCard = ({position,onOpen}: {position: Position; onOpen: (id: number) => void}) => (
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
                                    <Button variant="primary" onClick={() => onOpen(position.id)}>
                                        Ver proceso
                                    </Button>

                                </div>
                            </Card.Body>
                        </Card>
);
