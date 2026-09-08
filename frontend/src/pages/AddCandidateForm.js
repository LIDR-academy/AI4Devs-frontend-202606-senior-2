import React, { useState } from 'react';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    SimpleGrid,
    Stack,
    Text,
} from '@chakra-ui/react';
import { Trash } from 'react-bootstrap-icons';
import FileUploader from '../components/FileUploader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Restyled from react-bootstrap to Chakra + theme tokens. State, handlers and the fetch call are unchanged
// (see CLAUDE.md > "Known debt" for the behaviours deliberately left as they were).

const fieldProps = {
    bg: 'bg.primary',
    borderColor: 'border.subdue',
    borderRadius: 'card',
    textStyle: 'bodyMd',
    color: 'text.primary',
    _placeholder: { color: 'text.subdue' },
};

const primaryButtonProps = {
    bg: 'cta.primary.base',
    color: 'text.primaryInverse',
    _hover: { bg: 'cta.primary.hover' },
    _active: { bg: 'cta.primary.pressed' },
    borderRadius: 'card',
    textStyle: 'bodyMdEmphasis',
};

const AddCandidateForm = () => {
    const [candidate, setCandidate] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        educations: [],
        workExperiences: [],
        cv: null
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e, index, section) => {
        const updatedSection = [...candidate[section]];
        if (updatedSection[index]) {
            updatedSection[index][e.target.name] = e.target.value;
            setCandidate({ ...candidate, [section]: updatedSection });
        }
    };

    const handleDateChange = (date, index, section, field) => {
        const updatedSection = [...candidate[section]];
        if (updatedSection[index]) {
            updatedSection[index][field] = date;
            setCandidate({ ...candidate, [section]: updatedSection });
        }
    };

    const handleAddSection = (section) => {
        const newSection = section === 'educations' ? { institution: '', title: '', startDate: '', endDate: '' } : { company: '', position: '', description: '', startDate: '', endDate: '' };
        setCandidate({ ...candidate, [section]: [...candidate[section], newSection] });
    };

    const handleRemoveSection = (index, section) => {
        const updatedSection = [...candidate[section]];
        updatedSection.splice(index, 1);
        setCandidate({ ...candidate, [section]: updatedSection });
    };

    const handleCVUpload = (fileData) => {
        setCandidate({ ...candidate, cv: fileData });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const candidateData = {
                ...candidate,
                cv: candidate.cv ? {
                    filePath: candidate.cv.filePath,
                    fileType: candidate.cv.fileType
                } : null
            };

            // Format date fields to YYYY-MM-DD before sending to the endpoint
            candidateData.educations = candidateData.educations.map(education => ({
                ...education,
                startDate: education.startDate ? education.startDate.toISOString().slice(0, 10) : '',
                endDate: education.endDate ? education.endDate.toISOString().slice(0, 10) : ''
            }));
            candidateData.workExperiences = candidateData.workExperiences.map(experience => ({
                ...experience,
                startDate: experience.startDate ? experience.startDate.toISOString().slice(0, 10) : '',
                endDate: experience.endDate ? experience.endDate.toISOString().slice(0, 10) : ''
            }));

            const res = await fetch('http://localhost:3010/candidates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(candidateData)
            });

            if (res.status === 201) {
                setSuccessMessage('Candidato añadido con éxito');
                setError('');
            } else if (res.status === 400) {
                const errorData = await res.json();
                throw new Error('Datos inválidos: ' + errorData.message);
            } else if (res.status === 500) {
                throw new Error('Error interno del servidor');
            } else {
                throw new Error('Error al enviar datos del candidato');
            }
        } catch (error) {
            setError('Error al añadir candidato: ' + error.message);
            setSuccessMessage('');
        }
    };

    const renderDatePicker = (selected, onChange, placeholderText) => (
        <DatePicker
            selected={selected}
            onChange={onChange}
            dateFormat="yyyy-MM-dd"
            placeholderText={placeholderText}
            customInput={<Input {...fieldProps} />}
        />
    );

    return (
        <Box bg="bg.tertiary" minH="100vh" p={{ base: 4, md: 12 }}>
            <Text as="h1" textStyle="title" color="text.primary" mb={6}>
                Agregar Candidato
            </Text>
            <Box as="form" onSubmit={handleSubmit} bg="bg.primary" borderRadius="card" boxShadow="card" p={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Stack spacing={4}>
                        <FormControl id="firstName" isRequired>
                            <FormLabel textStyle="bodySmEmphasis">Nombre</FormLabel>
                            <Input
                                type="text"
                                name="firstName"
                                onChange={(e) => setCandidate({ ...candidate, firstName: e.target.value })}
                                {...fieldProps}
                            />
                        </FormControl>
                        <FormControl id="lastName" isRequired>
                            <FormLabel textStyle="bodySmEmphasis">Apellido</FormLabel>
                            <Input
                                type="text"
                                name="lastName"
                                onChange={(e) => setCandidate({ ...candidate, lastName: e.target.value })}
                                {...fieldProps}
                            />
                        </FormControl>
                        <FormControl id="email" isRequired>
                            <FormLabel textStyle="bodySmEmphasis">Correo Electrónico</FormLabel>
                            <Input
                                type="email"
                                name="email"
                                onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
                                {...fieldProps}
                            />
                        </FormControl>
                        <FormControl id="phone">
                            <FormLabel textStyle="bodySmEmphasis">Teléfono</FormLabel>
                            <Input
                                type="tel"
                                name="phone"
                                onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
                                {...fieldProps}
                            />
                        </FormControl>
                        <FormControl id="address">
                            <FormLabel textStyle="bodySmEmphasis">Dirección</FormLabel>
                            <Input
                                type="text"
                                name="address"
                                onChange={(e) => setCandidate({ ...candidate, address: e.target.value })}
                                {...fieldProps}
                            />
                        </FormControl>
                    </Stack>
                    <Stack spacing={4} align="flex-start">
                        <FormControl id="cv">
                            <FormLabel textStyle="bodySmEmphasis">CV</FormLabel>
                            <FileUploader
                                onChange={handleCVUpload}
                                onUpload={handleCVUpload}
                            />
                        </FormControl>
                        <Button size="sm" onClick={() => handleAddSection('educations')} {...primaryButtonProps}>Añadir Educación</Button>
                        {candidate.educations.map((education, index) => (
                            <Stack key={index} spacing={2} w="full" align="flex-start">
                                <Input
                                    placeholder="Institución"
                                    name="institution"
                                    value={education.institution}
                                    onChange={(e) => handleInputChange(e, index, 'educations')}
                                    {...fieldProps}
                                />
                                <Input
                                    placeholder="Título"
                                    name="title"
                                    value={education.title}
                                    onChange={(e) => handleInputChange(e, index, 'educations')}
                                    {...fieldProps}
                                />
                                <SimpleGrid columns={2} spacing={2} w="full">
                                    {renderDatePicker(education.startDate, (date) => handleDateChange(date, index, 'educations', 'startDate'), 'Fecha de Inicio')}
                                    {renderDatePicker(education.endDate, (date) => handleDateChange(date, index, 'educations', 'endDate'), 'Fecha de Fin')}
                                </SimpleGrid>
                                <Button size="sm" leftIcon={<Trash />} bg="bg.critical" color="text.critical" borderRadius="card" textStyle="bodyMdEmphasis" onClick={() => handleRemoveSection(index, 'educations')}>
                                    Eliminar
                                </Button>
                            </Stack>
                        ))}
                        <Button size="sm" onClick={() => handleAddSection('workExperiences')} {...primaryButtonProps}>Añadir Experiencia Laboral</Button>
                        {candidate.workExperiences.map((experience, index) => (
                            <Stack key={index} spacing={2} w="full" align="flex-start">
                                <Input
                                    placeholder="Empresa"
                                    name="company"
                                    value={experience.company}
                                    onChange={(e) => handleInputChange(e, index, 'workExperiences')}
                                    {...fieldProps}
                                />
                                <Input
                                    placeholder="Puesto"
                                    name="position"
                                    value={experience.position}
                                    onChange={(e) => handleInputChange(e, index, 'workExperiences')}
                                    {...fieldProps}
                                />
                                <SimpleGrid columns={2} spacing={2} w="full">
                                    {renderDatePicker(experience.startDate, (date) => handleDateChange(date, index, 'workExperiences', 'startDate'), 'Fecha de Inicio')}
                                    {renderDatePicker(experience.endDate, (date) => handleDateChange(date, index, 'workExperiences', 'endDate'), 'Fecha de Fin')}
                                </SimpleGrid>
                                <Button size="sm" leftIcon={<Trash />} bg="bg.critical" color="text.critical" borderRadius="card" textStyle="bodyMdEmphasis" onClick={() => handleRemoveSection(index, 'workExperiences')}>
                                    Eliminar
                                </Button>
                            </Stack>
                        ))}
                    </Stack>
                </SimpleGrid>
                <Button type="submit" w="full" mt={6} {...primaryButtonProps}>Enviar</Button>
                {error && <Alert status="error" mt={4}><AlertIcon />{error}</Alert>}
                {successMessage && <Alert status="success" mt={4}><AlertIcon />{successMessage}</Alert>}
            </Box>
        </Box>
    );
};

export default AddCandidateForm;
