import React from 'react';
import {Button,Form,Spinner,Alert} from 'react-bootstrap';
export default {title:'LTI/Atoms/BootstrapPrimitives',parameters:{docs:{description:{component:'Primitivas Bootstrap usadas directamente por LTI. No se crea una segunda biblioteca de átomos.'}}}};
export const UsedVariants={render:()=> <div><Button>Acción</Button> <Button disabled>Desactivada</Button><Form.Label htmlFor="example">Nombre</Form.Label><Form.Control id="example"/><Spinner animation="border" role="status" aria-label="Cargando"/><Alert variant="danger">Error de ejemplo</Alert></div>};
