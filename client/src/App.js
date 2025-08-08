import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import CreatePoll from './pages/CreatePolls';
import ListPolls from './pages/ListPolls';
import VotePolls from './pages/VotePoll';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/polls" element={<CreatePoll />} />
        <Route path="/list-polls" element={<ListPolls />} />
        <Route path="/cast-vote" element={<VotePolls />} />
      </Routes>
    </Router>
  );
}

export default App;
