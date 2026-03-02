import { lazy, Suspense } from 'react';
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./contexts/ToastContext";
import './App.css';

const Landing       = lazy(() => import('./pages/Landing'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const Onboarding    = lazy(() => import('./pages/Onboarding'));
const Plans         = lazy(() => import('./pages/Plans'));
const Goals         = lazy(() => import('./pages/Goals'));
const Profile       = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings      = lazy(() => import('./pages/Settings'));
const Learning      = lazy(() => import('./pages/Learning'));
const Flashcards    = lazy(() => import('./pages/Flashcards'));
const Pomodoro      = lazy(() => import('./pages/Pomodoro'));
const Tests         = lazy(() => import('./pages/Tests'));
const Progress      = lazy(() => import('./pages/Progress'));

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

function RequireAuth({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/" /></SignedOut>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public route: Landing page */}
              <Route path="/" element={<HomeRoute />} />

              {/* Onboarding (no sidebar) */}
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Routes with sidebar layout */}
              <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route path="/dashboard"     element={<Dashboard />} />
                <Route path="/plans"         element={<Plans />} />
                <Route path="/learning"      element={<Learning />} />
                <Route path="/flashcards"    element={<Flashcards />} />
                <Route path="/pomodoro"      element={<Pomodoro />} />
                <Route path="/tests"         element={<Tests />} />
                <Route path="/goals"         element={<Goals />} />
                <Route path="/progress"      element={<Progress />} />
                <Route path="/profile"       element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings"      element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </ToastProvider>
  );
}

function HomeRoute() {
  return <Landing />;
}

export default App;
