import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn } from 'lucide-react'

export default function SetupPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { 
    user,
    requiresPasswordChange, 
    resetPassword, 
    markPasswordSet,
    processInviteAcceptance 
  } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Se usuário não está autenticado, redirect para login
    if (!user) {
      navigate('/sign-in')
      return
    }
    
    // Se usuário não precisa trocar senha, redirect para dashboard
    if (!requiresPasswordChange()) {
      navigate('/dashboard')
      return
    }
  }, [user, requiresPasswordChange, navigate])

  const getInviteData = () => {
    // Pegar dados do convite dos metadados do usuário
    if (user?.user_metadata) {
      return {
        company_name: user.user_metadata.company_name || 'Empresa',
        role: user.user_metadata.role || 'colaborator',
        invited_by: user.user_metadata.invited_by || 'Administrador',
        message: user.user_metadata.message || '',
        company_id: user.user_metadata.company_id,
        invited_by_id: user.user_metadata.invited_by_id
      }
    }
    return null
  }

  const inviteData = getInviteData()

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      'owner': 'Proprietário',
      'administrator': 'Administrador', 
      'collaborator': 'Colaborador',
      'visitor': 'Visitante'
    }
    return roleMap[role as keyof typeof roleMap] || role
  }

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não conferem!')
      return
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres!')
      return
    }
    
    setLoading(true)
    try {
      // 1. Definir senha do usuário
      const { error: passwordError } = await resetPassword(password)
      if (passwordError) {
        throw new Error(passwordError)
      }
      
      // 2. Se tem dados de convite, processar aceite
      if (inviteData?.company_id && inviteData?.role && inviteData?.invited_by_id) {
        const { error: inviteError } = await processInviteAcceptance(
          inviteData.company_id,
          inviteData.role,
          inviteData.invited_by_id
        )
        if (inviteError) {
          throw new Error(inviteError)
        }
      }
      
      // 3. Marcar senha como definida
      const { error: markError } = await markPasswordSet()
      if (markError) {
        throw new Error(markError)
      }
      
      // 4. Redirect para dashboard
      navigate('/dashboard')
      
    } catch (error: any) {
      console.error('Erro ao definir senha:', error)
      setError(error.message || 'Erro ao definir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (!user || !requiresPasswordChange()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <div className="max-w-md w-full space-y-8">
        {/* Card principal */}
        <div>
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {inviteData ? `Bem-vindo à ${inviteData.company_name}!` : 'Defina sua senha'}
            </h2>
            <p className="text-gray-600">
              {inviteData ? 'Defina sua senha para acessar o sistema' : 'É necessário definir uma nova senha'}
            </p>
          </div>

          {/* Informações do convite */}
          {inviteData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-blue-900">Cargo:</span>
                  <span className="text-sm text-blue-800">{getRoleDisplayName(inviteData.role)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-blue-900">Convidado por:</span>
                  <span className="text-sm text-blue-800">{inviteData.invited_by}</span>
                </div>
                {inviteData.message && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-blue-800 italic">"{inviteData.message}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSetupPassword} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="flex items-center border border-gray-300 h-12 px-3 bg-white">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="flex-1 bg-transparent focus-visible:ring-0 border-none outline-none shadow-none text-base placeholder-gray-400 text-sm p-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="flex items-center border border-gray-300 h-12 px-3 bg-white">
                <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                required
                minLength={6}
                className="flex-1 bg-transparent focus-visible:ring-0 border-none outline-none shadow-none text-base placeholder-gray-400 text-sm p-0"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-lamyda-primary font-medium rounded-none h-10 text-sm cursor-pointer hover:brightness-110"
            >
              <LogIn className="w-5 h-5 mr-1" />
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Definindo senha...
                </div>
              ) : (
                'Definir Senha e Entrar'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Ao definir sua senha, você concorda com os termos de uso da Lamyda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
