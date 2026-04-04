import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ElectionList from './pages/voter/ElectionList';
import VotingBooth from './pages/voter/VotingBooth';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  // Determine default redirect
  const defaultPath = user
    ? user.role === 'admin' ? '/admin' : '/elections'
    : '/login';

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to={defaultPath} replace /> : <Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />

        {/* Voter routes */}
        <Route path="/elections" element={
          <ProtectedRoute role="voter"><ElectionList /></ProtectedRoute>
        } />
        <Route path="/elections/:id" element={
          <ProtectedRoute role="voter"><VotingBooth /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
