import React from 'react';
import { Button, InputGroup, FormControl, Spinner, Alert } from 'react-bootstrap';
/** Controlled upload molecule. File selection and completed upload are distinct events. */
export const FileUploadField = ({fileName='', pending=false, uploaded=false, error='', onFileChange, onUpload}) => <div>
  <InputGroup className="mb-3"><FormControl id="cv" type="file" aria-label="Archivo CV" disabled={pending} onChange={e=>{const file=e.target.files?.[0];if(file)onFileChange(file);}}/><Button variant="outline-secondary" disabled={pending || !fileName} onClick={onUpload}>{pending ? <Spinner animation="border" role="status" aria-label="Subiendo archivo" size="sm"/> : 'Subir Archivo'}</Button></InputGroup>
  <p className="mb-0" style={{overflowWrap:'anywhere'}}>Selected file: {fileName}</p>
  {uploaded && <p role="status" className="mt-2">Archivo subido con éxito</p>}
  {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
</div>;
