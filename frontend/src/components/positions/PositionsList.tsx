import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { PositionCard, Position } from './PositionCard';
/** Presentation of loaded positions. Page owns loading and navigation. */
export const PositionsList = ({positions,onOpen}: {positions: Position[];onOpen:(id:number)=>void}) => <Row>{positions.map(position=><Col md={4} key={position.id} className="mb-4"><PositionCard position={position} onOpen={onOpen}/></Col>)}</Row>;
