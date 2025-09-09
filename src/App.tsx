import AppRoutes from '@/routes'
import { AuthProvider } from '@/contexts/AuthContext'
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
