import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';

type PositionHeaderProps = {
  title: string;
};

const PositionHeader: React.FC<PositionHeaderProps> = ({ title }) => {
  return (
    <div className="position-header d-flex align-items-center gap-3 mb-4">
      <Link
        to="/positions"
        className="position-header-back"
        aria-label="Volver al listado de posiciones"
      >
        <ArrowLeft aria-hidden="true" />
      </Link>
      <h1 className="position-header-title mb-0">{title}</h1>
    </div>
  );
};

export default PositionHeader;
