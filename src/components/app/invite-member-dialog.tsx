import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, ChevronDown, User, Settings, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useInvite } from "@/contexts/InviteContext"
import { useCompany } from "@/contexts/CompanyContext"

interface InviteMemberDialogProps {
  children: React.ReactNode
}

interface InvitedUser {
  email: string
  role: 'collaborator' | 'administrator'
}

interface InviteResult {
  email: string
  success: boolean
  error?: string
}

export default function InviteMemberDialog({ children }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<'collaborator' | 'administrator'>("collaborator")
  const [message, setMessage] = useState("Junte-se ao nosso time na Lamyda para criar e acessar documentos")
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([])
  const [inviteResults, setInviteResults] = useState<InviteResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { sendInvitations, isLoading } = useInvite()
  const { companyInfo } = useCompany()

  // Verificar se usuário pode convidar membros
  const canInviteMembers = () => {
    return companyInfo?.userRole === 'owner' || companyInfo?.userRole === 'administrator'
  }

  // Verificar se usuário pode convidar administradores (apenas owners)
  const canInviteAdministrators = () => {
    return companyInfo?.userRole === 'owner'
  }

  // Se usuário não pode convidar, não renderizar o dialog
  if (!canInviteMembers()) {
    return null
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Se o usuário não pode convidar administradores e o role atual é administrator,
  // resetar para collaborator
  useEffect(() => {
    if (!canInviteAdministrators() && role === 'administrator') {
      setRole('collaborator')
    }
  }, [companyInfo?.userRole])

  const addUserToList = () => {
    if (!email.trim()) return
    
    // Check if email already exists
    if (invitedUsers.some(user => user.email === email.trim())) {
      alert("Este email já foi adicionado à lista")
      return
    }
    
    // Add user to list
    const newUser: InvitedUser = {
      email: email.trim(),
      role: role
    }
    
    setInvitedUsers([...invitedUsers, newUser])
    
    // Reset email input
    setEmail("")
  }

  const removeUser = (emailToRemove: string) => {
    setInvitedUsers(invitedUsers.filter(user => user.email !== emailToRemove))
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const getRoleDisplayName = (role: 'collaborator' | 'administrator') => {
    return role === 'collaborator' ? 'Colaborador' : 'Administrador'
  }

  const handleInvite = async () => {
    if (invitedUsers.length === 0) return
    
    try {
      // Preparar convites com mensagem
      const invites = invitedUsers.map(user => ({
        email: user.email,
        role: user.role,
        message: message.trim() || undefined
      }))
      
      // Enviar convites
      const results = await sendInvitations(invites)
      
      // Mostrar resultados
      setInviteResults(results)
      setShowResults(true)
      
      // Limpar formulário se todos foram enviados com sucesso
      const allSuccess = results.every(r => r.success)
      if (allSuccess) {
        setInvitedUsers([])
        setEmail("")
        setRole("collaborator")
        setMessage("Junte-se ao nosso time na Lamyda para criar e acessar documentos")
      }
      
    } catch (error: any) {
      console.error("Error inviting members:", error)
      // Mostrar erro geral
      setInviteResults([{
        email: "Erro geral",
        success: false,
        error: error.message || "Erro inesperado ao enviar convites"
      }])
      setShowResults(true)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-base font-medium">Convidar Membros</DialogTitle>
          <DialogDescription>
            Convide pessoas para colaborar na sua empresa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Input Section with integrated select and button */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              E-mails
            </div>
            <div ref={dropdownRef} className="relative">
              <div className="flex border border-gray-300 rounded-sm bg-white overflow-hidden">
                {/* Email Input */}
                <input
                  type="email"
                  placeholder="colaborador@minhaempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                />
                
                {/* Role Select - apenas mostrar se houver mais de uma opção */}
                {canInviteAdministrators() && (
                  <div className="relative border-l border-gray-300">
                    <button
                      type="button"
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      className="flex items-center gap-2 bg-white px-3 py-2 pr-8 text-sm focus:outline-none h-full hover:bg-gray-50"
                    >
                      {role === "collaborator" ? (
                        <>
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Colaborador</span>
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>Administrador</span>
                        </>
                      )}
                    </button>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}
                
                {/* Role fixo para administradores que não podem convidar outros admins */}
                {!canInviteAdministrators() && (
                  <div className="border-l border-gray-300 px-3 py-2 bg-gray-50 text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Colaborador</span>
                  </div>
                )}
                
                {/* Include Button */}
                <button
                  onClick={addUserToList}
                  disabled={!email.trim()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300"
                >
                  Incluir
                </button>
              </div>

              {/* Custom Dropdown - Moved outside the input container */}
              {showRoleDropdown && (
                <div className="absolute top-full right-20 w-80 bg-white border border-gray-300 rounded-sm shadow-lg z-[9999] mt-1">
                  {/* Colaborador - sempre disponível */}
                  <div
                    onClick={() => {
                      setRole("collaborator")
                      setShowRoleDropdown(false)
                    }}
                    className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer ${
                      canInviteAdministrators() ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <User className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Colaborador</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Não pode alterar as configurações da conta ou convidar novos membros
                      </div>
                    </div>
                  </div>
                  
                  {/* Administrador - apenas para owners */}
                  {canInviteAdministrators() && (
                    <div
                      onClick={() => {
                        setRole("administrator")
                        setShowRoleDropdown(false)
                      }}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <Settings className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Administrador</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Pode alterar as configurações da conta e convidar novos membros
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Invited Users List */}
            {invitedUsers.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Usuários incluídos ({invitedUsers.length})
                </div>
                <div className="border border-gray-300 rounded-sm bg-white max-h-48 overflow-y-auto">
                  {invitedUsers.map((user, index) => (
                    <div
                      key={user.email}
                      className={`flex items-center justify-between p-3 ${
                        index !== invitedUsers.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar with initial */}
                        <div className="w-10 h-10 bg-gray-200 rounded-sm flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {getInitials(user.email)}
                          </span>
                        </div>
                        
                        {/* User info */}
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      
                      {/* Role and Remove button */}
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-600">
                          {getRoleDisplayName(user.role)}
                        </div>
                        <button
                          onClick={() => removeUser(user.email)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Section */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Mensagem (Opcional)
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Junte-se ao nosso time na Lamyda para criar e acessar documentos"
              className="w-full border border-gray-300 rounded-sm p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Results Section */}
          {showResults && inviteResults.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Resultados dos Convites
              </div>
              <div className="space-y-2">
                {inviteResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.email}
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {result.error}
                        </div>
                      )}
                      {result.success && (
                        <div className="text-xs text-green-600 mt-1">
                          Convite enviado com sucesso!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowResults(false)
                    setInviteResults([])
                  }}
                  className="text-xs shadow-none rounded-sm font-medium text-gray-900"
                >
                  Limpar Resultados
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button 
            onClick={handleInvite} 
            disabled={invitedUsers.length === 0 || isLoading}
            className="bg-lamyda-primary hover:brightness-110 rounded-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isLoading ? "Enviando..." : `Enviar ${invitedUsers.length > 1 ? 'convites' : 'convite'}`}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="rounded-sm">
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}