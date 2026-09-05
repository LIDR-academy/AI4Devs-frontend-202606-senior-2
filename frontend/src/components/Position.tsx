import React from 'react';
import { useParams } from 'react-router-dom';

const Position: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return <div>Position {id}</div>;
};

export default Position;
