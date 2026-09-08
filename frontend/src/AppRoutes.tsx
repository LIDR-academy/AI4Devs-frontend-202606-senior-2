import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RecruiterDashboard from './components/RecruiterDashboard';
import AddCandidate from './components/AddCandidateForm';
import Positions from './components/Positions';
import Position from './components/Position';

// Separado de <BrowserRouter> (definido en App.js) para poder testear el
// árbol de rutas envuelto en un <MemoryRouter> en los tests de Jest.
//
// Nota: se creó como archivo .tsx propio (en vez de agregarlo dentro de
// App.js) porque TypeScript resuelve el import extensionless "./App" contra
// App.tsx (scaffolding sin usar de create-react-app), no contra App.js (el
// archivo que realmente se ejecuta en runtime). Definir las rutas aquí evita
// esa ambigüedad preexistente sin tocar App.tsx ni App.js.
const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<RecruiterDashboard />} />
    <Route path="/add-candidate" element={<AddCandidate />} />
    <Route path="/positions" element={<Positions />} />
    <Route path="/position/:id" element={<Position />} />
  </Routes>
);

export default AppRoutes;
