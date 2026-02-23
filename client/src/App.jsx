import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Plans from "./pages/Plans";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Learning from "./pages/Learning";
import Flashcards from "./pages/Flashcards";
import Pomodoro from "./pages/Pomodoro";
import Tests from "./pages/Tests";
import Progress from "./pages/Progress";
import GuestRestrictionOverlay from "./components/GuestRestrictionOverlay";
import { useGuest } from "./contexts/GuestContext";
import './App.css';

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
    <BrowserRouter>
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
          <Route path="/dashboard" element={<AuthOrGuest guestAllowed><Dashboard /></AuthOrGuest>} />
          <Route path="/plans" element={<AuthOrGuest guestAllowed><Plans /></AuthOrGuest>} />
          <Route path="/learning" element={<AuthOrGuest guestAllowed><Learning /></AuthOrGuest>} />
          <Route path="/flashcards" element={<AuthOrGuest><Flashcards /></AuthOrGuest>} />
          <Route path="/pomodoro" element={<AuthOrGuest><Pomodoro /></AuthOrGuest>} />
          <Route path="/tests" element={<AuthOrGuest><Tests /></AuthOrGuest>} />
          <Route path="/goals" element={<AuthOrGuest><Goals /></AuthOrGuest>} />
          <Route path="/progress" element={<AuthOrGuest><Progress /></AuthOrGuest>} />
          <Route path="/profile" element={<AuthOrGuest><Profile /></AuthOrGuest>} />
          <Route path="/notifications" element={<AuthOrGuest><Notifications /></AuthOrGuest>} />
          <Route path="/settings" element={<AuthOrGuest guestAllowed><Settings /></AuthOrGuest>} />
        </Route>
      </Routes>
    </BrowserRouter>
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
