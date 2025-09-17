import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import React, { useEffect, useState, createContext, useContext } from 'react'
import AppSidebar from '@/components/app/sidebar'
import { useNavigate, useLocation } from 'react-router-dom'
import UserAccount from '@/components/app/user-account'
import { useArea } from '@/contexts/AreaContext'

// Context para breadcrumb dinâmico
interface BreadcrumbContextType {
  setBreadcrumb: (breadcrumb: string) => void
  resetBreadcrumb: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext)
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}

interface PrivateLayoutProps {
    children: React.ReactNode
}

// Componente interno que tem acesso ao AreaContext
function PrivateLayoutContent({ children }: PrivateLayoutProps) {
    const { user, loading, requiresPasswordChange } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { areas } = useArea()
    const [areaName, setAreaName] = useState<string | null>(null)
    const [customBreadcrumb, setCustomBreadcrumb] = useState<string | null>(null)

    // Função para buscar nome da área usando ID sequencial a partir do contexto
    const getAreaNameFromContext = (sequentialIdStr: string) => {
        try {
            const sequentialId = parseInt(sequentialIdStr)
            if (isNaN(sequentialId) || sequentialId < 1) {
                return null
            }

            // Buscar a área pelo sequential_id no contexto
            const area = areas.find(area => area.sequential_id === sequentialId)
            return area?.name || null
        } catch (error) {
            console.error('Error getting area name from context:', error)
            return null
        }
    }

    // Função para obter o título da página baseado na rota
    const getPageTitle = () => {
        const pathTitleMap: { [key: string]: string } = {
            '/dashboard': 'Dashboard',
            '/areas': 'Áreas',
            '/processes': 'Processos',
            '/processes/create': 'Criar novo processo',
            '/estacoes': 'Estações de Trabalho',
            '/teams': 'Times',
            '/workflows': 'Workflows',
            '/acessos': 'Acessos',
            '/integracoes': 'Integrações',
            '/minha-empresa': 'Minha Empresa',
            '/usuarios': 'Usuários',
            '/ajuda': 'Ajuda'
        }
        
        return pathTitleMap[location.pathname] || 'Dashboard'
    }

    // Função para renderizar o breadcrumb
    const renderBreadcrumb = () => {
        const areaDetailMatch = location.pathname.match(/^\/areas\/(.+)$/)
        const processDetailMatch = location.pathname.match(/^\/processes\/(.+)$/)
        
        // Breadcrumb para detalhes de área
        if (areaDetailMatch) {
            return (
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/areas')}
                        className="text-gray-900 hover:text-gray-700 hover:underline cursor-pointer"
                    >
                        Áreas
                    </button>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-gray-500">
                        {areaName || 'Carregando...'}
                    </span>
                </div>
            )
        }
        
        // Breadcrumb para criar processo
        if (location.pathname === '/processes/create') {
            return (
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/processes')}
                        className="text-gray-900 hover:text-gray-700 hover:underline cursor-pointer"
                    >
                        Processos
                    </button>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-gray-500">
                        {customBreadcrumb || 'Criar novo processo'}
                    </span>
                </div>
            )
        }
        
        // Breadcrumb para detalhes de processo
        if (processDetailMatch && processDetailMatch[1] !== 'create') {
            return (
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/processes')}
                        className="text-gray-900 hover:text-gray-700 hover:underline cursor-pointer"
                    >
                        Processos
                    </button>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-gray-500">
                        {customBreadcrumb || 'Carregando...'}
                    </span>
                </div>
            )
        }
        
        return <span>{getPageTitle()}</span>
    }

    // Effect para buscar nome da área quando a rota mudar ou as áreas carregarem
    useEffect(() => {
        const areaDetailMatch = location.pathname.match(/^\/areas\/(.+)$/)
        if (areaDetailMatch && areas.length > 0) {
            const areaId = areaDetailMatch[1]
            const name = getAreaNameFromContext(areaId)
            setAreaName(name)
        } else {
            setAreaName(null)
        }
        
        // Reset custom breadcrumb when route changes (but not for process details)
        const processDetailMatch = location.pathname.match(/^\/processes\/(.+)$/)
        if (location.pathname !== '/processes/create' && !processDetailMatch) {
            setCustomBreadcrumb(null)
        }
    }, [location.pathname, areas])

    // Funções do contexto de breadcrumb
    const setBreadcrumb = (breadcrumb: string) => {
        setCustomBreadcrumb(breadcrumb)
    }

    const resetBreadcrumb = () => {
        setCustomBreadcrumb(null)
    }

    useEffect(() => {
        if (!loading && !user) {
            navigate('/sign-in')
        }
        
        // Verificar se usuário precisa definir senha
        if (!loading && user && requiresPasswordChange()) {
            navigate('/setup-password')
        }
    }, [user, loading, navigate, requiresPasswordChange])

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
        <BreadcrumbContext.Provider value={{ setBreadcrumb, resetBreadcrumb }}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <h1 className="text-sm font-medium">{renderBreadcrumb()}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <UserAccount isFirstOnboarding={false} />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </BreadcrumbContext.Provider>
    )
}

// Componente principal - providers agora estão no App.tsx
export default function PrivateLayout({ children }: PrivateLayoutProps) {
    return (
        <PrivateLayoutContent>
            {children}
        </PrivateLayoutContent>
    )
}
