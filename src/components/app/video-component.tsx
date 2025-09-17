import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Upload, Video, Trash2, FileVideo, Sparkles, CheckCircle } from "lucide-react"
import { supabase } from '@/services/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ProcessStep {
  passo: number
  duracao: string
  descricao: string
  timestamp: string
}

interface VideoData {
  file: File
  url: string
  aiProcessedData?: {
    temp_id?: string
    process_name?: string
    company_name?: string
    area_name?: string
    analysis?: {
      processo_passos?: ProcessStep[]
      [key: string]: any
    }
    [key: string]: any
  }
}

interface VideoComponentProps {
  processId?: string
  onVideoProcessed?: (processedData: any) => void
  videoData?: VideoData | null
  onVideoChange?: (video: VideoData | null) => void
  processing?: boolean
  onProcessingChange?: (processing: boolean) => void
}

export default function VideoComponent({ 
  processId, 
  onVideoProcessed, 
  videoData, 
  onVideoChange, 
  processing = false, 
  onProcessingChange 
}: VideoComponentProps) {
  const { session } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  
  // Remover parâmetro não utilizado para evitar warning
  console.log('Process ID:', processId)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Verificar se é um arquivo de vídeo
    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione apenas arquivos de vídeo.')
      return
    }

    // Verificar tamanho do arquivo (limite de 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB em bytes
    if (file.size > maxSize) {
      alert('O arquivo é muito grande. O tamanho máximo é 500MB.')
      return
    }

    setUploading(true)
    
    try {
      const url = URL.createObjectURL(file)
      const newVideoData: VideoData = {
        file,
        url,
      }
      
      // Atualizar estado do componente pai
      if (onVideoChange) {
        onVideoChange(newVideoData)
      }
      
      setUploading(false)
    } catch (error) {
      console.error('Error handling video:', error)
      setUploading(false)
    }
  }

  const handleProcessWithAI = async () => {
    if (!videoData?.file) return
    await processVideoWithAI(videoData.file, videoData)
  }

  const processVideoWithAI = async (file: File, currentVideoData?: VideoData) => {
    onProcessingChange?.(true)
    
    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData()
      formData.append('video_file', file)
      formData.append('process_name', 'Processo em Criação')
      formData.append('process_description', 'Processo sendo criado pelo usuário')
      formData.append('company_name', 'Empresa')
      formData.append('area_name', 'Área')

      // Chamar a edge function usando o cliente Supabase
      const { data: result, error } = await supabase.functions.invoke('video-temp-ai-process', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      })

      if (error) {
        throw new Error(error.message || 'Erro ao processar vídeo com IA')
      }
      
      if (result && result.success) {
        // 🐛 DEBUG: Mostrar o JSON completo retornado pela IA
        console.log('🤖 RESULTADO COMPLETO DA IA:', JSON.stringify(result, null, 2))
        console.log('🤖 DADOS DA IA:', JSON.stringify(result.data, null, 2))
        
        // Atualizar videoData com os dados processados pela IA
        const dataToUpdate = currentVideoData || videoData
        if (onVideoChange && dataToUpdate) {
          const updatedVideoData: VideoData = {
            ...dataToUpdate,
            aiProcessedData: result.data
          }
          console.log('🎬 VIDEO DATA ATUALIZADO:', JSON.stringify(updatedVideoData, null, 2))
          console.log('🔄 CHAMANDO onVideoChange com dados da IA')
          onVideoChange(updatedVideoData)
        } else {
          console.log('❌ NÃO PODE ATUALIZAR VIDEO DATA:', { 
            hasVideoData: !!videoData, 
            hasCurrentVideoData: !!currentVideoData,
            hasOnVideoChange: !!onVideoChange 
          })
        }
        
        // Notificar componente pai se callback foi fornecido
        if (onVideoProcessed) {
          onVideoProcessed(result.data)
        }
      } else {
        throw new Error(result?.error || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Error processing video with AI:', error)
      alert('Erro ao processar vídeo com IA. Tente novamente.')
    } finally {
      onProcessingChange?.(false)
    }
  }

  const removeVideo = () => {
    if (videoData?.url) {
      URL.revokeObjectURL(videoData.url)
    }
    
    // Limpar estado do componente pai
    if (onVideoChange) {
      onVideoChange(null)
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Função para converter timestamp (formato "0:15") para segundos
  const timestampToSeconds = (timestamp: string): number => {
    const parts = timestamp.split(':')
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10)
      const seconds = parseInt(parts[1], 10)
      return minutes * 60 + seconds
    }
    return 0
  }

  // Função para navegar para um timestamp específico no vídeo
  const jumpToTimestamp = (timestamp: string) => {
    if (videoRef.current) {
      const seconds = timestampToSeconds(timestamp)
      videoRef.current.currentTime = seconds
      videoRef.current.play()
    }
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between px-8 pt-8">
        <div className="text-left">
          <h2 className="text-2xl font-medium tracking-tight mb-2">Vídeo do Processo</h2>
          <p className="text-sm text-gray-500 mb-4">Adicione um vídeo explicativo do processo</p>
        </div>
        
        <div>
          {!videoData ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload">
                <Button
                  type="button"
                  className="bg-lamyda-primary hover:brightness-110 shadow-none rounded-sm text-white font-medium"
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Selecionar Vídeo'}
                  </span>
                </Button>
              </label>
            </>
          ) : !videoData.aiProcessedData ? (
            <Button
              type="button"
              onClick={handleProcessWithAI}
              className="ai-button"
              disabled={processing}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {processing ? 'Processando...' : 'Gerar com Lamyda AI'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleProcessWithAI}
              variant="outline"
              className="shadow-none rounded-sm font-medium"
              disabled={processing}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {processing ? 'Processando...' : 'Processar Novamente'}
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {!videoData && !uploading ? (
          /* Empty State */
          <div className="text-center py-12 px-8 border-t border-gray-200">
            <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum vídeo adicionado ainda</p>
            <p className="text-sm text-gray-400 mt-1">
              Selecione um arquivo de vídeo para mostrar o processo em ação
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Formatos suportados: MP4, AVI, MOV, WMV (máx. 500MB)
            </p>
          </div>
        ) : uploading ? (
          /* Loading State */
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-lamyda-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Processando vídeo...</p>
            </div>
          </div>
        ) : (
          /* Video Display */
          <div className="flex-1 flex flex-col">
            {/* Video Info */}
            <div className="bg-white border-t border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{videoData?.file.name}</h3>
                    <p className="text-sm text-gray-500">
                      {videoData && formatFileSize(videoData.file.size)} • {videoData?.file.type}
                    </p>
                    
                    {/* AI Processing Status */}
                    {processing && (
                      <div className="flex items-center mt-2 text-sm text-blue-600">
                        <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
                        Processando com IA...
                      </div>
                    )}
                    
                    {videoData?.aiProcessedData && !processing && (
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Processado com IA
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeVideo}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Video Player - Conditional Layout */}
            {videoData?.aiProcessedData ? (
              // Layout com vídeo (70%) e passos (30%) quando processado pela IA
              <div className="flex-1 flex">
                {/* Vídeo - 70% */}
                <div className="w-[70%] bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoData.url}
                    controls
                    className="w-full h-full object-contain"
                    style={{ maxHeight: 'calc(100vh - 200px)' }}
                  >
                    Seu navegador não suporta a reprodução de vídeo.
                  </video>
                </div>
                
                {/* Passos do Processo - 30% */}
                <div className="w-[30%] bg-gray-50 border-l border-gray-200 flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900">Passos do Processo</h3>
                    <p className="text-sm text-gray-600 mt-1">Cronologia por momento do processo</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {videoData.aiProcessedData?.analysis?.processo_passos ? (
                      <div className="p-4 space-y-3">
                        {videoData.aiProcessedData.analysis.processo_passos.map((passo: ProcessStep, index: number) => (
                          <div 
                            key={index} 
                            className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                            onClick={() => jumpToTimestamp(passo.timestamp)}
                            title={`Clique para ir para ${passo.timestamp}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {passo.passo}
                                </span>
                                <span className="text-xs font-medium text-blue-600 hover:text-blue-800">
                                  {passo.timestamp}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {passo.duracao}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {passo.descricao}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">Nenhum passo identificado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Layout original - vídeo em tela cheia quando não processado
              <div className="flex-1 bg-black flex items-center justify-center">
                {videoData?.url && (
                  <video
                    src={videoData.url}
                    controls
                    className="w-full h-full object-contain"
                    style={{ maxHeight: 'calc(100vh - 200px)' }}
                  >
                    Seu navegador não suporta a reprodução de vídeo.
                  </video>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
