import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/services/supabase'
import { useCompany } from './CompanyContext'
import { useAuth } from './AuthContext'

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
  aiProcessedData?: any
}

interface Process {
  id: string
  sequential_id: number
  name: string
  description: string | null
  type: string
  status: boolean
  video_url: string | null
  area_id: string | null
  area_name?: string | null
  team_id: string | null
  team_name?: string | null
  person_in_charge_id: string | null
  person_in_charge_name?: string | null
  created_at: string
  updated_at: string
}

interface ProcessDetail {
  id: string
  name: string
  description: string | null
  type: string
  status: boolean
  video_url: string | null
  document_by_ai: string | null
  document_by_user: any | null
  markmap_by_ai: string | null
  markmap_by_user: string | null
  json_by_ai: any
  area_id: string | null
  area_name?: string | null
  team_id: string | null
  team_name?: string | null
  person_in_charge_id: string | null
  person_in_charge_name?: string | null
  company_id: string
  created_at: string
  updated_at: string
}

interface ProcessContextType {
  // Estados
  processes: Process[]
  currentProcess: ProcessDetail | null
  loading: boolean
  loadingDetail: boolean
  
  // Funções
  fetchProcesses: () => Promise<void>
  fetchProcessDetail: (sequentialId: string) => Promise<void>
  createProcess: (processData: {
    name: string
    description: string | null
    type: string
    area_id: string | null
    team_id: string | null
    person_in_charge_id: string | null
    notes?: string | null // HTML do TipTap editor
    status?: boolean
    created_by?: string
  }, tempImages?: TempImage[], documents?: DocumentItem[], videoData?: VideoData | null, markdownContent?: string) => Promise<boolean>
  refreshProcesses: () => void
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined)

export const useProcess = () => {
  const context = useContext(ProcessContext)
  if (context === undefined) {
    throw new Error('useProcess must be used within a ProcessProvider')
  }
  return context
}

interface ProcessProviderProps {
  children: ReactNode
}

export const ProcessProvider = ({ children }: ProcessProviderProps) => {
  const [processes, setProcesses] = useState<Process[]>([])
  const [currentProcess, setCurrentProcess] = useState<ProcessDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(true)
  
  const { companyInfo, loading: companyLoading } = useCompany()
  const { user } = useAuth()

  const fetchProcesses = useCallback(async () => {
    if (!companyInfo?.id) return

    setLoading(true)
    try {
      // Buscar processos da empresa
      const { data: processesData, error: processesError } = await supabase
        .from('processes')
        .select(`
          id,
          name,
          description,
          type,
          status,
          video_url,
          area_id,
          team_id,
          person_in_charge,
          created_at,
          updated_at
        `)
        .eq('company_id', companyInfo.id)
        .eq('status', true)
        .order('created_at', { ascending: false })

      if (processesError) {
        console.error('Error fetching processes:', processesError)
        return
      }

      // Para cada processo, buscar informações da área, time e responsável
      const processesWithDetails = await Promise.all(
        (processesData || []).map(async (process, index) => {
          let areaName = null
          let teamName = null
          let personInChargeName = null

          // Buscar nome da área se existir
          if (process.area_id) {
            try {
              const { data: areaData } = await supabase
                .from('areas')
                .select('name')
                .eq('id', process.area_id)
                .eq('is_active', true)
                .single()

              if (areaData) {
                areaName = areaData.name
              }
            } catch (error) {
              console.error('Error fetching area info:', error)
            }
          }

          // Buscar nome do time se existir
          if (process.team_id) {
            try {
              const { data: teamData } = await supabase
                .from('teams')
                .select('name')
                .eq('id', process.team_id)
                .eq('is_active', true)
                .single()

              if (teamData) {
                teamName = teamData.name
              }
            } catch (error) {
              console.error('Error fetching team info:', error)
            }
          }

          // Buscar informações do responsável se existir
          if (process.person_in_charge) {
            try {
              const { data: personData } = await supabase.rpc('get_user_basic_info', {
                p_user_id: process.person_in_charge
              })

              if (personData && personData.length > 0) {
                personInChargeName = personData[0].user_name
              }
            } catch (error) {
              console.error('Error fetching person in charge info:', error)
            }
          }

          return {
            id: process.id, // ID real do Supabase (não exposto na URL)
            sequential_id: index + 1, // ID sequencial para usar na URL
            name: process.name,
            description: process.description,
            type: process.type,
            status: process.status,
            video_url: process.video_url,
            area_id: process.area_id,
            area_name: areaName,
            team_id: process.team_id,
            team_name: teamName,
            person_in_charge_id: process.person_in_charge,
            person_in_charge_name: personInChargeName,
            created_at: process.created_at,
            updated_at: process.updated_at
          }
        })
      )

      setProcesses(processesWithDetails)
      
    } catch (error) {
      console.error('Error fetching processes:', error)
      setProcesses([])
    } finally {
      setLoading(false)
    }
  }, [companyInfo?.id])

  const fetchProcessDetail = useCallback(async (sequentialId: string) => {
    if (!companyInfo?.id) return

    setLoadingDetail(true)
    
    try {
      const sequentialIdNum = parseInt(sequentialId)
      if (isNaN(sequentialIdNum) || sequentialIdNum < 1) {
        console.error('ID do processo inválido')
        setCurrentProcess(null)
        return
      }

      // Buscar todos os processos da empresa ordenados por created_at para mapear o ID sequencial
      const { data: processesData, error: processesError } = await supabase
        .from('processes')
        .select(`
          id,
          name,
          description,
          type,
          status,
          video_url,
          document_by_ai,
          document_by_user,
          markmap_by_ai,
          markmap_by_user,
          json_by_ai,
          area_id,
          team_id,
          person_in_charge,
          company_id,
          created_at,
          updated_at
        `)
        .eq('company_id', companyInfo.id)
        .eq('status', true)
        .order('created_at', { ascending: false })

      if (processesError) {
        console.error('Error fetching processes:', processesError)
        setCurrentProcess(null)
        return
      }

      if (!processesData || processesData.length === 0) {
        console.error('Nenhum processo encontrado')
        setCurrentProcess(null)
        return
      }

      // Encontrar o processo pelo ID sequencial (índice + 1)
      const targetProcessIndex = sequentialIdNum - 1
      if (targetProcessIndex < 0 || targetProcessIndex >= processesData.length) {
        console.error('Processo não encontrado')
        setCurrentProcess(null)
        return
      }

      const processData = processesData[targetProcessIndex]

      // Buscar informações da área, time e responsável
      let areaName = null
      let teamName = null
      let personInChargeName = null

      if (processData.area_id) {
        try {
          const { data: areaData } = await supabase
            .from('areas')
            .select('name')
            .eq('id', processData.area_id)
            .eq('is_active', true)
            .single()

          if (areaData) {
            areaName = areaData.name
          }
        } catch (error) {
          console.error('Error fetching area info:', error)
        }
      }

      if (processData.team_id) {
        try {
          const { data: teamData } = await supabase
            .from('teams')
            .select('name')
            .eq('id', processData.team_id)
            .eq('is_active', true)
            .single()

          if (teamData) {
            teamName = teamData.name
          }
        } catch (error) {
          console.error('Error fetching team info:', error)
        }
      }

      if (processData.person_in_charge) {
        try {
          const { data: personData } = await supabase.rpc('get_user_basic_info', {
            p_user_id: processData.person_in_charge
          })
          
          if (personData && personData.length > 0) {
            personInChargeName = personData[0].user_name
          }
        } catch (error) {
          console.error('Error fetching person in charge info:', error)
        }
      }

      setCurrentProcess({
        ...processData,
        area_name: areaName,
        team_name: teamName,
        person_in_charge_id: processData.person_in_charge,
        person_in_charge_name: personInChargeName
      })

    } catch (error) {
      console.error('Error fetching process details:', error)
      setCurrentProcess(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [companyInfo?.id])

  const createProcess = useCallback(async (processData: {
    name: string
    description: string | null
    type: string
    area_id: string | null
    team_id: string | null
    person_in_charge_id: string | null
    notes?: string | null // HTML do TipTap editor
    status?: boolean
    created_by?: string
  }, tempImages?: TempImage[], documents?: DocumentItem[], videoData?: VideoData | null, markdownContent?: string) => {
    if (!companyInfo?.id || !user?.id) return false

    try {
      
      // Primeiro, criar o processo
      const { data: newProcess, error } = await supabase
        .from('processes')
        .insert({
          name: processData.name.trim(),
          description: processData.description?.trim() || null,
          type: processData.type,
          area_id: processData.area_id,
          team_id: processData.team_id,
          person_in_charge: processData.person_in_charge_id,
          document_by_user: processData.notes ? { html: processData.notes } : null,
          markmap_by_user: markdownContent || null,
          company_id: companyInfo.id,
          status: processData.status ?? true,
          created_by: processData.created_by || user.id,
          updated_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating process:', error)
        return false
      }

      // Se existem imagens temporárias, fazer upload e criar documentos
      if (tempImages && tempImages.length > 0) {
        let updatedHtml = processData.notes || ''
        
        for (const tempImage of tempImages) {
          try {
            // Gerar nome único para o arquivo
            const fileExt = tempImage.file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `process-images/${fileName}`

            // Upload para Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('process-files')
              .upload(filePath, tempImage.file)

            if (uploadError) {
              console.error('Error uploading image:', uploadError)
              continue // Continuar com as outras imagens
            }

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
              .from('process-files')
              .getPublicUrl(filePath)

            // Calcular hash do arquivo
            const arrayBuffer = await tempImage.file.arrayBuffer()
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

            // Criar documento na tabela documents
            const { error: documentError } = await supabase
              .from('documents')
              .insert({
                process_id: newProcess.id,
                file_name: tempImage.file.name,
                file_type: tempImage.file.type,
                file_url: publicUrl,
                file_size: tempImage.file.size,
                file_hash: fileHash,
                created_by: user.id
              })

            if (documentError) {
              console.error('Error creating document record:', documentError)
              // Tentar deletar o arquivo do storage
              await supabase.storage.from('process-files').remove([filePath])
              continue
            }

            // Substituir a URL temporária pela URL definitiva no HTML
            updatedHtml = updatedHtml.replace(tempImage.dataUrl, publicUrl)
            
          } catch (imageError) {
            console.error('Error processing temp image:', imageError)
            // Continuar com as outras imagens
          }
        }

        // Atualizar o processo com o HTML corrigido (URLs definitivas)
        if (updatedHtml !== processData.notes) {
          await supabase
            .from('processes')
            .update({
              document_by_user: { html: updatedHtml },
              updated_by: user.id
            })
            .eq('id', newProcess.id)
        }
      }

      // Processar documentos adicionais (não imagens do TipTap)
      if (documents && documents.length > 0) {
        for (const document of documents) {
          try {
            // Gerar nome único para o arquivo
            const fileExtension = document.file.name.split('.').pop() || 'file'
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
            const filePath = `${newProcess.id}/${uniqueFileName}`

            // Upload do arquivo para o Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('process-files')
              .upload(filePath, document.file)

            if (uploadError) {
              console.error('Error uploading document:', uploadError)
              continue
            }

            // Obter URL pública do arquivo
            const { data: { publicUrl } } = supabase.storage
              .from('process-files')
              .getPublicUrl(filePath)

            // Calcular hash do arquivo
            const arrayBuffer = await document.file.arrayBuffer()
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

            // Criar registro na tabela documents
            const { error: documentError } = await supabase
              .from('documents')
              .insert({
                process_id: newProcess.id,
                file_name: document.file.name,
                file_type: document.file.type,
                file_url: publicUrl,
                file_size: document.file.size,
                file_hash: fileHash,
                created_by: user.id
              })

            if (documentError) {
              console.error('Error creating document record:', documentError)
              // Tentar deletar o arquivo do storage
              await supabase.storage.from('process-files').remove([filePath])
            }

          } catch (documentError) {
            console.error('Error processing document:', documentError)
            // Continuar com os outros documentos
          }
        }
      }

      // Processar vídeo e dados da IA (se existirem)
      console.log('🔍 VERIFICANDO VIDEO DATA:', !!videoData)
      if (videoData) {
        console.log('🎬 PROCESSANDO VIDEO DATA:', JSON.stringify(videoData, null, 2))
        console.log('🤖 TEM AI PROCESSED DATA?', !!videoData.aiProcessedData)
        
        try {
          // Gerar nome único para o arquivo de vídeo
          const fileExtension = videoData.file.name.split('.').pop() || 'mp4'
          const uniqueVideoName = `video-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
          const videoPath = `${newProcess.id}/${uniqueVideoName}`

          // Upload do vídeo para o Supabase Storage
          const { error: videoUploadError } = await supabase.storage
            .from('process-files')
            .upload(videoPath, videoData.file)

          if (videoUploadError) {
            console.error('Error uploading video:', videoUploadError)
          } else {
            // Obter URL pública do vídeo
            const { data: { publicUrl } } = supabase.storage
              .from('process-files')
              .getPublicUrl(videoPath)

            // Atualizar o processo com a URL do vídeo e dados da IA
            const updateData: any = {
              video_url: publicUrl
            }

            // Se existem dados processados pela IA, adicionar ao processo
            if (videoData.aiProcessedData) {
              const aiData = videoData.aiProcessedData
              console.log('🤖 DADOS DA IA PARA SALVAR:', JSON.stringify(aiData, null, 2))
              
              // Verificar se temos o campo 'analysis' ou se os dados estão diretamente em aiData
              const analysisData = aiData.analysis || aiData
              console.log('🔍 ANALYSIS DATA:', JSON.stringify(analysisData, null, 2))
              
              // Salvar o JSON completo da análise
              updateData.json_by_ai = analysisData
              console.log('💾 JSON_BY_AI (FINAL):', JSON.stringify(analysisData, null, 2))
              
              // Adicionar outros campos da IA se disponíveis
              if (analysisData.processo_passos_markdown) {
                updateData.document_by_ai = analysisData.processo_passos_markdown
                console.log('📄 DOCUMENT_BY_AI:', analysisData.processo_passos_markdown)
              }
              
              if (analysisData.markdown_markmap) {
                updateData.markmap_by_ai = analysisData.markdown_markmap
                console.log('🗺️ MARKMAP_BY_AI:', analysisData.markdown_markmap)
              }
            } else {
              console.log('❌ NÃO TEM AI PROCESSED DATA - não vai salvar JSON')
            }

            // Atualizar o processo no banco
            console.log('💾 DADOS PARA UPDATE NO BANCO:', JSON.stringify(updateData, null, 2))
            console.log('🆔 PROCESS ID:', newProcess.id)
            
            const { data: updateResult, error: updateError } = await supabase
              .from('processes')
              .update(updateData)
              .eq('id', newProcess.id)
              .select()

            if (updateError) {
              console.error('❌ ERRO AO ATUALIZAR PROCESSO:', updateError)
            } else {
              console.log('✅ PROCESSO ATUALIZADO COM SUCESSO!')
              console.log('📊 RESULTADO DO UPDATE:', JSON.stringify(updateResult, null, 2))
            }
          }
        } catch (videoError) {
          console.error('Error processing video:', videoError)
        }
      }

      // Recarregar processos após criar
      await fetchProcesses()
      return true
      
    } catch (error) {
      console.error('Error creating process:', error)
      return false
    }
  }, [companyInfo?.id, user?.id, fetchProcesses])

  const refreshProcesses = useCallback(() => {
    fetchProcesses()
  }, [fetchProcesses])

  // Carregar processos quando o componente montar ou a empresa mudar
  useEffect(() => {
    if (companyInfo?.id) {
      fetchProcesses()
    }
  }, [companyInfo?.id, fetchProcesses])

  // Se a empresa ainda está carregando, fornecer valores padrão
  const value: ProcessContextType = companyLoading ? {
    processes: [],
    currentProcess: null,
    loading: true,
    loadingDetail: true,
    fetchProcesses: async () => {},
    fetchProcessDetail: async () => {},
    createProcess: async () => false,
    refreshProcesses: () => {}
  } : {
    // Estados
    processes,
    currentProcess,
    loading,
    loadingDetail,
    
    // Funções
    fetchProcesses,
    fetchProcessDetail,
    createProcess,
    refreshProcesses
  }

  return (
    <ProcessContext.Provider value={value}>
      {children}
    </ProcessContext.Provider>
  )
}
