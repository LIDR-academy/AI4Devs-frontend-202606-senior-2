import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {DashboardActionCard} from './DashboardActionCard';
export default {title:'LTI/Molecules/DashboardActionCard',component:DashboardActionCard,tags:['autodocs'],decorators:[(Story:React.ComponentType)=><MemoryRouter><Story/></MemoryRouter>],args:{title:'Ver Posiciones',label:'Ir a Posiciones',href:'/positions'}};
export const Default={};
