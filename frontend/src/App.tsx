import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MobileLayout from './layouts/MobileLayout';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'sonner';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Pair from './pages/auth/Pair';
import Home from './pages/Home';
import Feed from './pages/feed/Feed';
import CheckInForm from './pages/checkin/CheckInForm';
import KudosCreate from './pages/kudos/KudosCreate';
import RepairDraft from './pages/repair/RepairDraft';
import Ritual from './pages/ritual/Ritual';
import Settings from './pages/settings/Settings';
import LoveMap from './pages/lovemap/LoveMap';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!user?.coupleId && window.location.pathname !== '/pair') return <Navigate to="/pair" />;
    return <>{children}</>;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-center" richColors />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<MobileLayout />}>
                        <Route path="/pair" element={<ProtectedRoute><Pair /></ProtectedRoute>} />
                        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                        <Route path="/checkin" element={<ProtectedRoute><CheckInForm /></ProtectedRoute>} />
                        <Route path="/kudos" element={<ProtectedRoute><KudosCreate /></ProtectedRoute>} />
                        <Route path="/repair" element={<ProtectedRoute><RepairDraft /></ProtectedRoute>} />
                        <Route path="/ritual" element={<ProtectedRoute><Ritual /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                        <Route path="/lovemap" element={<ProtectedRoute><LoveMap /></ProtectedRoute>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
