import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
/** Navigation molecule with one interactive element, not a button nested in a link. */
export const DashboardActionCard = ({title,label,href}: {title:string;label:string;href:string}) => <Card className="shadow p-4"><h5 className="mb-4">{title}</h5><Link to={href} className="btn btn-primary btn-block">{label}</Link></Card>;
