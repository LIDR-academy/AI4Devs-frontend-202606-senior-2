export const positions=[{id:42,title:'Frontend Engineer',company:'LTI',deadline:'2026-12-31',status:'Abierto'}];
export const positionResponse={data:positions.map(p=>({id:p.id,title:p.title,company:{name:p.company},applicationDeadline:p.deadline,status:'Open'}))};
export const candidate={firstName:'Alex',lastName:'Demo',email:'alex@example.test',phone:'',address:'',cv:null,educations:[{institution:'Universidad demo',title:'Ingeniería',startDate:new Date('2020-01-15T12:00:00Z'),endDate:new Date('2024-01-15T12:00:00Z')}],workExperiences:[]};
export const submit=async()=>({status:201});
export const upload=async()=>({filePath:'/fixtures/demo.pdf',fileType:'application/pdf'});
