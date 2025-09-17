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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useArea } from "@/contexts/AreaContext"
import { useTeam } from "@/contexts/TeamContext"

interface CreateTeamDialogProps {
  children: React.ReactNode
  onTeamCreated: () => void
}

interface TeamMember {
  user_id: string
  user_name: string
  user_email: string
}

interface InviteResult {
  email: string
  success: boolean
  error?: string
}

export default function CreateTeamDialog({ children, onTeamCreated }: CreateTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAreaId, setSelectedAreaId] = useState("")
  const [selectedLeaderId, setSelectedLeaderId] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [inviteResults, setInviteResults] = useState<InviteResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { areas, members, fetchCompanyMembers } = useArea()
  const { createTeam } = useTeam()

  useEffect(() => {
    if (isOpen) {
      fetchCompanyMembers()
    }
  }, [isOpen, fetchCompanyMembers])

  const addMemberToTeam = () => {
    if (!selectedMemberId || selectedMemberId === "no-member") return
    
    // Check if user already exists
    if (teamMembers.some(member => member.user_id === selectedMemberId)) {
      alert("Este usuário já foi adicionado à lista")
      return
    }
    
    // Find selected member data
    const selectedMember = members.find(member => member.user_id === selectedMemberId)
    if (!selectedMember) return
    
    // Add member to list
    const newMember: TeamMember = {
      user_id: selectedMember.user_id,
      user_name: selectedMember.user_name,
      user_email: selectedMember.user_email
    }
    
    setTeamMembers([...teamMembers, newMember])
    
    // Reset selection
    setSelectedMemberId("")
  }

  const removeMember = (userIdToRemove: string) => {
    setTeamMembers(teamMembers.filter(member => member.user_id !== userIdToRemove))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const resetForm = () => {
    setTeamName("")
    setDescription("")
    setSelectedAreaId("")
    setSelectedLeaderId("")
    setSelectedMemberId("")
    setTeamMembers([])
    setInviteResults([])
    setShowResults(false)
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !selectedAreaId) {
      alert("Nome do time e área são obrigatórios")
      return
    }

    setIsLoading(true)
    
    try {
      const success = await createTeam({
        name: teamName,
        description: description,
        area_id: selectedAreaId,
        team_leader_id: selectedLeaderId === "no-leader" ? null : selectedLeaderId || null,
        members: teamMembers
      })

      if (success) {
        // Simular resultados para mostrar feedback
        const inviteResults: InviteResult[] = teamMembers.map(member => ({
          email: member.user_email,
          success: true
        }))

        if (inviteResults.length > 0) {
          setInviteResults(inviteResults)
          setShowResults(true)
        }

        // Notificar que o time foi criado
        onTeamCreated()
        
        // Fechar dialog após um tempo
        setTimeout(() => {
          setIsOpen(false)
          resetForm()
        }, 1500)
      } else {
        alert('Erro ao criar time. Tente novamente.')
      }
      
    } catch (error: any) {
      console.error("Error creating team:", error)
      alert(`Erro inesperado: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-base font-medium">Criar Novo Time</DialogTitle>
          <DialogDescription>
            Crie um novo time para organizar sua equipe por área de atuação.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Coluna Esquerda - Informações do Time */}
          <div className="space-y-4">
            {/* Nome do Time */}
            <div>
              <Label htmlFor="team-name" className="text-sm font-medium text-gray-700">
                Nome do Time *
              </Label>
              <Input
                id="team-name"
                placeholder="Ex: Desenvolvimento Frontend"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1 rounded-sm"
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva o propósito e responsabilidades do time..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 rounded-sm resize-none"
                rows={3}
              />
            </div>

            {/* Área */}
            <div>
              <Label htmlFor="area" className="text-sm font-medium text-gray-700">
                Área *
              </Label>
              <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                <SelectTrigger className="mt-1 rounded-sm">
                  <SelectValue placeholder="Selecione uma área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Leader */}
            <div>
              <Label htmlFor="leader" className="text-sm font-medium text-gray-700">
                Líder do Time
              </Label>
              <Select value={selectedLeaderId} onValueChange={setSelectedLeaderId}>
                <SelectTrigger className="mt-1 rounded-sm">
                  <SelectValue placeholder="Selecione um líder (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-leader">Sem líder</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.user_name} ({member.user_email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Coluna Direita - Adicionar Membros */}
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Adicionar Membros
              </div>
              <div className="flex gap-2">
                {/* Member Select */}
                <div className="flex-1">
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.user_name} ({member.user_email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Add Button */}
                <Button
                  type="button"
                  onClick={addMemberToTeam}
                  disabled={!selectedMemberId || selectedMemberId === "no-member"}
                  variant="outline"
                  className="rounded-sm"
                >
                  Incluir
                </Button>
              </div>

              {/* Team Members List */}
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Membros incluídos ({teamMembers.length})
                </div>
                {teamMembers.length > 0 ? (
                  <div className="border border-gray-300 rounded-sm bg-white max-h-64 overflow-y-auto">
                    {teamMembers.map((member, index) => (
                      <div
                        key={member.user_id}
                        className={`flex items-center justify-between p-3 ${
                          index !== teamMembers.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-sm flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {getInitials(member.user_name)}
                            </span>
                          </div>
                          
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {member.user_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.user_email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => removeMember(member.user_id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-sm bg-gray-50 p-6 text-center">
                    <div className="text-gray-500 text-sm">
                      Nenhum membro foi adicionado ao time
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Use o seletor acima para adicionar membros
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showResults && inviteResults.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Resultados da Criação do Time
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
                          Adicionado ao time com sucesso!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}

        <DialogFooter className="sm:justify-start">
          <Button 
            onClick={handleCreateTeam} 
            disabled={!teamName.trim() || !selectedAreaId || isLoading}
            className="bg-lamyda-primary hover:brightness-110 rounded-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            {isLoading ? "Criando..." : "Criar Time"}
          </Button>
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="secondary" 
              className="rounded-sm"
              onClick={resetForm}
            >
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
