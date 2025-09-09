import { useAuth } from '@/contexts/AuthContext'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface PrivateLayoutProps {
    children: React.ReactNode
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
    const { user, loading, signOut } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await signOut()
            navigate('/sign-in')
        } catch (error) {
            console.error('Erro ao fazer logout:', error)
            navigate('/sign-in')
        }
    }

    useEffect(() => {
        if (!loading && !user) {
            navigate('/sign-in')
        }
    }, [user, loading, navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Lamyda Dashboard
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}
