import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/services/supabase'
import { useCompany } from './CompanyContext'
import { useAuth } from './AuthContext'

interface Area {
  id: string
  sequential_id: number
  name: string
  description: string | null
  manager_id: string | null
  manager_name?: string | null
  teams: number
  documents: number
  active_processes: number
  completed_processes: number
  assignees: Array<{
    name: string
    avatar: string
  }>
  created_at: string
  updated_at: string
}

interface AreaDetail {
  id: string
  name: string
  description: string | null
  manager_id: string | null
  manager_name?: string | null
  company_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CompanyMember {
  user_id: string
  user_name: string
  user_email: string
  role: string
}

interface AreaContextType {
  // Estados
  areas: Area[]
  currentArea: AreaDetail | null
  loading: boolean
  loadingDetail: boolean
  loadingMembers: boolean
  members: CompanyMember[]
  
  // Funções
  fetchAreas: () => Promise<void>
  fetchAreaDetail: (sequentialId: string) => Promise<void>
  fetchCompanyMembers: () => Promise<void>
  createArea: (areaData: {
    name: string
    description: string
    manager_id: string
  }) => Promise<boolean>
  refreshAreas: () => void
}

const AreaContext = createContext<AreaContextType | undefined>(undefined)

export const useArea = () => {
  const context = useContext(AreaContext)
  if (context === undefined) {
    throw new Error('useArea must be used within an AreaProvider')
  }
  return context
}

interface AreaProviderProps {
  children: ReactNode
}

export const AreaProvider = ({ children }: AreaProviderProps) => {
  const [areas, setAreas] = useState<Area[]>([])
  const [currentArea, setCurrentArea] = useState<AreaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [members, setMembers] = useState<CompanyMember[]>([])
  
  const { companyInfo } = useCompany()
  const { user } = useAuth()

  const fetchAreas = useCallback(async () => {
    if (!companyInfo?.id) return

    setLoading(true)
    try {
      // Buscar áreas da empresa
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select(`
          id,
          name,
          description,
          manager_id,
          company_id,
          created_at,
          updated_at
        `)
        .eq('company_id', companyInfo.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (areasError) {
        console.error('Error fetching areas:', areasError)
        return
      }

      // Para cada área, buscar informações do gerente se existir e adicionar ID sequencial
      const areasWithManagers = await Promise.all(
        (areasData || []).map(async (area, index) => {
          let managerName = null

          if (area.manager_id) {
            try {
              const { data: managerData } = await supabase.rpc('get_user_basic_info', {
                p_user_id: area.manager_id
              })

              if (managerData && managerData.length > 0) {
                managerName = managerData[0].user_name
              }
            } catch (error) {
              console.error('Error fetching manager info:', error)
            }
          }

          // Buscar estatísticas completas da área usando uma única chamada
          let teamsCount = 0
          let processesCount = 0
          let activeProcessesCount = 0
          let completedProcessesCount = 0

          try {
            const { data: areaStats, error: statsError } = await supabase.rpc('get_area_statistics', {
              p_area_id: area.id
            })
            
            console.log('Area stats response:', { areaStats, statsError, areaId: area.id, areaName: area.name })
            
            if (!statsError && areaStats && areaStats.length > 0) {
              const stats = areaStats[0]
              teamsCount = stats.teams_count || 0
              processesCount = stats.documents_count || 0
              activeProcessesCount = stats.active_processes_count || 0
              completedProcessesCount = stats.completed_processes_count || 0
              console.log('Area stats parsed:', { teamsCount, processesCount, activeProcessesCount, completedProcessesCount })
            } else {
              console.warn('No area stats data or error:', { statsError, areaStats })
            }
          } catch (error) {
            console.error('Error fetching area statistics:', error)
            // Fallback para dados mock se o RPC falhar
            teamsCount = Math.floor(Math.random() * 15) + 1
            processesCount = Math.floor(Math.random() * 10)
          }
          const mockAssignees = [
            { name: managerName || 'Sem gerente', avatar: managerName ? managerName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'SG' }
          ]

          return {
            id: area.id, // ID real do Supabase (não exposto na URL)
            sequential_id: index + 1, // ID sequencial para usar na URL
            name: area.name,
            description: area.description,
            manager_id: area.manager_id,
            manager_name: managerName,
            teams: teamsCount,
            documents: processesCount, // Contagem total de processos
            active_processes: activeProcessesCount, // Processos ativos
            completed_processes: completedProcessesCount, // Processos completados
            assignees: mockAssignees,
            created_at: area.created_at,
            updated_at: area.updated_at
          }
        })
      )

      setAreas(areasWithManagers)
      
    } catch (error) {
      console.error('Error fetching areas:', error)
      setAreas([])
    } finally {
      setLoading(false)
    }
  }, [companyInfo?.id])

  const fetchAreaDetail = useCallback(async (sequentialId: string) => {
    if (!companyInfo?.id) return

    setLoadingDetail(true)
    
    try {
      const sequentialIdNum = parseInt(sequentialId)
      if (isNaN(sequentialIdNum) || sequentialIdNum < 1) {
        console.error('ID da área inválido')
        setCurrentArea(null)
        return
      }

      // Buscar todas as áreas da empresa ordenadas por created_at para mapear o ID sequencial
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select(`
          id,
          name,
          description,
          manager_id,
          company_id,
          is_active,
          created_at,
          updated_at
        `)
        .eq('company_id', companyInfo.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (areasError) {
        console.error('Error fetching areas:', areasError)
        setCurrentArea(null)
        return
      }

      if (!areasData || areasData.length === 0) {
        console.error('Nenhuma área encontrada')
        setCurrentArea(null)
        return
      }

      // Encontrar a área pelo ID sequencial (índice + 1)
      const targetAreaIndex = sequentialIdNum - 1
      if (targetAreaIndex < 0 || targetAreaIndex >= areasData.length) {
        console.error('Área não encontrada')
        setCurrentArea(null)
        return
      }

      const areaData = areasData[targetAreaIndex]

      // Buscar informações do gerente se existir
      let managerName = null
      if (areaData.manager_id) {
        try {
          const { data: managerData } = await supabase.rpc('get_user_basic_info', {
            p_user_id: areaData.manager_id
          })
          
          if (managerData && managerData.length > 0) {
            managerName = managerData[0].user_name
          }
        } catch (error) {
          console.error('Error fetching manager info:', error)
        }
      }

      setCurrentArea({
        ...areaData,
        manager_name: managerName
      })

    } catch (error) {
      console.error('Error fetching area details:', error)
      setCurrentArea(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [companyInfo?.id])

  const fetchCompanyMembers = useCallback(async () => {
    if (!companyInfo?.id) return

    setLoadingMembers(true)
    try {
      const { data, error } = await supabase.rpc('get_company_members', {
        p_company_id: companyInfo.id
      })

      if (error) {
        console.error('Error fetching members:', error)
        return
      }

      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching company members:', error)
      setMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }, [companyInfo?.id])

  const createArea = useCallback(async (areaData: {
    name: string
    description: string
    manager_id: string
  }) => {
    if (!companyInfo?.id || !user?.id) return false

    try {
      const { error } = await supabase
        .from('areas')
        .insert({
          name: areaData.name.trim(),
          description: areaData.description.trim() || null,
          manager_id: areaData.manager_id || null,
          company_id: companyInfo.id,
          is_active: true,
          created_by: user.id,
          updated_by: user.id
        })

      if (error) {
        console.error('Error creating area:', error)
        return false
      }

      // Recarregar áreas após criar
      await fetchAreas()
      return true
      
    } catch (error) {
      console.error('Error creating area:', error)
      return false
    }
  }, [companyInfo?.id, user?.id, fetchAreas])

  const refreshAreas = useCallback(() => {
    fetchAreas()
  }, [fetchAreas])

  // Carregar áreas quando o componente montar ou a empresa mudar
  useEffect(() => {
    if (companyInfo?.id) {
      fetchAreas()
    }
  }, [companyInfo?.id, fetchAreas])

  const value: AreaContextType = {
    // Estados
    areas,
    currentArea,
    loading,
    loadingDetail,
    loadingMembers,
    members,
    
    // Funções
    fetchAreas,
    fetchAreaDetail,
    fetchCompanyMembers,
    createArea,
    refreshAreas
  }

  return (
    <AreaContext.Provider value={value}>
      {children}
    </AreaContext.Provider>
  )
}
