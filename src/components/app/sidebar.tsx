import { 
  ChartColumn,
  ChevronDown,
  UserPlus,
  Users,
  FileStack,
  Workflow,
  ClipboardList,
  Vault,
  Shield,
  Blocks,
  HelpCircle,
  DollarSign,
  Building,
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

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: ChartColumn,
  },
  {
    title: "Processos",
    url: "#",
    icon: ClipboardList,
  },
  {
    title: "Workflows",
    url: "#",
    icon: Workflow,
  },
  {
    title: "Documentos",
    url: "#",
    icon: FileStack,
  },
  {
    title: "Times",
    url: "#",
    icon: Users,
  },
]

// Menu items.
const itemsGestao = [
    {
      title: "Vault",
      url: "#",
      icon: Vault,
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
      title: "Faturamento",
      url: "#",
      icon: DollarSign,
    },
    {
      title: "Ajuda",
      url: "#",
      icon: HelpCircle,
    },
  ]

export default function AppSidebar() {
  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="p-6 pb-[19.5px] border-b">
        <div className="flex items-center justify-center w-24">
          <LamydaLogo />
        </div>
      </SidebarHeader>
      
        <SidebarContent>
          {/* Workspace Section */}
          <div className="px-4 py-3 pt-6 pb-0">
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2">
              <div className="flex items-center justify-between cursor-pointer mb-3">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">Diego's Workspace</div>
                  <div className="text-xs text-gray-500">1 membro</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              
              <hr className="border-gray-200 mb-3" />
              
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-md w-full text-left">
                <UserPlus className="w-4 h-4 text-gray-400" />
                <span>Convidar membros</span>
              </button>
            </div>
          </div>

        <SidebarGroup className="pt-0">
            <SidebarGroupLabel className="text-gray-500 font-medium px-4">Geral</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        <a href={item.url} className="text-gray-600 hover:text-gray-800 px-4 py-2">
                        <item.icon className="text-gray-500 w-5 h-5" />
                        <span className="text-gray-600 font-base">{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-0">
            <SidebarGroupLabel className="text-gray-500 font-medium px-4">Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {itemsGestao.map((item) => (
                    <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        <a href={item.url} className="text-gray-600 hover:text-gray-800 px-4 py-2">
                        <item.icon className="text-gray-500 w-5 h-5" />
                        <span className="text-gray-600 font-base">{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-0">
            <SidebarGroupLabel className="text-gray-500 font-medium px-4">Configurações</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {itemsConfig.map((item) => (
                    <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        <a href={item.url} className="text-gray-600 hover:text-gray-800 px-4 py-2">
                        <item.icon className="text-gray-500 w-5 h-5" />
                        <span className="text-gray-600 font-base">{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}