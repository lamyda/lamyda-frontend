import { useState, useEffect } from 'react'

interface TempImage {
  id: string
  file: File
  dataUrl: string
  name: string
}

interface DocumentItem {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  file: File
}

interface VideoData {
  file: File
  url: string
  aiProcessedData?: any // JSON retornado pela IA
}
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { useProcess } from "@/contexts/ProcessContext"
import { useAuth } from "@/contexts/AuthContext"
import { useBreadcrumb } from "@/layouts/PrivateLayout"
import CreateProcessTabs from "@/components/app/create-process-tabs"
import ProcessComponent from "@/components/app/process-component"
import VideoComponent from "@/components/app/video-component"
import MindMapComponent from "@/components/app/mindmap-component"
import DocumentsComponent from "@/components/app/documents-component"

export default function CreateProcess() {
  const navigate = useNavigate()
  const { createProcess } = useProcess()
  const { user } = useAuth()
  const { setBreadcrumb, resetBreadcrumb } = useBreadcrumb()
  
  const [loading, setLoading] = useState(false)
  const [tempImages, setTempImages] = useState<TempImage[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [videoProcessing, setVideoProcessing] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'process', // 'process', 'policy', 'guideline'
    area_id: 'none',
    team_id: 'none',
    person_in_charge_id: 'none',
    notes: ''
  })


  // Effect para atualizar o breadcrumb quando o nome do processo mudar
  useEffect(() => {
    if (formData.name.trim()) {
      setBreadcrumb(formData.name.trim())
    } else {
      resetBreadcrumb()
    }
  }, [formData.name, setBreadcrumb, resetBreadcrumb])

  // Effect para resetar o breadcrumb quando o componente for desmontado
  useEffect(() => {
    return () => {
      resetBreadcrumb()
    }
  }, [resetBreadcrumb])

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTempImagesChange = (images: TempImage[]) => {
    setTempImages(images)
  }

  const handleDocumentsChange = (docs: DocumentItem[]) => {
    setDocuments(docs)
  }

  const handleVideoChange = (video: VideoData | null) => {
    setVideoData(video)
  }

  const handleGenerateNotesWithAI = () => {
    // Primeira validação: Verificar se tem vídeo processado com JSON
    if (videoData?.aiProcessedData) {
      console.log('🤖 VIDEO DATA COM IA:', videoData.aiProcessedData)
      
      const aiData = videoData.aiProcessedData
      const analysisData = aiData.analysis || aiData
      
      console.log('📊 ANALYSIS DATA:', analysisData)
      
      // Extrair os campos necessários
      const descricaoParaBusca = analysisData.descricao_para_busca || ''
      const processoPassosMarkdown = analysisData.processo_passos_markdown || ''
      
      console.log('🔍 DESCRIÇÃO PARA BUSCA:', descricaoParaBusca)
      console.log('📝 PROCESSO PASSOS MARKDOWN:', processoPassosMarkdown)
      
      if (descricaoParaBusca || processoPassosMarkdown) {
        // Formatar conteúdo com markdown adequado para TipTap
        let generatedContent = ''
        
        if (descricaoParaBusca) {
          generatedContent += `<h3>Descrição do Processo</h3><p>${descricaoParaBusca}</p>`
        }
        
        if (processoPassosMarkdown) {
          // Adicionar espaçamento reduzido se já tem descrição
          if (generatedContent) {
            generatedContent += '<br>' // Apenas uma quebra para espaçamento
          }
          
          // Converter markdown para HTML compatível com TipTap
          let processedMarkdown = processoPassosMarkdown
            // Títulos
            .replace(/^### (.*?)$/gm, '<h4>$1</h4>')
            .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^# (.*?)$/gm, '<h2>$1</h2>')
            
            // Texto em negrito e itálico
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            
            // Listas numeradas (preservar estrutura)
            .replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li>$2</li>')
            
            // Listas com marcadores
            .replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li>$1</li>')
            
            // Reduzir quebras de linha excessivas
            .replace(/\n\s*\n\s*\n/g, '</p><p>')  // Três ou mais quebras → parágrafo
            .replace(/\n\s*\n/g, '<br><br>')      // Quebras duplas → duas <br>
            .replace(/\n/g, '<br>')               // Quebras simples → <br>
          
          // Envolver listas em <ul> de forma mais inteligente
          let finalMarkdown = processedMarkdown
          
          // Encontrar sequências de <li> e envolvê-las em <ul>
          finalMarkdown = finalMarkdown.replace(/(<li>.*?<\/li>)(?:\s*<br>\s*<li>.*?<\/li>)*/gs, (match: string) => {
            // Remover <br> entre itens da lista
            const cleanMatch = match.replace(/<br>\s*(?=<li>)/g, '')
            return `<ul>${cleanMatch}</ul>`
          })
          
          // Limpar quebras excessivas no final
          finalMarkdown = finalMarkdown
            .replace(/<br><br><br>/g, '<br><br>')  // Máximo duas quebras consecutivas
            .replace(/(<\/h[2-4]>)<br>/g, '$1')    // Remover <br> após títulos
          
          // Envolver em parágrafos se necessário
          if (!finalMarkdown.startsWith('<')) {
            finalMarkdown = `<p>${finalMarkdown}</p>`
          }
          
          generatedContent += `<h3>Passos do Processo</h3>${finalMarkdown}`
        }
        
        // Debug: mostrar o conteúdo HTML gerado
        console.log('🔧 CONTEÚDO HTML GERADO:', generatedContent)
        
        // Teste: adicionar conteúdo simples primeiro
        const testContent = '<h3>Teste</h3><p>Este é um teste simples para verificar se o TipTap está funcionando.</p>'
        console.log('🧪 TESTE SIMPLES:', testContent)
        
        // Atualizar o campo notes com o conteúdo gerado
        handleFormChange('notes', generatedContent)
        
        // Verificar se o conteúdo foi realmente definido
        console.log('📝 CONTEÚDO ATUAL DO FORM:', formData.notes)
        console.log('✅ CONTEÚDO GERADO E INSERIDO NO EDITOR')
      } else {
        alert('Não foi possível extrair informações do vídeo processado.')
      }
    } else {
      // Se não tem vídeo processado, mostrar mensagem
      alert('Para gerar conteúdo com IA, primeiro importe e processe um vídeo na aba "Vídeo".')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <ProcessComponent 
            formData={formData} 
            onFormChange={handleFormChange}
            onTempImagesChange={handleTempImagesChange}
            onGenerateNotesWithAI={handleGenerateNotesWithAI}
          />
        )
      case 'video':
        return (
          <VideoComponent 
            videoData={videoData} 
            onVideoChange={handleVideoChange}
            processing={videoProcessing}
            onProcessingChange={setVideoProcessing}
          />
        )
      case 'mindmap':
        return (
          <MindMapComponent 
            videoData={videoData} 
            processText={formData.description}
            markdownContent={markdownContent}
            onMarkdownChange={setMarkdownContent}
          />
        )
      case 'documents':
        return <DocumentsComponent documents={documents} onDocumentsChange={handleDocumentsChange} />
      default:
        return (
          <ProcessComponent 
            formData={formData} 
            onFormChange={handleFormChange}
            onTempImagesChange={handleTempImagesChange}
            onGenerateNotesWithAI={handleGenerateNotesWithAI}
          />
        )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Por favor, insira um nome para o processo.')
      return
    }

    setLoading(true)
    
    try {
      const processData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        area_id: formData.area_id === 'none' || !formData.area_id ? null : formData.area_id,
        team_id: formData.team_id === 'none' || !formData.team_id ? null : formData.team_id,
        person_in_charge_id: formData.person_in_charge_id === 'none' || !formData.person_in_charge_id ? null : formData.person_in_charge_id,
        notes: formData.notes || null, // HTML do TipTap editor
        status: true, // Active by default
        created_by: user?.id
      }

      // 🐛 DEBUG: Verificar se videoData está sendo passado
      console.log('🎬 VIDEO DATA NO CREATE PROCESS:', JSON.stringify(videoData, null, 2))
      
      await createProcess(processData, tempImages, documents, videoData, markdownContent)
      
      // Navigate back to processes list
      navigate('/processes')
      
    } catch (error) {
      console.error('Error creating process:', error)
      alert('Erro ao criar processo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-0 pb-0 relative">
      {/* Tabs */}
      <CreateProcessTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {/* Form - Com padding bottom para compensar botões fixos */}
      <div className="w-full pb-20">
        <form id="create-process-form" onSubmit={handleSubmit}>
          {/* Tab Content */}
          {renderTabContent()}
        </form>
      </div>
      
      {/* Submit Buttons - Fixos na parte inferior */}
      <div className="fixed bottom-0 left-76 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex items-center gap-3 justify-end max-w-7xl mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/processes')}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            form="create-process-form"
            disabled={loading}
            className="bg-lamyda-primary hover:brightness-110 shadow-none rounded-sm text-white font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Criando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Criar Processo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
