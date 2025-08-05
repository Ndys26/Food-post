// File: src/App.js
import './App.css'; 

// === THIS IS THE ONLY LINE YOU NEED TO CHANGE ===
// We are now using HashRouter, which is perfect for GitHub Pages.
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Import all your page components as before
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
// ... and all the rest of your components ...
import DashboardPage from './components/DashboardPage';
import StallSelectionPage from './components/StallSelectionPage';
import PublicMenuPage from './components/PublicMenuPage';
import OrderTrackerPage from './components/OrderTrackerPage';
import KitchenDashboard from './components/KitchenDashboard';
import ReportsPage from './components/ReportsPage';
import InventoryPage from './components/InventoryPage';
import ModifierManagerPage from './components/ModifierManagerPage';
import StallManagePage from './components/StallManagePage';
import Layout from './components/Layout';
import NotFoundPage from './components/NotFoundPage';


function App() {
  return (
    // <Router> is now our HashRouter
    <Router>
      <Routes>
        {/* === All your <Route> configurations below this line stay exactly the same === */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer" element={<StallSelectionPage />} />
        <Route path="/stalls/:stallId" element={<PublicMenuPage />} />
        <Route path="/orders/:orderId" element={<OrderTrackerPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stalls/:stallId/manage" element={<StallManagePage />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/modifiers" element={<ModifierManagerPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;