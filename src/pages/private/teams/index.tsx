import { Button } from "@/components/ui/button"
import { Users, ClipboardList } from "lucide-react"
import CreateTeamDialog from "@/components/app/create-team-dialog"
import { useNavigate } from "react-router-dom"
import { useTeam } from "@/contexts/TeamContext"

export default function Teams() {
  const { teams, loading, refreshTeams } = useTeam()
  const navigate = useNavigate()

  const handleTeamCreated = () => {
    console.log('Novo time criado! Recarregando lista...')
    refreshTeams()
  }

  const handleTeamClick = (sequentialId: number) => {
    navigate(`/teams/${sequentialId}`)
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
        <h2 className="text-2xl font-medium tracking-tight mb-2">Times</h2>
        <CreateTeamDialog onTeamCreated={handleTeamCreated}>
          <Button className="bg-lamyda-primary hover:brightness-110 shadow-none rounded-sm text-white font-medium">
            <Users className="w-4 h-4" />
            Adicionar time
          </Button>
        </CreateTeamDialog>
      </div>
      <div className="text-sm text-gray-500 mb-6">Aqui você encontra todos os times da sua empresa organizados por áreas.</div>

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
      ) : teams.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-sm p-4">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-900 mb-0">Nenhum time encontrado</h3>
          <p className="text-gray-500 mb-6 text-sm">Comece criando seu primeiro time para organizar sua equipe.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className="rounded-sm border bg-white p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTeamClick(team.sequential_id)}
            >
              {/* Header with title and menu */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
                  <p className="text-sm text-gray-600">{team.area_name || 'Sem área'}</p>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Implementar menu de opções do time
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </button>
              </div>

              {/* Team Leader */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-700 font-medium">Líder:</span>
                <div className="flex items-center gap-2">
                  {team.team_leader_name ? (
                    <>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white ${getAvatarColor(team.team_leader_name)}`}>
                        {team.team_leader_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="text-sm text-gray-900">{team.team_leader_name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Sem líder</span>
                  )}
                </div>
              </div>

              {/* Bottom stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {team.members_count} {team.members_count === 1 ? 'Membro' : 'Membros'}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4" />
                    {team.processes_count} {team.processes_count === 1 ? 'Processo' : 'Processos'}
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
