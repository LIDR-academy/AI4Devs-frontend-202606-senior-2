import {FileUploadField} from './FileUploadField';
export default {title:'LTI/Molecules/FileUploadField',component:FileUploadField,tags:['autodocs'],args:{fileName:'',pending:false,uploaded:false,error:''},argTypes:{onFileChange:{action:'file-selected'},onUpload:{action:'upload-requested'}},parameters:{docs:{description:{component:'Vista controlada, sin HTTP. El adaptador FileUploader gestiona el archivo y llama al servicio.'}}}};
export const NoFile={};
export const Selected={args:{fileName:'demo.pdf'}};
export const Uploading={args:{fileName:'demo.pdf',pending:true}};
export const Success={args:{fileName:'demo.pdf',uploaded:true}};
export const Error={args:{fileName:'demo.pdf',error:'No se pudo subir el archivo'}};
