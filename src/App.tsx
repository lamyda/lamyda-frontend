import AppRoutes from '@/routes'
import { AuthProvider } from '@/contexts/AuthContext'
import { CompanyProvider } from '@/contexts/CompanyContext'
import { InviteProvider } from '@/contexts/InviteContext'
import { ProcessProvider } from '@/contexts/ProcessContext'
import { AreaProvider } from '@/contexts/AreaContext'
import { TeamProvider } from '@/contexts/TeamContext'
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CompanyProvider>
          <InviteProvider>
            <AreaProvider>
              <TeamProvider>
                <ProcessProvider>
                  <AppRoutes />
                </ProcessProvider>
              </TeamProvider>
            </AreaProvider>
          </InviteProvider>
        </CompanyProvider>
      </AuthProvider>
    </Router>
  )
}
