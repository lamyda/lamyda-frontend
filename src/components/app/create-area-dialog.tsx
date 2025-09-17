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
import { useState, useEffect } from "react"
import { FileStackIcon } from "lucide-react"
import { useArea } from "@/contexts/AreaContext"

interface CreateAreaDialogProps {
  children: React.ReactNode
  onAreaCreated?: () => void
}

export default function CreateAreaDialog({ children, onAreaCreated }: CreateAreaDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: ''
  })
  
  const { members, loadingMembers, fetchCompanyMembers, createArea } = useArea()

  // Carregar membros da empresa quando o dialog abrir
  useEffect(() => {
    if (isOpen) {
      fetchCompanyMembers()
    }
  }, [isOpen, fetchCompanyMembers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Nome da área é obrigatório')
      return
    }

    setLoading(true)
    try {
      const success = await createArea(formData)
      
      if (success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          manager_id: ''
        })
        
        setIsOpen(false)
        onAreaCreated?.()
      } else {
        alert('Erro ao criar área. Tente novamente.')
      }
      
    } catch (error) {
      console.error('Error creating area:', error)
      alert('Erro inesperado ao criar área.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md gap-2">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-base font-medium">
            Criar Nova Área
          </DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar uma nova área na sua empresa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nome da área */}
          <div>
            <label htmlFor="area-name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da área *
            </label>
            <div className="flex items-center border border-gray-300 h-12 px-3 bg-white rounded-sm">
              <Input
                id="area-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Desenvolvimento, Marketing, Vendas..."
                className="w-full flex-1 bg-transparent focus-visible:ring-0 border-none outline-none shadow-none placeholder-gray-400 text-sm p-0"
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="area-description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="area-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva brevemente o que esta área faz..."
              className="w-full text-sm placeholder-gray-500 min-h-[80px] px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Gerente da área */}
          <div>
            <label htmlFor="area-manager" className="block text-sm font-medium text-gray-700 mb-2">
              Gerente da área
            </label>
            {loadingMembers ? (
              <div className="w-full h-10 border border-gray-300 rounded-md flex items-center justify-center">
                <span className="text-sm text-gray-500">Carregando membros...</span>
              </div>
            ) : (
              <select
                id="area-manager"
                value={formData.manager_id}
                onChange={(e) => handleInputChange('manager_id', e.target.value)}
                className="w-full px-3 py-2 h-12 placeholder-gray-400 text-gray-500 border border-gray-300 text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecionar gerente (opcional)</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user_name} - {member.role}
                  </option>
                ))}
              </select>
            )}
          </div>
        </form>

        <DialogFooter className="sm:justify-between mt-6">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="rounded-sm">
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="bg-lamyda-primary hover:brightness-110 rounded-sm text-white font-medium"
          >
            <FileStackIcon className="w-4 h-4" />
            {loading ? 'Criando...' : 'Criar área'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
