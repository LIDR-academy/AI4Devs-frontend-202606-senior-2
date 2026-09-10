import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import RecruiterDashboard from './RecruiterDashboard';
export default {title:'LTI/Pages/RecruiterDashboard',component:RecruiterDashboard,tags:['autodocs'],decorators:[Story=><MemoryRouter><Story/></MemoryRouter>],parameters:{docs:{description:{component:'Página de entrada. Reutiliza DashboardActionCard y conserva los destinos reales.'}}}};
export const Default={};
