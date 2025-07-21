// src/App.jsx
// Wraps the app in AuthProvider and conditionally renders either the AuthPage or a protected area.

import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth"; // will be used in AuthenticatedApp below
import { AuthPage } from "./components/AuthPage";
import Home from "./components/Home"
// This component consumes auth state to show either login/register screen or protected content.
function AuthenticatedApp() {
  const { access } = useAuth();
  if (!access) {
    return <AuthPage />;
  }
  return (
    <Home />
  );
}

export default function App() {
  return (
    <AuthProvider autoLoginAfterRegister={false}>
      <AuthenticatedApp />
    </AuthProvider>
  );
}