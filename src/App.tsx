import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ListWaste from './pages/ListWaste';
import WasteForecastPage from './pages/WasteForecast';
import AIProcessing from './pages/AIProcessing';
import Matches from './pages/Matches';
import AIChat from './pages/AIChat';
import Opportunities from './pages/Opportunities';
import FindMaterials from './pages/FindMaterials';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TradeHistory from './pages/TradeHistory';
import Messages from './pages/Messages';
import ImpactAnalytics from './pages/ImpactAnalytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MyDeals from './pages/MyDeals';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { AuthProvider, useAuth } from './context/AuthContext';

/* Protected Route wrapper */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Wait for Supabase to restore session before deciding auth state
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8F9FA',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #E5E7EB',
                    borderTopColor: '#10B981',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: '#6B7280', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading session…</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="/forgot-password" element={<AuthPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />

                    {/* Protected App Routes */}
                    <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route index element={<Dashboard />} />
                        <Route path="list-waste" element={<ListWaste />} />
                        <Route path="forecast" element={<WasteForecastPage />} />
                        <Route path="find" element={<FindMaterials />} />
                        <Route path="processing" element={<AIProcessing />} />
                        <Route path="matches" element={<Matches />} />
                        <Route path="chat" element={<AIChat />} />
                        <Route path="opportunities" element={<Opportunities />} />
                        <Route path="deals" element={<MyDeals />} />
                        <Route path="network" element={<TradeHistory />} />
                        <Route path="messages" element={<Messages />} />
                        <Route path="analytics" element={<ImpactAnalytics />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
