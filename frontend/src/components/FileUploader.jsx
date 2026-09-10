import React, { useState } from 'react';
import { FileUploadField } from './candidates/FileUploadField';
export const uploadFile = async file => {
  const body=new FormData();body.append('file',file);
  const res=await fetch('http://localhost:3010/upload',{method:'POST',body});
  if(!res.ok) throw new Error('Error al subir archivo');
  return res.json();
};
/** Stateful adapter. Defaults to real HTTP; stories inject the upload service. */
const FileUploader=({onChange=()=>{},onUpload=()=>{},upload=uploadFile})=>{
 const [file,setFile]=useState(null),[pending,setPending]=useState(false),[uploaded,setUploaded]=useState(false),[error,setError]=useState('');
 const select=file=>{setFile(file);setUploaded(false);setError('');onChange(file);};
 const submit=async()=>{if(!file||pending)return;setPending(true);setError('');try{const data=await upload(file);setUploaded(true);onUpload(data);}catch(e){setUploaded(false);setError(e.message);}finally{setPending(false);}};
 return <FileUploadField fileName={file?.name || ''} pending={pending} uploaded={uploaded} error={error} onFileChange={select} onUpload={submit}/>;
};
export default FileUploader;
