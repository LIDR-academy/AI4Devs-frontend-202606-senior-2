import React from 'react';
import {KanbanBoard} from './KanbanBoard';
import {candidates,flow} from './fixtures';
import '../PositionKanbanDetail.css';
export default {title:'LTI/Organisms/KanbanBoard',component:KanbanBoard,tags:['autodocs'],decorators:[(Story:React.ComponentType)=><div className="kanban-session"><Story/></div>],args:{steps:flow.interviewSteps,columns:Object.fromEntries(flow.interviewSteps.map(s=>[s.id,candidates.filter(c=>c.currentInterviewStep===s.name)])),disabled:false},argTypes:{onDragEnd:{action:'drag-end'}},parameters:{docs:{description:{component:'Organismo controlado: emite el gesto; no guarda. La página PositionKanbanDetail aplica el movimiento y persiste.'}}}};
export const Loaded={};
export const Disabled={args:{disabled:true}};
