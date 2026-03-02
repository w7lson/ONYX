import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n.js'
import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { PomodoroProvider } from './contexts/PomodoroContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <PomodoroProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </PomodoroProvider>
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
