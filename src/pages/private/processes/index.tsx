import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useProcess } from "@/contexts/ProcessContext"

export default function Processes() {
  const { processes, loading } = useProcess()
  const navigate = useNavigate()

  const handleProcessClick = (sequentialId: number) => {
    navigate(`/processes/${sequentialId}`)
  }

  const getProcessTypeLabel = (type: string) => {
    switch (type) {
      case 'policy':
        return 'Política'
      case 'guideline':
        return 'Diretriz'
      case 'process':
      default:
        return 'Processo'
    }
  }

  const getProcessTypeBadge = (type: string) => {
    switch (type) {
      case 'policy':
        return 'bg-green-100 text-green-800'
      case 'guideline':
        return 'bg-blue-100 text-blue-800'
      case 'process':
      default:
        return 'bg-purple-100 text-purple-800'
    }
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500'
    ]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="flex-1 flex flex-col p-8 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight mb-2">
          Processos {!loading && `(${processes.length})`}
        </h2>
        <Button 
          onClick={() => navigate('/processes/create')}
          className="bg-lamyda-primary hover:brightness-110 shadow-none rounded-sm text-white font-medium"
        >
          <FileText className="w-4 h-4" />
          Adicionar processo
        </Button>
      </div>
      <div className="text-sm text-gray-500 mb-6">Aqui você encontra todos os processos, políticas e diretrizes da sua empresa.</div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="rounded-sm border bg-white p-6">
              <div className="animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : processes.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-sm p-4">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-900 mb-0">Nenhum processo encontrado</h3>
          <p className="text-gray-500 mb-6 text-sm">Comece criando seu primeiro processo para documentar suas operações.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {processes.map((process) => (
            <div 
              key={process.id} 
              className="rounded-sm border bg-white p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProcessClick(process.sequential_id)}
            >
              {/* Header with title, type badge and menu */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{process.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProcessTypeBadge(process.type)}`}>
                      {getProcessTypeLabel(process.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{process.description || 'Sem descrição'}</p>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Implementar menu de opções do processo
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </button>
              </div>

              {/* Content row with Area/Team, Person in Charge, and Stats */}
              <div className="flex items-center justify-between">
                {/* Left side: Area/Team and Person in Charge */}
                <div className="flex items-center gap-8">
                  {/* Area and Team */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 font-medium">Local:</span>
                    <div className="flex items-center gap-2">
                      {process.area_name && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {process.area_name}
                        </span>
                      )}
                      {process.team_name && (
                        <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
                          {process.team_name}
                        </span>
                      )}
                      {!process.area_name && !process.team_name && (
                        <span className="text-sm text-gray-400">Não definido</span>
                      )}
                    </div>
                  </div>

                  {/* Person in Charge */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 font-medium">Responsável:</span>
                    <div className="flex items-center gap-2">
                      {process.person_in_charge_name ? (
                        <>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(process.person_in_charge_name)}`}>
                            {process.person_in_charge_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="text-sm text-gray-900">{process.person_in_charge_name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Não definido</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Stats and Date */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="text-xs text-gray-400">
                    {new Date(process.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
