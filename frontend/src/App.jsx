import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ApiKeyProvider } from './ApiKeyContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chat from './pages/Chat.jsx';
import Journal from './pages/Journal.jsx';
import Assessment from './pages/Assessment.jsx';
import Breathing from './pages/Breathing.jsx';

export default function App() {
  return (
    <ApiKeyProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/breathing" element={<Breathing />} />
        </Route>
      </Routes>
    </ApiKeyProvider>
  );
}
