import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';

import { useThemeEffect } from '@/hooks/useThemeEffect';

import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';
import { About } from './About/About';
import { MapView } from './MapView/MapView';
import { Analysis } from './Analysis/Analysis';
import { Health } from './Health/Health';
import { PrivacyPolicy } from './Legal/PrivacyPolicy';
import { TermsOfService } from './Legal/TermsOfService';

function App() {
  useThemeEffect();

  return (
    <Router>
      <div className="app-container">

        <Header />

        <main className="app-main">
          <Routes>
            {/* 4 Main pages */}
            <Route path="/" element={<MapView />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/health" element={<Health />} />

            {/* Additional pages */}
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App