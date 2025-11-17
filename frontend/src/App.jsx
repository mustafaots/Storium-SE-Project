import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/Main/MainPage';
import ComingSoon from './pages/ComingSoon/ComingSoonPage';
import Settings from './pages/Settings/SettingsPage';
import HomePage from './pages/Home/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;