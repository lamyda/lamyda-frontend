import { Navigate, Route, Routes } from 'react-router-dom'
import LayoutPublic from '@/layouts/PublicLayout'
import LayoutPrivate from '@/layouts/PrivateLayout'
import OnboardingLayout from '@/layouts/OnboardingLayout'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import SignIn from '@/pages/public/sign-in'
import SignUp from '@/pages/public/sign-up'
import ForgotPassword from '@/pages/public/forgot-password'
import Dashboard from '@/pages/private/dashboard'
import { useAuth } from '@/contexts/AuthContext'

export default function AppRoutes() {
    const { user, loading, userInfo } = useAuth()

    // Show loading while authenticating or while user info is being fetched
    if (loading || (user && !userInfo)) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Carregando...</p>
        </div>
        )
    }

    // Check if user needs onboarding - only when we have both user and userInfo
    const needsOnboarding = user && userInfo && !userInfo.is_company_created;

    return (
        <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={ 
                user ? (
                    needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                ) : (
                    <LayoutPublic><SignIn /></LayoutPublic>
                )
            } />
            <Route path="/sign-in" element={ 
                user ? (
                    needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                ) : (
                    <LayoutPublic><SignIn /></LayoutPublic>
                )
            } />
            <Route path="/sign-up" element={ 
                user ? (
                    needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                ) : (
                    <LayoutPublic><SignUp /></LayoutPublic>
                )
            } />
            <Route path="/forgot-password" element={ 
                user ? (
                    needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                ) : (
                    <LayoutPublic><ForgotPassword /></LayoutPublic>
                )
            } />
            
            {/* Rota de onboarding */}
            <Route path="/onboarding" element={
                user ? (
                    needsOnboarding ? (
                        <OnboardingProvider>
                            <OnboardingLayout><div /></OnboardingLayout>
                        </OnboardingProvider>
                    ) : (
                        <Navigate to="/dashboard" />
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            {/* Rotas privadas */}
            <Route path="/dashboard" element={
                user ? (
                    needsOnboarding ? (
                        <Navigate to="/onboarding" />
                    ) : (
                        <LayoutPrivate><Dashboard /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
        </Routes>
    )
}