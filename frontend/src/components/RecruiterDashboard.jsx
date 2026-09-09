import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { DashboardActionCard } from './dashboard/DashboardActionCard';
import logo from '../assets/lti-logo.png'; // Ruta actualizada para importar desde src/assets

const RecruiterDashboard = () => {
    return (
        <Container className="mt-5">
            <div className="text-center"> {/* Contenedor para el logo */}
                <img src={logo} alt="LTI Logo" style={{ width: '150px' }} />
            </div>
            <h1 className="mb-4 text-center">Dashboard del Reclutador</h1>
            <Row>
                <Col md={6}>
                    <DashboardActionCard title="Añadir Candidato" label="Añadir Nuevo Candidato" href="/add-candidate" />
                </Col>
                <Col md={6}>
                    <DashboardActionCard title="Ver Posiciones" label="Ir a Posiciones" href="/positions" />
                </Col>
            </Row>
        </Container>
    );
};

export default RecruiterDashboard;