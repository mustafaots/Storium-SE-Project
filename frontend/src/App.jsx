import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ComingSoon from './pages/ComingSoon/ComingSoonPage';
import SettingsPage from './pages/Settings/SettingsPage';
import SchemaPage from './pages/Schema/SchemaPage';
import VisualisePage from './pages/Visualise/VisualisePage';
import SourcesPage from './pages/Sources/SourcesPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import ClientsPage from './pages/Clients/ClientsPage';
import RoutinesPage from './pages/Routines/RoutinesPage';
import ProductsPage from './pages/Products/ProductsPage';
import AlertsPage from './pages/Alerts/AlertsPage';
import MainPage from './pages/Main/MainPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/schema" element={<SchemaPage />} />
        <Route path="/visualise" element={<VisualisePage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
      </Routes>
    </Router>
  );
}

export default App;