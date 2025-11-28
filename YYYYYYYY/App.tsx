
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SkillAssessmentPage from './pages/SkillAssessmentPage';
import PortfolioPage from './pages/PortfolioPage';
import UploadPage from './pages/UploadPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MentorDashboard from './pages/MentorDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import ProtectedRoute from './components/ProtectedRoute';
import MentorProtectedRoute from './components/MentorProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import UserPortfolioPage from './pages/UserPortfolioPage';
import PortfolioGalleryPage from './pages/PortfolioGalleryPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <HashRouter>
          <Main />
        </HashRouter>
      </PortfolioProvider>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/portfolios" element={<PortfolioGalleryPage />} />
          <Route path="/portfolio/user/:username" element={<UserPortfolioPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/assessment" element={
              <UserProtectedRoute>
                <SkillAssessmentPage />
              </UserProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <UserProtectedRoute>
                <PortfolioPage />
              </UserProtectedRoute>
            } />
            <Route path="/upload" element={
              <UserProtectedRoute>
                <UploadPage />
              </UserProtectedRoute>
            } />
            <Route path="/analytics" element={
              <UserProtectedRoute>
                <AnalyticsPage />
              </UserProtectedRoute>
            } />
            <Route path="/mentor" element={
              <MentorProtectedRoute>
                <MentorDashboard />
              </MentorProtectedRoute>
            } />
          </Route>
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}


export default App;
