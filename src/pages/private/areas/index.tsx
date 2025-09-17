import { Button } from "@/components/ui/button"
import { FileStackIcon } from "lucide-react"
import CreateAreaDialog from "@/components/app/create-area-dialog"
import { useNavigate } from "react-router-dom"
import { useArea } from "@/contexts/AreaContext"
import { useTeam } from "@/contexts/TeamContext"

export default function Areas() {
  const { areas, loading, refreshAreas } = useArea()
  const { getTeamsByArea } = useTeam()
  const navigate = useNavigate()

  const handleAreaCreated = () => {
    console.log('Nova área criada! Recarregando lista...')
    refreshAreas()
  }

  const handleAreaClick = (sequentialId: number) => {
    navigate(`/areas/${sequentialId}`)
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

  const getTeamInitials = (teamName: string) => {
    return teamName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="flex-1 flex flex-col p-8 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium tracking-tight mb-2">Áreas</h2>
          <CreateAreaDialog onAreaCreated={handleAreaCreated}>
            <Button className="bg-lamyda-primary hover:brightness-110 shadow-none rounded-sm text-white font-medium">
              <FileStackIcon className="w-4 h-4" />
              Adicionar área
            </Button>
          </CreateAreaDialog>
        </div>
      <div className="text-sm text-gray-500 mb-6">Aqui você encontra todas as áreas de atuação das equipes, para visualizar o times escolha uma área.</div>
      
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
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
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
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
      ) : areas.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-sm p-4">
          <FileStackIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-900 mb-0">Nenhuma área encontrada</h3>
          <p className="text-gray-500 mb-6 text-sm">Comece criando sua primeira área para organizar suas equipes.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {areas.map((area) => (
          <div 
            key={area.id} 
            className="rounded-sm border bg-white p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleAreaClick(area.sequential_id)}
          >
            {/* Header with title and menu */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{area.name}</h3>
                <p className="text-sm text-gray-600">{area.description || 'Sem descrição'}</p>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implementar menu de opções da área
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                </svg>
              </button>
            </div>

            {/* Teams Initials */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-700 font-medium">Times:</span>
              <div className="flex -space-x-2">
                {(() => {
                  const areaTeams = getTeamsByArea(area.id)
                  if (areaTeams.length === 0) {
                    return (
                      <span className="text-xs text-gray-400">Nenhum time</span>
                    )
                  }
                  return (
                    <>
                      {areaTeams.slice(0, 5).map((team) => (
                        <div
                          key={team.id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white ${getAvatarColor(team.name)}`}
                          title={team.name}
                        >
                          {getTeamInitials(team.name)}
                        </div>
                      ))}
                      {areaTeams.length > 5 && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400 text-white text-xs font-medium border-2 border-white">
                          +{areaTeams.length - 5}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Bottom stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {area.teams} Times
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {area.documents} Processos
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
