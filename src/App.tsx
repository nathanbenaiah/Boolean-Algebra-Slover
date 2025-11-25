import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
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
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/comprehensive-solver" element={<AdvancedBooleanSolver />} />
          <Route path="/number-systems" element={<NumberSystemPage />} />
          <Route path="/kmap-simplifier" element={<KMapSimplifierPage />} />
          <Route path="/dfd-editor" element={<SimpleDFDEditor />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;