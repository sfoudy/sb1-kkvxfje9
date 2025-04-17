import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Goal as GolfBall } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Competition from './pages/Competition';
import CreateCompetition from './pages/CreateCompetition';
import ArchivedCompetitions from './pages/ArchivedCompetitions';
import HowTo from './pages/HowTo';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/competition/new" element={<CreateCompetition />} />
          <Route path="/competition/:id" element={<Competition />} />
          <Route path="/archived" element={<ArchivedCompetitions />} />
          <Route path="/how-to" element={<HowTo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;