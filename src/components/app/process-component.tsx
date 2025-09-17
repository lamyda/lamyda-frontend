import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TiptapEditor from "@/components/ui/tiptap-editor"

interface TempImage {
  id: string
  file: File
  dataUrl: string
  name: string
}
import { useArea } from "@/contexts/AreaContext"
import { useTeam } from "@/contexts/TeamContext"
import { supabase } from "@/services/supabase"

interface Person {
  user_id: string
  user_name: string
  user_email: string
}

interface ProcessComponentProps {
  formData: {
    name: string
    description: string
    type: string
    area_id: string
    team_id: string
    person_in_charge_id: string
    notes: string
  }
  onFormChange: (field: string, value: string) => void
  processId?: string // ID do processo para upload de imagens
  onTempImagesChange?: (images: TempImage[]) => void // Callback para imagens temporárias
  onGenerateNotesWithAI?: () => void // Callback para gerar notas com IA
}

export default function ProcessComponent({ formData, onFormChange, processId, onTempImagesChange, onGenerateNotesWithAI }: ProcessComponentProps) {
  const { areas } = useArea()
  const { teams } = useTeam()
  
  const [people, setPeople] = useState<Person[]>([])
  const [loadingPeople, setLoadingPeople] = useState(false)

  // Fetch people for person in charge selection
  useEffect(() => {
    const fetchPeople = async () => {
      setLoadingPeople(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_id, user_name, user_email')
          .order('user_name')
        
        if (error) {
          console.error('Error fetching people:', error)
          return
        }
        
        setPeople(data || [])
      } catch (error) {
        console.error('Error fetching people:', error)
      } finally {
        setLoadingPeople(false)
      }
    }

    fetchPeople()
  }, [])

  return (
    <div className="w-full h-screen flex flex-col space-y-6">
      {/* Process Name */}
      <div className="space-y-0 mb-0">
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          placeholder="Nome do Processo: Processo de Recrutamento e Seleção"
          className="w-full p-8 rounded-none border-0 border-b border-gray-200 shadow-none placeholder-gray-400 focus:ring-0 focus-visible:ring-0 focus-visible:border-gray-200 text-6xl font-semibold"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2 mb-0">
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          placeholder="Descreva brevemente o que este processo abrange..."
          className="w-full p-8 rounded-none border-0 border-b border-gray-200 shadow-none placeholder-gray-400 focus:ring-0 focus-visible:ring-0 focus-visible:border-gray-200"
          rows={3}
        />
      </div>

      {/* Selects em linha */}
      <div className="w-full flex flex-col md:flex-row space-y-4 md:space-y-0 md:-space-x-px mb-0">
        {/* Process Type */}
        <div className="space-y-2 flex-1">
          <Select value={formData.type} onValueChange={(value) => onFormChange('type', value)}>
            <SelectTrigger className="w-full rounded-none border-l-0 border-t-0 shadow-none mb-0">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="process">
                Processo
              </SelectItem>
              <SelectItem value="policy">
                Política
              </SelectItem>
              <SelectItem value="guideline">
                Diretriz
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Area Selection */}
        <div className="space-y-2 flex-1">
          <Select value={formData.area_id} onValueChange={(value) => onFormChange('area_id', value)}>
            <SelectTrigger className="rounded-none w-full border-l-0 border-t-0 shadow-none mb-0">
              <SelectValue placeholder="Selecione uma área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma área</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Team Selection */}
        <div className="space-y-2 flex-1">
          <Select value={formData.team_id} onValueChange={(value) => onFormChange('team_id', value)}>
            <SelectTrigger className="rounded-none w-full border-l-0 border-t-0 shadow-none mb-0">
              <SelectValue placeholder="Selecione um time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum time</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Person in Charge */}
        <div className="space-y-2 flex-1">
          <Select 
            value={formData.person_in_charge_id} 
            onValueChange={(value) => onFormChange('person_in_charge_id', value)}
            disabled={loadingPeople}
          >
            <SelectTrigger className="rounded-l-none w-full rounded-none border-r-0 border-l-0 border-t-0 shadow-none mb-0">
              <SelectValue placeholder={loadingPeople ? "Carregando..." : "Selecione um responsável"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum responsável</SelectItem>
              {people.map((person) => (
                <SelectItem key={person.user_id} value={person.user_id}>
                  <div className="flex flex-col">
                    <span>{person.user_name}</span>
                    <span className="text-xs text-gray-500">{person.user_email}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Editor de Texto Rico */}
      <div className="space-y-2 flex-1">
        <TiptapEditor
          content={formData.notes || ''}
          onChange={(content) => onFormChange('notes', content)}
          placeholder="Adicione observações, detalhes adicionais ou notas sobre este processo..."
          className="w-full"
          minHeight="300px"
          processId={processId}
          onTempImagesChange={onTempImagesChange}
          onGenerateWithAI={onGenerateNotesWithAI}
        />
      </div>
    </div>
  )
}
