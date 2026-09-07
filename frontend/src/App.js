import React from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecruiterDashboard from './components/RecruiterDashboard';
import AddCandidate from './components/AddCandidateForm'; 
import Positions from './pages/Positions';
import Foundations from './pages/Foundations';
import PositionDetail from './pages/PositionDetail';
import { theme } from './theme';

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RecruiterDashboard />} />
          <Route path="/add-candidate" element={<AddCandidate />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/positions/:id" element={<PositionDetail />} />
          <Route path="/foundations" element={<Foundations />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;