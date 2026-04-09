import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './contexts/ToastContext.jsx'
import ToastContainer from './components/ToastContainer.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <App />
          <ToastContainer />
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
)
