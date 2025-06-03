import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import CampaignCreator from './components/Campaign/CampaignCreator';
import CampaignHistory from './components/Campaign/CampaignHistory';
import GoogleLogin from './components/Auth/GoogleLogin';
import { useAuth } from './context/AuthContext';
import CampaignEditor from './components/Campaign/CampaignEditor';
import { Box, CircularProgress } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <GoogleLogin />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <CampaignCreator />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <Layout>
            <CampaignHistory />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/campaigns/edit/:campaignId" element={
        <ProtectedRoute>
          <Layout>
            <CampaignEditor />
          </Layout>
        </ProtectedRoute>
      } />
      {/* Add catch-all route */}
      {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;