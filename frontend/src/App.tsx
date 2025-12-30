import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';

import { useThemeEffect } from '@/hooks/useThemeEffect';

import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';
import { Dashboard } from './Dashboard/Dashboard';
import { About } from './About/About';
import { MapView } from './MapView/MapView';
import { Analysis } from './Analysis/Analysis';
import { Health } from './Health/Health';

function App() {
  useThemeEffect();

  return (
    <Router>
      <div className="app-container">

        <Header />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/health" element={<Health />} />
          {/* About us section (if needed) */}
          <Route path="/about" element={<About />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App