import { FileText, Video, Map, FolderOpen } from 'lucide-react'

interface CreateProcessTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function CreateProcessTabs({ activeTab, onTabChange }: CreateProcessTabsProps) {
  const tabs = [
    { id: 'basic', label: 'Processo', description: 'Detalhamento do processo', icon: FileText },
    { id: 'video', label: 'Vídeo', description: 'Gravação do processo em vídeo', icon: Video },
    { id: 'mindmap', label: 'Mind Map', description: 'Mapa Mental do Processo', icon: Map },
    { id: 'documents', label: 'Documentos', description: 'Arquivos e anexos do processo', icon: FolderOpen }
  ]

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="flex space-x-0">
        {tabs.map((tab, index) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 py-4 px-6 text-left border-b-2 transition-colors duration-200
                ${activeTab === tab.id 
                  ? 'border-lamyda-primary bg-lamyda-primary/5 text-lamyda-primary' 
                  : 'border-transparent hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                }
                ${index === 0 ? 'border-l-0' : ''}
                ${index === tabs.length - 1 ? 'border-r-0' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{tab.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                </div>
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                  ${activeTab === tab.id 
                    ? 'border-lamyda-primary bg-lamyda-primary text-white' 
                    : 'border-gray-300 text-gray-400'
                  }
                `}>
                  <IconComponent size={16} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
