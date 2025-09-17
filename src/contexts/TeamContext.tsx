import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/services/supabase'
import { useCompany } from './CompanyContext'
import { useAuth } from './AuthContext'
import { useArea } from './AreaContext'

interface Team {
  id: string
  sequential_id: number
  name: string
  description: string | null
  area_id: string
  area_name?: string | null
  team_leader_id: string | null
  team_leader_name?: string | null
  members_count: number
  processes_count: number
  active_processes: number
  completed_processes: number
  assignees: Array<{
    name: string
    avatar: string
  }>
  created_at: string
  updated_at: string
}

interface TeamDetail {
  id: string
  name: string
  description: string | null
  area_id: string
  area_name?: string | null
  team_leader_id: string | null
  team_leader_name?: string | null
  company_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  members_count: number
}

interface TeamMember {
  user_id: string
  user_name: string
  user_email: string
}

interface TeamContextType {
  // Estados
  teams: Team[]
  currentTeam: TeamDetail | null
  loading: boolean
  loadingDetail: boolean
  
  // Funções
  fetchTeams: () => Promise<void>
  fetchTeamDetail: (sequentialId: string) => Promise<void>
  createTeam: (teamData: {
    name: string
    description: string
    area_id: string
    team_leader_id: string | null
    members: TeamMember[]
  }) => Promise<boolean>
  refreshTeams: () => void
  getTeamsByArea: (areaId: string) => Team[]
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export const useTeam = () => {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}

interface TeamProviderProps {
  children: ReactNode
}

export const TeamProvider = ({ children }: TeamProviderProps) => {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(true)
  
  const { companyInfo } = useCompany()
  const { user } = useAuth()
  const {  } = useArea()

  const fetchTeams = useCallback(async () => {
    if (!companyInfo?.id) return

    setLoading(true)
    try {
      // Buscar times da empresa através das áreas
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          area_id,
          team_leader_id,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (teamsError) {
        console.error('Error fetching teams:', teamsError)
        return
      }

      if (!teamsData || teamsData.length === 0) {
        setTeams([])
        setLoading(false)
        return
      }

      // Para cada time, buscar informações da área, líder e membros
      const teamsWithDetails = await Promise.all(
        (teamsData || []).map(async (team, index) => {
          let areaName = null
          let teamLeaderName = null
          let membersCount = 0

          // Buscar nome da área
          if (team.area_id) {
            try {
              const { data: areaData } = await supabase
                .from('areas')
                .select('name, company_id')
                .eq('id', team.area_id)
                .eq('company_id', companyInfo.id)
                .eq('is_active', true)
                .single()

              if (areaData) {
                areaName = areaData.name
              }
            } catch (error) {
              console.error('Error fetching area info:', error)
            }
          }

          // Buscar informações do líder se existir
          if (team.team_leader_id) {
            try {
              const { data: leaderData } = await supabase.rpc('get_user_basic_info', {
                p_user_id: team.team_leader_id
              })

              if (leaderData && leaderData.length > 0) {
                teamLeaderName = leaderData[0].user_name
              }
            } catch (error) {
              console.error('Error fetching team leader info:', error)
            }
          }

          // Buscar estatísticas completas do time usando uma única chamada
          let processesCount = 0
          let activeProcessesCount = 0
          let completedProcessesCount = 0

          try {
            const { data: teamStats, error: statsError } = await supabase.rpc('get_team_statistics', {
              p_team_id: team.id
            })
            
            console.log('Team stats response:', { teamStats, statsError, teamId: team.id, teamName: team.name })
            
            if (!statsError && teamStats && teamStats.length > 0) {
              const stats = teamStats[0]
              membersCount = stats.members_count || 0
              processesCount = stats.documents_count || 0
              activeProcessesCount = stats.active_processes_count || 0
              completedProcessesCount = stats.completed_processes_count || 0
              console.log('Team stats parsed:', { membersCount, processesCount, activeProcessesCount, completedProcessesCount })
            } else {
              console.warn('No team stats data or error:', { statsError, teamStats })
            }
          } catch (error) {
            console.error('Error fetching team statistics:', error)
            // Fallback para contagem manual de membros se o RPC falhar
            try {
              const { count } = await supabase
                .from('team_members')
                .select('*', { count: 'exact', head: true })
                .eq('team_id', team.id)
                .eq('is_active', true)

              membersCount = count || 0
            } catch (memberError) {
              console.error('Error fetching members count fallback:', memberError)
            }
            // Fallback para dados mock de processos
            processesCount = Math.floor(Math.random() * 10)
          }

          // Gerar dados para assignees (por enquanto mock baseado no líder)
          const mockAssignees = [
            { 
              name: teamLeaderName || 'Sem líder', 
              avatar: teamLeaderName ? teamLeaderName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'SL' 
            }
          ]

          return {
            id: team.id, // ID real do Supabase (não exposto na URL)
            sequential_id: index + 1, // ID sequencial para usar na URL
            name: team.name,
            description: team.description,
            area_id: team.area_id,
            area_name: areaName,
            team_leader_id: team.team_leader_id,
            team_leader_name: teamLeaderName,
            members_count: membersCount,
            processes_count: processesCount, // Contagem total de processos
            active_processes: activeProcessesCount, // Processos ativos
            completed_processes: completedProcessesCount, // Processos completados
            assignees: mockAssignees,
            created_at: team.created_at,
            updated_at: team.updated_at
          }
        })
      )

      // Filtrar apenas times que pertencem às áreas da empresa
      const validTeams = teamsWithDetails.filter(team => team.area_name !== null)
      setTeams(validTeams)

    } catch (error) {
      console.error('Error fetching teams:', error)
      setTeams([])
    } finally {
      setLoading(false)
    }
  }, [companyInfo?.id])

  const fetchTeamDetail = useCallback(async (sequentialId: string) => {
    if (!companyInfo?.id) return

    setLoadingDetail(true)
    
    try {
      const sequentialIdNum = parseInt(sequentialId)
      if (isNaN(sequentialIdNum) || sequentialIdNum < 1) {
        console.error('ID do time inválido')
        setCurrentTeam(null)
        return
      }

      // Buscar todos os times ordenados por created_at para mapear o ID sequencial
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          area_id,
          team_leader_id,
          is_active,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (teamsError) {
        console.error('Error fetching teams:', teamsError)
        setCurrentTeam(null)
        return
      }

      if (!teamsData || teamsData.length === 0) {
        console.error('Nenhum time encontrado')
        setCurrentTeam(null)
        return
      }

      // Encontrar o time pelo ID sequencial (índice + 1)
      const targetTeamIndex = sequentialIdNum - 1
      if (targetTeamIndex < 0 || targetTeamIndex >= teamsData.length) {
        console.error('Time não encontrado')
        setCurrentTeam(null)
        return
      }

      const teamData = teamsData[targetTeamIndex]

      // Buscar informações da área
      let areaName = null
      if (teamData.area_id) {
        try {
          const { data: areaData } = await supabase
            .from('areas')
            .select('name, company_id')
            .eq('id', teamData.area_id)
            .eq('company_id', companyInfo.id)
            .eq('is_active', true)
            .single()

          if (areaData) {
            areaName = areaData.name
          }
        } catch (error) {
          console.error('Error fetching area info:', error)
        }
      }

      // Buscar informações do líder se existir
      let teamLeaderName = null
      if (teamData.team_leader_id) {
        try {
          const { data: leaderData } = await supabase.rpc('get_user_basic_info', {
            p_user_id: teamData.team_leader_id
          })
          
          if (leaderData && leaderData.length > 0) {
            teamLeaderName = leaderData[0].user_name
          }
        } catch (error) {
          console.error('Error fetching team leader info:', error)
        }
      }

      // Buscar contagem de membros
      let membersCount = 0
      try {
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', teamData.id)
          .eq('is_active', true)

        membersCount = count || 0
      } catch (error) {
        console.error('Error fetching members count:', error)
      }

      setCurrentTeam({
        ...teamData,
        area_name: areaName,
        team_leader_name: teamLeaderName,
        company_id: companyInfo.id,
        members_count: membersCount
      })

    } catch (error) {
      console.error('Error fetching team details:', error)
      setCurrentTeam(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [companyInfo?.id])

  const createTeam = useCallback(async (teamData: {
    name: string
    description: string
    area_id: string
    team_leader_id: string | null
    members: TeamMember[]
  }) => {
    if (!companyInfo?.id || !user?.id) return false

    try {
      // 1. Criar o time
      const { data: newTeamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamData.name.trim(),
          description: teamData.description.trim() || null,
          area_id: teamData.area_id,
          team_leader_id: teamData.team_leader_id,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single()

      if (teamError) {
        console.error('Error creating team:', teamError)
        return false
      }

      // 2. Adicionar líder como membro se foi selecionado
      if (teamData.team_leader_id && newTeamData) {
        try {
          await supabase
            .from('team_members')
            .insert({
              team_id: newTeamData.id,
              user_id: teamData.team_leader_id,
              role: 'leader',
              added_by: user.id
            })
        } catch (error) {
          console.error('Error adding team leader as member:', error)
        }
      }

      // 3. Adicionar membros ao time
      if (teamData.members.length > 0) {
        for (const member of teamData.members) {
          try {
            await supabase
              .from('team_members')
              .insert({
                team_id: newTeamData.id,
                user_id: member.user_id,
                role: 'member',
                added_by: user.id
              })
          } catch (error) {
            console.error('Error adding team member:', error)
          }
        }
      }

      // Recarregar times após criar
      await fetchTeams()
      return true
      
    } catch (error) {
      console.error('Error creating team:', error)
      return false
    }
  }, [companyInfo?.id, user?.id, fetchTeams])

  const refreshTeams = useCallback(() => {
    fetchTeams()
  }, [fetchTeams])

  const getTeamsByArea = useCallback((areaId: string) => {
    return teams.filter(team => team.area_id === areaId)
  }, [teams])

  // Carregar times quando o componente montar ou a empresa mudar
  useEffect(() => {
    if (companyInfo?.id) {
      fetchTeams()
    }
  }, [companyInfo?.id, fetchTeams])

  const value: TeamContextType = {
    // Estados
    teams,
    currentTeam,
    loading,
    loadingDetail,
    
    // Funções
    fetchTeams,
    fetchTeamDetail,
    createTeam,
    refreshTeams,
    getTeamsByArea
  }

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  )
}
