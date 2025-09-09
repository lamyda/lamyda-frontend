import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import React, { useEffect } from 'react'
import AppSidebar from '@/components/app/sidebar'
import { useNavigate } from 'react-router-dom'

interface PrivateLayoutProps {
    children: React.ReactNode
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

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
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
