import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useCompany } from '@/contexts/CompanyContext'

interface InviteRequest {
  email: string
  role: 'administrator' | 'collaborator' | 'visitor'
  message?: string
}

interface MemberInvitation {
  id: string
  company_id: string
  email: string
  role: string
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired'
  invited_by: string
  invited_at: string
  expires_at: string
  accepted_at?: string
  rejected_at?: string
  created_at: string
  updated_at: string
  // Joins
  inviter?: {
    user_name: string
    user_email: string
  }
}

interface InviteResult {
  email: string
  success: boolean
  error?: string
}

interface InviteContextType {
  // Estado
  sentInvitations: MemberInvitation[]
  isLoading: boolean
  
  // Ações principais
  sendInvitations: (invites: InviteRequest[]) => Promise<InviteResult[]>
  cancelInvitation: (inviteId: string) => Promise<{ error: string | null }>
  resendInvitation: (inviteId: string) => Promise<{ error: string | null }>
  
  // Getters
  refreshInvitations: () => Promise<void>
}

const InviteContext = createContext<InviteContextType | undefined>(undefined)

export const useInvite = () => {
  const context = useContext(InviteContext)
  if (context === undefined) {
    throw new Error('useInvite deve ser usado dentro de um InviteProvider')
  }
  return context
}

interface InviteProviderProps {
  children: React.ReactNode
}

export const InviteProvider: React.FC<InviteProviderProps> = ({ children }) => {
  const [sentInvitations, setSentInvitations] = useState<MemberInvitation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { user, userInfo } = useAuth()
  const { companyInfo } = useCompany()

  const refreshInvitations = async () => {
    if (!user || !companyInfo) return

    try {
      // Buscar convites sem join primeiro
      const { data, error } = await supabase
        .from('member_invitations')
        .select('*')
        .eq('company_id', companyInfo.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Para cada convite, buscar informações do usuário que convidou usando RPC
      const invitationsWithInviter = await Promise.all(
        (data || []).map(async (invitation) => {
          try {
            const { data: inviterData, error: inviterError } = await supabase
              .rpc('get_user_basic_info', { p_user_id: invitation.invited_by })

            if (inviterError) {
              console.error('Error fetching inviter info via RPC:', inviterError)
            }

            // A RPC retorna um array, pegar o primeiro item
            const inviterInfo = inviterData && inviterData.length > 0 ? inviterData[0] : null

            return {
              ...invitation,
              inviter: inviterInfo
            }
          } catch (error) {
            console.error('Error fetching inviter data:', error)
            return {
              ...invitation,
              inviter: null
            }
          }
        })
      )

      setSentInvitations(invitationsWithInviter)
    } catch (error) {
      console.error('Error fetching invitations:', error)
      setSentInvitations([])
    }
  }

  useEffect(() => {
    if (user && companyInfo) {
      refreshInvitations()
    }
  }, [user, companyInfo])

  const sendInvitations = async (invites: InviteRequest[]): Promise<InviteResult[]> => {
    if (!user || !userInfo || !companyInfo) {
      throw new Error('Usuário ou empresa não encontrados')
    }

    setIsLoading(true)

    try {
      // Get the current session to send authorization header
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Usuário não autenticado')
      }

      // Call our Edge Function
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          invites,
          companyId: companyInfo.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw error
      }

      // Refresh invitations list
      await refreshInvitations()

      return data.results || []

    } catch (error: any) {
      console.error('Error sending invitations:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const cancelInvitation = async (inviteId: string) => {
    if (!user) return { error: 'Usuário não encontrado' }

    try {
      const { error } = await supabase
        .from('member_invitations')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('invited_by', user.id) // Só pode cancelar convites próprios

      if (error) throw error

      await refreshInvitations()
      return { error: null }

    } catch (error: any) {
      console.error('Error cancelling invitation:', error)
      return { error: error.message || 'Erro ao cancelar convite' }
    }
  }

  const resendInvitation = async (inviteId: string) => {
    if (!user || !userInfo || !companyInfo) {
      return { error: 'Usuário ou empresa não encontrados' }
    }

    setIsLoading(true)
    
    try {
      // 1. Buscar dados do convite
      const { data: invitation, error: fetchError } = await supabase
        .from('member_invitations')
        .select('email, role, message')
        .eq('id', inviteId)
        .eq('invited_by', user.id) // Só pode reenviar convites próprios
        .single()

      if (fetchError) throw fetchError
      if (!invitation) throw new Error('Convite não encontrado')

      // 2. Reenviar via Edge Function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          invites: [{
            email: invitation.email,
            role: invitation.role as 'administrator' | 'collaborator' | 'visitor',
            message: invitation.message || undefined
          }],
          companyId: companyInfo.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) throw error

      const result = data.results?.[0]
      if (!result?.success) {
        throw new Error(result?.error || 'Erro ao reenviar convite')
      }

      // 3. Atualizar registro (resetar data de expiração)
      const { error: updateError } = await supabase
        .from('member_invitations')
        .update({ 
          status: 'pending',
          invited_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 dias
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)

      if (updateError) throw updateError

      await refreshInvitations()
      return { error: null }

    } catch (error: any) {
      console.error('Error resending invitation:', error)
      return { error: error.message || 'Erro ao reenviar convite' }
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    sentInvitations,
    isLoading,
    sendInvitations,
    cancelInvitation,
    resendInvitation,
    refreshInvitations,
  }

  return (
    <InviteContext.Provider value={value}>
      {children}
    </InviteContext.Provider>
  )
}

export default InviteContext
