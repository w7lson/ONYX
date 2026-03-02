import { lazy, Suspense } from 'react';
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import GuestRestrictionOverlay from "./components/GuestRestrictionOverlay";
import ErrorBoundary from "./components/ErrorBoundary";
import { useGuest } from "./contexts/GuestContext";
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

function AuthOrGuest({ children, guestAllowed = false, publicAllowed = false }) {
  const { isGuest } = useGuest();

  if (isGuest && guestAllowed) return children;
  if (isGuest && !guestAllowed) return <GuestRestrictionOverlay />;
  if (publicAllowed) return children;

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/" /></SignedOut>
    </>
  );
}

function LayoutGuard() {
  const { isGuest } = useGuest();

  if (isGuest) return <AppLayout />;

  return (
    <>
      <SignedIn><AppLayout /></SignedIn>
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
              <Route
                path="/"
                element={<HomeRoute />}
              />

              {/* Onboarding (no sidebar) — allowed for guests */}
              <Route
                path="/onboarding"
                element={
                  <AuthOrGuest guestAllowed publicAllowed>
                    <Onboarding />
                  </AuthOrGuest>
                }
              />

              {/* Routes with sidebar layout */}
              <Route element={<LayoutGuard />}>
                <Route path="/dashboard"     element={<AuthOrGuest guestAllowed><Dashboard /></AuthOrGuest>} />
                <Route path="/plans"         element={<AuthOrGuest guestAllowed><Plans /></AuthOrGuest>} />
                <Route path="/learning"      element={<AuthOrGuest guestAllowed><Learning /></AuthOrGuest>} />
                <Route path="/flashcards"    element={<AuthOrGuest><Flashcards /></AuthOrGuest>} />
                <Route path="/pomodoro"      element={<AuthOrGuest><Pomodoro /></AuthOrGuest>} />
                <Route path="/tests"         element={<AuthOrGuest><Tests /></AuthOrGuest>} />
                <Route path="/goals"         element={<AuthOrGuest><Goals /></AuthOrGuest>} />
                <Route path="/progress"      element={<AuthOrGuest><Progress /></AuthOrGuest>} />
                <Route path="/profile"       element={<AuthOrGuest><Profile /></AuthOrGuest>} />
                <Route path="/notifications" element={<AuthOrGuest><Notifications /></AuthOrGuest>} />
                <Route path="/settings"      element={<AuthOrGuest guestAllowed><Settings /></AuthOrGuest>} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </ToastProvider>
  );
}

function HomeRoute() {
  const { isGuest } = useGuest();
  if (isGuest) return <Navigate to="/dashboard" />;

  return (
    <>
      <SignedIn><Navigate to="/dashboard" /></SignedIn>
      <SignedOut><Landing /></SignedOut>
    </>
  );
}

export default App;
