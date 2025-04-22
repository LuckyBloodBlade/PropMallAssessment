import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Property from './pages/Property';
import Search from './pages/Search';
import "./responsive.css";
import "./main.css";
import 'rsuite/dist/rsuite.min.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/PropMallAssessment">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search/:location/:year/" element={<Home />} />
      <Route path="/search/:location/:year/:searchString" element={<Home />} />
      <Route path="/property/:slug" element={<Property />} />
    </Routes>
  </BrowserRouter>
);
