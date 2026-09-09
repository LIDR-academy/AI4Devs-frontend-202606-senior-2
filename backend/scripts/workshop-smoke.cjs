// Run only against the disposable workshop database documented in docs/sesion/revision.md.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { PrismaClient } = require('@prisma/client');
const url = new URL(process.env.DATABASE_URL || 'http://invalid');
assert.equal(url.hostname, '127.0.0.1');
assert.equal(url.port, '55439');
assert.equal(url.pathname, '/workshop');
const db = new PrismaClient();
let server;
(async () => {
  const company = await db.company.create({data:{name:`Workshop ${Date.now()}`}});
  const flow = await db.interviewFlow.create({data:{description:'Workshop search'}});
  const type = await db.interviewType.create({data:{name:'Workshop'}});
  const step = name => db.interviewStep.create({data:{name,orderIndex:name==='Inscritos'?1:2,interviewFlowId:flow.id,interviewTypeId:type.id}});
  const a = await step('Inscritos'), b = await step('Entrevista');
  const position = await db.position.create({data:{companyId:company.id,interviewFlowId:flow.id,title:'Workshop',description:'Synthetic',location:'Remote',jobDescription:'Synthetic'}});
  const records=[];
  for (const [firstName,lastName] of [['Alex','Demo'],['José','Pérez']]) {
    const candidate=await db.candidate.create({data:{firstName,lastName,email:`${firstName}.${Date.now()}@example.invalid`}});
    const application=await db.application.create({data:{candidateId:candidate.id,positionId:position.id,applicationDate:new Date(),currentInterviewStep:a.id}});
    records.push({candidate,application});
  }
  // Refuse to use any existing backend on this port.
  try { await fetch('http://localhost:3010'); throw new Error('Port 3010 already occupied'); }
  catch(e) { if(e.message==='Port 3010 already occupied') throw e; }
  server=spawn(process.execPath,['dist/index.js'],{cwd:require('node:path').resolve(__dirname,'..'),env:process.env,stdio:'ignore'});
  let ready=false;
  for(let i=0;i<50;i++) { try { const r=await fetch('http://localhost:3010'); if(r.ok){ready=true;break;} } catch{} await new Promise(r=>setTimeout(r,100)); }
  assert.ok(ready,'Backend starts');
  const get = async path => {const r=await fetch('http://localhost:3010'+path);assert.equal(r.status,200);return r.json();};
  const initial=await get(`/position/${position.id}/candidates`);
  assert.equal(initial.length,2);
  const interview=await get(`/position/${position.id}/interviewflow`);
  assert.equal(interview.interviewFlow.interviewFlow.interviewSteps.length,2);
  const jose=records[1],alex=records[0];
  const moved=await fetch(`http://localhost:3010/candidates/${jose.candidate.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({applicationId:jose.application.id,currentInterviewStep:b.id})});
  assert.equal(moved.status,200);
  assert.equal((await db.application.findUnique({where:{id:jose.application.id}})).currentInterviewStep,b.id);
  assert.equal((await db.application.findUnique({where:{id:alex.application.id}})).currentInterviewStep,a.id);
  const reloaded=await get(`/position/${position.id}/candidates`);
  assert.equal(reloaded.find(c=>c.id===jose.candidate.id).currentInterviewStep,'Entrevista');
  const rejected=await fetch(`http://localhost:3010/candidates/${jose.candidate.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({applicationId:alex.application.id,currentInterviewStep:b.id})});
  assert.equal(rejected.status,404);
  assert.equal((await db.application.findUnique({where:{id:alex.application.id}})).currentInterviewStep,a.id);
  console.log('PASS: real API loads both candidates, persists José only, reloads state and rejects mismatched identity.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(server)server.kill();await db.$disconnect();});
