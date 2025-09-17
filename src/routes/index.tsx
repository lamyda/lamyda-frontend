import { Navigate, Route, Routes } from 'react-router-dom'
import LayoutPublic from '@/layouts/PublicLayout'
import LayoutPrivate from '@/layouts/PrivateLayout'
import OnboardingLayout from '@/layouts/OnboardingLayout'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import SignIn from '@/pages/public/sign-in'
import SignUp from '@/pages/public/sign-up'
import ForgotPassword from '@/pages/public/forgot-password'
import SetupPassword from '@/pages/public/setup-password'
import Dashboard from '@/pages/private/dashboard'
import Areas from '@/pages/private/areas'
import AreaDetail from '@/pages/private/area-detail'
import Teams from '@/pages/private/teams'
import Processes from '@/pages/private/processes'
import CreateProcess from '@/pages/private/create-process'
import ProcessDetail from '@/pages/private/process-detail'
import VideoUploadTest from '@/pages/private/video-upload'
import AIProcessTest from '@/pages/private/ai-process-test'
import { useAuth } from '@/contexts/AuthContext'

export default function AppRoutes() {
    const { user, loading, userInfo, requiresPasswordChange } = useAuth()

    // Show loading while authenticating or while user info is being fetched
    if (loading || (user && !userInfo)) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Carregando...</p>
        </div>
        )
    }

    // Check if user needs onboarding - only OWNERS who haven't created a company
    const needsOnboarding = user && userInfo && userInfo.is_owner && !userInfo.is_company_created;
    
    // Check if user needs to set password
    const needsPasswordSetup = user && userInfo && requiresPasswordChange();

    return (
        <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={ 
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                ) : (
                    <LayoutPublic><SignIn /></LayoutPublic>
                )
            } />
            <Route path="/sign-in" element={ 
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                ) : (
                    <LayoutPublic><SignIn /></LayoutPublic>
                )
            } />
            <Route path="/sign-up" element={ 
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                ) : (
                    <LayoutPublic><SignUp /></LayoutPublic>
                )
            } />
            <Route path="/forgot-password" element={ 
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                ) : (
                    <LayoutPublic><ForgotPassword /></LayoutPublic>
                )
            } />
            
            {/* Rota de setup de senha */}
            <Route path="/setup-password" element={
                user ? (
                    needsPasswordSetup ? (
                        <LayoutPublic><SetupPassword /></LayoutPublic>
                    ) : (
                        needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            {/* Rota de onboarding */}
            <Route path="/onboarding" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
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
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><Dashboard /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            <Route path="/areas" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><Areas /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            <Route path="/areas/:id" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><AreaDetail /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            <Route path="/teams" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><Teams /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            <Route path="/processes" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><Processes /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            <Route path="/processes/create" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><CreateProcess /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            <Route path="/processes/:id" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><ProcessDetail /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            <Route path="/video-upload-test" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><VideoUploadTest /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
            
            <Route path="/ai-process-test" element={
                user ? (
                    needsPasswordSetup ? <Navigate to="/setup-password" /> :
                    needsOnboarding ? <Navigate to="/onboarding" /> : (
                        <LayoutPrivate><AIProcessTest /></LayoutPrivate>
                    )
                ) : (
                    <Navigate to="/sign-in" />
                )
            } />
        </Routes>
    )
}