import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InquiryDetail from './components/InquiryDetail';
import UmlView from './components/UmlView';
import Login from './components/Login';
import InquiryList from './components/InquiryList';
import CustomerList from './components/CustomerList';
import ContractList from './components/ContractList';
import PickupList from './components/PickupList';
import ReportView from './components/ReportView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inquiries" element={<InquiryList />} />
        <Route path="/inquiries/:id" element={<InquiryDetail />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/contracts" element={<ContractList />} />
        <Route path="/pickups" element={<PickupList />} />
        <Route path="/reports" element={<ReportView />} />
        <Route path="/uml" element={<UmlView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
