import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ComingSoon from './pages/ComingSoon/ComingSoonPage';
import SchemaPage from './pages/Schema/SchemaPage';
import VisualisePage from './pages/Visualise/VisualisePage';
import SourcesPage from './pages/Sources/SourcesPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import ClientsPage from './pages/Clients/ClientsPage';
import RoutinesPage from './pages/Routines/RoutinesPage';
import ProductsPage from './pages/Products/ProductsPage';
import AlertsPage from './pages/Alerts/AlertsPage';
import MainPage from './pages/Main/MainPage';
import LocationsPage from './pages/Schema/Subpages/Locations/LocationsPage.jsx';
import DepotsPage from './pages/Schema/Subpages/Depots/DepotsPage.jsx';
import AislesPage from './pages/Schema/Subpages/Aisles/AislesPage.jsx';
import RacksPage from './pages/Schema/Subpages/Racks/RacksPage.jsx';
import RackDetailPage from './pages/Schema/Subpages/Racks/RackDetailPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} /> 
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/schema" element={<SchemaPage />} />
        <Route path="/visualise" element={<VisualisePage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/locations/:locationId/depots" element={<DepotsPage />} />
        <Route path="/locations/:locationId/depots/:depotId/aisles" element={<AislesPage />} />
        <Route path="/locations/:locationId/depots/:depotId/aisles/:aisleId/racks" element={<RacksPage />} />
        <Route path="/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId" element={<RackDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;