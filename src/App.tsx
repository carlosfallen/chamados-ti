import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TicketForm from './pages/TicketDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/TicketForm" element={<TicketForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
