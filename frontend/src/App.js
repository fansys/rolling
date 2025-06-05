import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import UserManagePage from './pages/UserManagePage';
import ClassManagePage from './pages/ClassManagePage';
import StudentManagePage from './pages/StudentManagePage';
import RollCallPage from './pages/RollCallPage';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 登录页面路由组件
const LoginRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/rollcall" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute><LoginPage /></LoginRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserManagePage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentManagePage /></ProtectedRoute>} />
      <Route path="/rollcall" element={<ProtectedRoute><RollCallPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/rollcall" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;