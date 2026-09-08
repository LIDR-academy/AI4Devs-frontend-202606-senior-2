import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { getInterviewFlowByPosition, getCandidatesByPosition } from '../services/positionService';
import { updateCandidateStage } from '../services/candidateService';
import KanbanColumn from './KanbanColumn';

type InterviewStep = {
    id: number;
    name: string;
    orderIndex: number;
};

type Candidate = {
    id: number;
    fullName: string;
    averageScore: number;
    currentInterviewStep: string;
    applicationId: number;
};

type Column = {
    id: string;
    stepId: number;
    title: string;
    candidates: Candidate[];
};

const CandidateStateView: React.FC = () => {
    const { positionId } = useParams<{ positionId: string }>();
    const navigate = useNavigate();
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!positionId) return;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch interview flow and candidates in parallel
                const [interviewFlowData, candidatesData] = await Promise.all([
                    getInterviewFlowByPosition(parseInt(positionId)),
                    getCandidatesByPosition(parseInt(positionId))
                ]);
                
                const steps = interviewFlowData.interviewFlow?.interviewSteps || [];
                
                // Initialize columns
                const initialColumns: Column[] = steps.map((step: InterviewStep) => ({
                    id: `column-${step.id}`,
                    stepId: step.id,
                    title: step.name,
                    candidates: []
                }));
                
                // Assign candidates to their respective columns
                candidatesData.forEach((candidate: Candidate) => {
                    const step = steps.find((s: InterviewStep) => s.name === candidate.currentInterviewStep);
                    if (step) {
                        const column = initialColumns.find(col => col.stepId === step.id);
                        if (column) {
                            column.candidates.push(candidate);
                        }
                    }
                });
                
                setColumns(initialColumns);
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [positionId]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id) return;
        
        const activeColumnId = (active.data.current as any)?.columnId;
        const overColumnId = over.id;
        
        if (activeColumnId && overColumnId.toString().startsWith('column-')) {
            const fromColumn = columns.find(col => col.id === activeColumnId);
            const toColumn = columns.find(col => col.id === overColumnId);
            
            if (!fromColumn || !toColumn) return;
            
            const candidateId = parseInt(active.id.toString());
            const candidate = fromColumn.candidates.find(c => c.id === candidateId);
            
            if (!candidate) return;
            
            try {
                // Find the interview step ID for the target column
                const toStepId = toColumn.stepId;
                
                // Update candidate stage in the database
                await updateCandidateStage(candidate.id, candidate.applicationId, toStepId);
                
                // Update local state
                const updatedColumns = columns.map(col => {
                    if (col.id === fromColumn.id) {
                        return {
                            ...col,
                            candidates: col.candidates.filter(c => c.id !== candidateId)
                        };
                    }
                    if (col.id === toColumn.id) {
                        return {
                            ...col,
                            candidates: [...col.candidates, candidate]
                        };
                    }
                    return col;
                });
                
                setColumns(updatedColumns);
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al actualizar el estado del candidato');
            }
        }
    }, [columns]);



    if (loading) {
        return (
            <Container className="mt-5">
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button onClick={() => navigate('/positions')} variant="primary">
                    Volver a Posiciones
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4" fluid>
            <Row className="mb-4">
                <Col xs={12} className="d-flex align-items-center">
                    <Button 
                        variant="link" 
                        onClick={() => navigate('/positions')}
                        className="p-0 me-3"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <h2>Estado de Candidatos</h2>
                </Col>
            </Row>
            
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToParentElement]}
            >
                <Row className="g-4">
                    {columns.map((column) => (
                        <Col 
                            key={column.id} 
                            xs={12} 
                            md={isMobile ? 12 : Math.max(3, Math.floor(12 / columns.length))}
                            className="mb-4"
                        >
                            <KanbanColumn 
                                id={column.id} 
                                title={column.title} 
                                candidates={column.candidates}
                                isMobile={isMobile}
                            />
                        </Col>
                    ))}
                </Row>
            </DndContext>
        </Container>
    );
};

export default CandidateStateView;