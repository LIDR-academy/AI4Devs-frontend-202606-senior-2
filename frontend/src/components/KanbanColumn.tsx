import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CandidateCard from './CandidateCard';

type Candidate = {
    id: number;
    fullName: string;
    averageScore: number;
    currentInterviewStep: string;
    applicationId: number;
    columnId?: string;
};

type KanbanColumnProps = {
    id: string;
    title: string;
    candidates: Candidate[];
    isMobile: boolean;
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, candidates, isMobile }) => {
    const { setNodeRef } = useDroppable({
        id,
        data: { columnId: id }
    });

    return (
        <div ref={setNodeRef} className="h-100">
            <Card className="h-100 shadow-sm">
                <Card.Header className="bg-light">
                    <h5 className="mb-0 d-flex align-items-center">
                        {title}
                        <Badge bg="primary" className="ms-2">
                            {candidates.length}
                        </Badge>
                    </h5>
                </Card.Header>
                <Card.Body className="p-2">
                    <SortableContext
                        id={id}
                        items={candidates.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div 
                            className="d-flex flex-column gap-2"
                            style={{
                                minHeight: '100px',
                                height: isMobile ? 'auto' : 'calc(100vh - 200px)'
                            }}
                        >
                            {candidates.length > 0 ? (
                                candidates.map((candidate) => (
                                    <CandidateCard 
                                        key={candidate.id}
                                        id={candidate.id}
                                        fullName={candidate.fullName}
                                        averageScore={candidate.averageScore}
                                        columnId={id}
                                    />
                                ))
                            ) : (
                                <div className="text-muted text-center py-4">
                                    No hay candidatos en esta etapa
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </Card.Body>
            </Card>
        </div>
    );
};

export default KanbanColumn;