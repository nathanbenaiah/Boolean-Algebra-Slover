import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Layout from './components/Layout';
import { AdvancedBooleanSolver } from './components/AdvancedBooleanSolver';
import Home from './pages/Home';
import FeaturesPage from './pages/FeaturesPage';

import GuidePage from './pages/GuidePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NumberSystemPage from './pages/NumberSystemPage';
import KMapSimplifierPage from './pages/KMapSimplifierPage';
import SimpleDFDEditor from './pages/SimpleDFDEditor';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/features" element={<Layout><FeaturesPage /></Layout>} />
          <Route path="/comprehensive-solver" element={<Layout><AdvancedBooleanSolver /></Layout>} />
          <Route path="/number-systems" element={<Layout><NumberSystemPage /></Layout>} />
          <Route path="/kmap-simplifier" element={<Layout><KMapSimplifierPage /></Layout>} />
          <Route path="/dfd-editor" element={<SimpleDFDEditor />} />
          <Route path="/guide" element={<Layout><GuidePage /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
          <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;