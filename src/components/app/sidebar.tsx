import { 
  ChartColumn,
  Users,
  FileStack,
  Workflow,
  ClipboardList,
  Vault,
  Shield,
  Blocks,
  HelpCircle,
  Building,
  Video,
  Bot,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader
} from "@/components/ui/sidebar"
import LamydaLogo from "@/components/app/lamyda-logo"
import CompanyInformation from "@/components/app/company-information"
import { useCompany } from "@/contexts/CompanyContext"
import { useLocation, Link } from "react-router-dom"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ChartColumn,
  },
  {
    title: "Processos",
    url: "/processes",
    icon: ClipboardList,
  },
  {
    title: "Estações de Trabalho",
    url: "#",
    icon: Vault,
  },
  {
    title: "Áreas",
    url: "/areas",
    icon: FileStack,
  },
         {
           title: "Times",
           url: "/teams",
           icon: Users,
         },
]

// Menu items.
const itemsGestao = [
    {
      title: "Workflows",
      url: "#",
      icon: Workflow,
    },
    {
      title: "Acessos",
      url: "#",
      icon: Shield,
    },
    {
      title: "Integrações",
      url: "#",
      icon: Blocks,
    },
  ]

  // Menu items.
const itemsConfig = [
    {
      title: "Minha Empresa",
      url: "#",
      icon: Building,
    },
    {
      title: "Usuários",
      url: "#",
      icon: Users,
    },
    {
      title: "Teste Upload Vídeo",
      url: "/video-upload-test",
      icon: Video,
    },
    {
      title: "Teste Lamyda AI",
      url: "/ai-process-test",
      icon: Bot,
    },
    {
      title: "Ajuda",
      url: "#",
      icon: HelpCircle,
    },
  ]

export default function AppSidebar() {
  const { companyInfo } = useCompany()
  const location = useLocation()
  
  // Verificar se usuário pode ver configurações (apenas owners e administrators)
  const canViewSettings = () => {
    return companyInfo?.userRole === 'owner' || companyInfo?.userRole === 'administrator'
  }

  // Verificar se um item está ativo
  const isActiveItem = (url: string) => {
    if (url === '#') return false
    return location.pathname === url
  }

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="p-6 pb-[19.5px] border-b">
        <div className="flex items-center justify-center w-24">
          <LamydaLogo />
        </div>
      </SidebarHeader>
      
        <SidebarContent>
          <CompanyInformation />

        <SidebarGroup className="pt-0">
            <SidebarGroupLabel className="text-gray-500 font-medium px-4">Geral</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {items.map((item) => {
                  const isActive = isActiveItem(item.url)
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        {item.url === '#' ? (
                          <a 
                            href={item.url} 
                            className={`px-4 py-2 ${
                              isActive 
                                ? 'text-gray-800 bg-gray-50' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 ${
                              isActive ? 'text-gray-700' : 'text-gray-500'
                            }`} />
                            <span className={`font-base ${
                              isActive ? 'text-gray-800 font-medium' : 'text-gray-600'
                            }`}>{item.title}</span>
                          </a>
                        ) : (
                          <Link 
                            to={item.url} 
                            className={`px-4 py-2 ${
                              isActive 
                                ? 'text-gray-800 bg-gray-50' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 ${
                              isActive ? 'text-gray-700' : 'text-gray-500'
                            }`} />
                            <span className={`font-base ${
                              isActive ? 'text-gray-800 font-medium' : 'text-gray-600'
                            }`}>{item.title}</span>
                          </Link>
                        )}
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
                </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-0">
            <SidebarGroupLabel className="text-gray-500 font-medium px-4">Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {itemsGestao.map((item) => {
                  const isActive = isActiveItem(item.url)
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        {item.url === '#' ? (
                          <a 
                            href={item.url} 
                            className={`px-4 py-2 ${
                              isActive 
                                ? 'text-gray-800 bg-gray-50' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 ${
                              isActive ? 'text-gray-700' : 'text-gray-500'
                            }`} />
                            <span className={`font-base ${
                              isActive ? 'text-gray-800 font-medium' : 'text-gray-600'
                            }`}>{item.title}</span>
                          </a>
                        ) : (
                          <Link 
                            to={item.url} 
                            className={`px-4 py-2 ${
                              isActive 
                                ? 'text-gray-800 bg-gray-50' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 ${
                              isActive ? 'text-gray-700' : 'text-gray-500'
                            }`} />
                            <span className={`font-base ${
                              isActive ? 'text-gray-800 font-medium' : 'text-gray-600'
                            }`}>{item.title}</span>
                          </Link>
                        )}
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
                </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canViewSettings() && (
          <SidebarGroup className="pt-0">
              <SidebarGroupLabel className="text-gray-500 font-medium px-4">Configurações</SidebarGroupLabel>
              <SidebarGroupContent>
                  <SidebarMenu>
                  {itemsConfig.map((item) => {
                    const isActive = isActiveItem(item.url)
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                          {item.url === '#' ? (
                            <a 
                              href={item.url} 
                              className={`px-4 py-2 ${
                                isActive 
                                  ? 'text-gray-800 bg-gray-50' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                              }`}
                            >
                              <item.icon className={`w-5 h-5 ${
                                isActive ? 'text-gray-700' : 'text-gray-500'
                              }`} />
                              <span className={`font-base ${
                                isActive ? 'text-gray-800 font-medium' : 'text-gray-600'
                              }`}>{item.title}</span>
                            </a>
                          ) : (
                            <Link 
                              to={item.url} 
                              className={`px-4 py-2 ${
                                isActive 
                                  ? 'text-gray-800 bg-gray-50' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                              }`}
                            >
                              <item.icon className={`w-5 h-5 ${
                                isActive ? 'text-gray-700' : 'text-gray-500'
                              }`} />
                              <span className={`font-base ${
                                isActive ? 'text-gray-800 font-medium' : 'text-gray-600'
                              }`}>{item.title}</span>
                            </Link>
                          )}
                      </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                  </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>
    </Sidebar>
  )
}