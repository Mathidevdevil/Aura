import React, { useState } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProcessList } from './components/processes/ProcessList';
import { DailyTimelineView } from './components/timeline/DailyTimelineView';
import { GoalList } from './components/goals/GoalList';
import { DeadlineTrackerView } from './components/deadlines/DeadlineTrackerView';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AIAdvisorView } from './components/ai/AIAdvisorView';
import { ActivityHistoryView } from './components/history/ActivityHistoryView';

// Modals
import { ProcessModal } from './components/processes/ProcessModal';
import { GoalModal } from './components/goals/GoalModal';
import { MilestoneModal } from './components/goals/MilestoneModal';
import { GoalDetailModal } from './components/goals/GoalDetailModal';
import { CommandPalette } from './components/ai/CommandPalette';
import { RemindersModal } from './components/ai/RemindersModal';
import { WelcomeModal } from './components/onboarding/WelcomeModal';

// Auth Pages & Guards
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { AccountSettingsPage } from './pages/settings/AccountSettingsPage';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/RouteGuards';

const MainLayout: React.FC = () => {
  const { activeTab } = useTracker();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isSettings = location.pathname.startsWith('/settings');

  const renderActiveView = () => {
    if (isSettings) {
      return <AccountSettingsPage />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'processes':
        return <ProcessList />;
      case 'timeline':
        return <DailyTimelineView />;
      case 'goals':
        return <GoalList />;
      case 'deadlines':
        return <DeadlineTrackerView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'advisor':
        return <AIAdvisorView />;
      case 'history':
        return <ActivityHistoryView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex text-[var(--ink)] bg-[var(--paper)]">
      
      {/* 1. Left Sidebar (250px, sticky, 2px ink right border, paper background) */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Right Content Area: Top tools row + Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. Top tools row (right-aligned) */}
        <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Viewport content area */}
        <main className="flex-1 p-4 md-custom:p-10 max-w-[1240px] w-full min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Overlays */}
      <ProcessModal />
      <GoalModal />
      <MilestoneModal />
      <GoalDetailModal />
      <CommandPalette />
      <RemindersModal />
      <WelcomeModal />

    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TrackerProvider>
          <Routes>
            {/* Public-Only Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignupPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPasswordPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicOnlyRoute>
                  <ResetPasswordPage />
                </PublicOnlyRoute>
              }
            />

            {/* Email Verification Route */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/account"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TrackerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
