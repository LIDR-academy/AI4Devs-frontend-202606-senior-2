import React, { useState } from 'react';
import FileUploader, { uploadFile } from './FileUploader';
import { CandidateFormView } from './candidates/CandidateFormView';
export const defaultCandidateServices = { upload: uploadFile, submit: candidateData => fetch('http://localhost:3010/candidates', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(candidateData)}) };

const AddCandidateForm = ({services=defaultCandidateServices, initialCandidate}) => {
    const [candidate, setCandidate] = useState(initialCandidate || {
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

            const res = await services.submit(candidateData);

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

    return <CandidateFormView candidate={candidate} onFieldChange={(key,value)=>setCandidate({...candidate,[key]:value})} handleInputChange={handleInputChange} handleDateChange={handleDateChange} handleAddSection={handleAddSection} handleRemoveSection={handleRemoveSection} handleSubmit={handleSubmit} error={error} successMessage={successMessage} uploadField={<FileUploader onChange={()=>setCandidate({...candidate,cv:null})} onUpload={handleCVUpload} upload={services.upload}/>}/>;
};
export default AddCandidateForm;
