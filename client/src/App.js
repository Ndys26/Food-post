// File: src/App.js
import './App.css'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import our page components
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import NotFoundPage from './components/NotFoundPage';
import Layout from './components/Layout';
import StallManagePage from './components/StallManagePage';
import PublicMenuPage from './components/PublicMenuPage';
import KitchenDashboard from './components/KitchenDashboard';
import ReportsPage from './components/ReportsPage';
import InventoryPage from './components/InventoryPage';
import OrderTrackerPage from './components/OrderTrackerPage';
import ModifierManagerPage from './components/ModifierManagerPage';

// <<< 1. Import our new StallSelectionPage >>>
import StallSelectionPage from './components/StallSelectionPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/login" element={<LoginPage />} />

        {/* This is the new Customer Homepage */}
        <Route path="/" element={<StallSelectionPage />} />

        <Route path="/stalls/:stallId" element={<PublicMenuPage />} />
        <Route path="/orders/:orderId" element={<OrderTrackerPage />} />


        {/* === PROTECTED ROUTES === */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stalls/:stallId/manage" element={<StallManagePage />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/modifiers" element={<ModifierManagerPage />} />
        </Route>
        
        
        {/* === CATCH-ALL ROUTE === */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
  );
}

export default App;