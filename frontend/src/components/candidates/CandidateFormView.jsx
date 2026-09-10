import React from 'react';
import { Form, Button, Alert, FormControl, Card, Container, Row, Col } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './catalog.css';
/** Controlled form organism. Owns no services or domain state. Upload is a composition slot. */
export const CandidateFormView = ({candidate,onFieldChange,handleInputChange,handleDateChange,handleAddSection,handleRemoveSection,handleSubmit,error='',successMessage='',uploadField}) => {
    return (
        <Container className="mt-5">
            <h1 className="mb-4">Agregar Candidato</h1>
            <Card className="shadow p-4">
                <Form onSubmit={handleSubmit}>
                    <span id="start-date-label" className="visually-hidden">Fecha de Inicio</span><span id="end-date-label" className="visually-hidden">Fecha de Fin</span>
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="firstName">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={candidate.firstName}
                                    required
                                    onChange={(e) => onFieldChange('firstName', e.target.value)}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="lastName">
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={candidate.lastName}
                                    required
                                    onChange={(e) => onFieldChange('lastName', e.target.value)}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="email">
                                <Form.Label>Correo Electrónico</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={candidate.email}
                                    required
                                    onChange={(e) => onFieldChange('email', e.target.value)}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="phone">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={candidate.phone}
                                    onChange={(e) => onFieldChange('phone', e.target.value)}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="address">
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={candidate.address}
                                    onChange={(e) => onFieldChange('address', e.target.value)}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="cv">
                                <Form.Label>CV</Form.Label>
                                {uploadField}
                            </Form.Group>
                            <Row className="mt-4">
                                <Button onClick={() => handleAddSection('educations')} className="btn btn-primary btn-sm mr-2">Añadir Educación</Button>
                            </Row>
                            {candidate.educations.map((education, index) => (
                                <div key={index} className="mb-3">
                                    <Row className="mt-4">
                                        <Col md={6}>
                                            <FormControl
                                                aria-label="Institución" placeholder="Institución"
                                                name="institution"
                                                value={education.institution}
                                                onChange={(e) => handleInputChange(e, index, 'educations')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={6}>
                                            <FormControl
                                                aria-label="Título" placeholder="Título"
                                                name="title"
                                                value={education.title}
                                                onChange={(e) => handleInputChange(e, index, 'educations')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={6}>
                                            <DatePicker
                                                selected={education.startDate || null}
                                                onChange={(date) => handleDateChange(date, index, 'educations', 'startDate')}
                                                dateFormat="yyyy-MM-dd"
                                                ariaLabelledBy="start-date-label" placeholderText="Fecha de Inicio"
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <DatePicker
                                                selected={education.endDate || null}
                                                onChange={(date) => handleDateChange(date, index, 'educations', 'endDate')}
                                                dateFormat="yyyy-MM-dd"
                                                ariaLabelledBy="end-date-label" placeholderText="Fecha de Fin"
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Button variant="danger" onClick={() => handleRemoveSection(index, 'educations')} className="mt-2">
                                        <Trash /> Eliminar
                                    </Button>
                                </div>
                            ))}
                            <Row className="mt-4">
                                <Button onClick={() => handleAddSection('workExperiences')} className="btn btn-primary btn-sm mr-2">Añadir Experiencia Laboral</Button>
                            </Row>
                            {candidate.workExperiences.map((experience, index) => (
                                <div key={index} className="mb-3">
                                    <Row className="mt-4">
                                        <Col md={6}>
                                            <FormControl
                                                aria-label="Empresa" placeholder="Empresa"
                                                name="company"
                                                value={experience.company}
                                                onChange={(e) => handleInputChange(e, index, 'workExperiences')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={6}>
                                            <FormControl
                                                aria-label="Puesto" placeholder="Puesto"
                                                name="position"
                                                value={experience.position}
                                                onChange={(e) => handleInputChange(e, index, 'workExperiences')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={6}>
                                            <DatePicker
                                                selected={experience.startDate || null}
                                                onChange={(date) => handleDateChange(date, index, 'workExperiences', 'startDate')}
                                                dateFormat="yyyy-MM-dd"
                                                ariaLabelledBy="start-date-label" placeholderText="Fecha de Inicio"
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <DatePicker
                                                selected={experience.endDate || null}
                                                onChange={(date) => handleDateChange(date, index, 'workExperiences', 'endDate')}
                                                dateFormat="yyyy-MM-dd"
                                                ariaLabelledBy="end-date-label" placeholderText="Fecha de Fin"
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Button variant="danger" onClick={() => handleRemoveSection(index, 'workExperiences')} className="mt-2">
                                        <Trash /> Eliminar
                                    </Button>
                                </div>
                            ))}
                        </Col>
                    </Row>
                    <Button type="submit" className="btn btn-primary btn-block shadow-sm mt-5">Enviar</Button>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}
                </Form>
            </Card>
        </Container>
    );
};
