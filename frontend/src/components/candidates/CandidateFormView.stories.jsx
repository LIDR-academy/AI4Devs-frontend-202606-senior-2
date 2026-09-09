import React from 'react';
import {CandidateFormView} from './CandidateFormView';
import {FileUploadField} from './FileUploadField';
import {candidate} from '../catalog-fixtures';
export default {title:'LTI/Organisms/CandidateFormView',component:CandidateFormView,tags:['autodocs'],args:{candidate,uploadField:<FileUploadField fileName="demo.pdf" onFileChange={()=>{}} onUpload={()=>{}}/>},argTypes:Object.fromEntries(['onFieldChange','handleInputChange','handleDateChange','handleAddSection','handleRemoveSection','handleSubmit'].map(name=>[name,{action:name}])) ,parameters:{docs:{description:{component:'Organismo controlado. Emite cambios de campos, secciones, fechas y envío. No conserva estado ni llama servicios; la página aplica los eventos. Upload es un slot de composición.'}}}};
export const Prefilled={args:{handleSubmit:e=>e.preventDefault()}};
