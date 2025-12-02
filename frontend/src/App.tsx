import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';

import { useThemeEffect } from '@/hooks/useThemeEffect';

import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';
import { Dashboard } from './Dashboard/Dashboard';
import { About } from './About/About';

function App() {
  useThemeEffect();

  return (
    <Router>
      <div className="app-container">

        <Header />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* About us section (if needed) */}
          <Route path="/about" element={<About />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App