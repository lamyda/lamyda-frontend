import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Map, Sparkles, FileText, Video, Plus } from "lucide-react"
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import { Toolbar } from 'markmap-toolbar'

interface VideoData {
  file: File
  url: string
  aiProcessedData?: any
}

interface MindMapComponentProps {
  processId?: string
  videoData?: VideoData | null
  processText?: string
  markdownContent?: string
  onMarkdownChange?: (markdown: string) => void
}

export default function MindMapComponent({ 
  videoData, 
  processText, 
  markdownContent: initialMarkdownContent,
  onMarkdownChange 
}: MindMapComponentProps) {
  const [markdownContent, setMarkdownContent] = useState(initialMarkdownContent || '')
  const [generating, setGenerating] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [selectedSource, setSelectedSource] = useState<'text' | 'video' | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const markmapRef = useRef<Markmap | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Função para renderizar o markmap
  const renderMarkmap = () => {
    if (!svgRef.current || !markdownContent) return

    try {
      const transformer = new Transformer()
      const { root } = transformer.transform(markdownContent)
      
      // Sempre recriar o markmap para garantir renderização correta
      if (markmapRef.current) {
        markmapRef.current.destroy?.()
      }
      
      // Configurar SVG antes de criar o markmap
      const svg = svgRef.current
      const containerWidth = svg.parentElement?.clientWidth || 800
      const containerHeight = svg.parentElement?.clientHeight || 600
      
      svg.setAttribute('width', containerWidth.toString())
      svg.setAttribute('height', containerHeight.toString())
      svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      svg.style.width = '100%'
      svg.style.height = '100%'
      svg.style.display = 'block'
      
      // Criar markmap com opções de configuração
      markmapRef.current = Markmap.create(svg, {
        autoFit: true,
        duration: 500,
        maxWidth: 300,
        spacingVertical: 5,
        spacingHorizontal: 80,
        fitRatio: 0.95
      })
      
      markmapRef.current.setData(root)
      
      // Criar toolbar se ainda não existir
      if (toolbarRef.current && markmapRef.current) {
        // Limpar toolbar anterior
        toolbarRef.current.innerHTML = ''
        
        // Criar nova toolbar
        const { el } = Toolbar.create(markmapRef.current)
        el.style.position = 'absolute'
        el.style.bottom = '1rem'
        el.style.right = '1rem'
        el.style.zIndex = '10'
        el.style.pointerEvents = 'auto'
        
        // Remover logo da toolbar
        setTimeout(() => {
          const brandElements = el.querySelectorAll('.mm-toolbar-brand, [class*="brand"], [class*="logo"]')
          brandElements.forEach(brand => brand.remove())
        }, 50)
        
        toolbarRef.current.appendChild(el)
      }
      
      // Garantir que o mapa se ajuste ao container
      setTimeout(() => {
        if (markmapRef.current) {
          markmapRef.current.fit()
        }
      }, 100)
      
    } catch (error) {
      console.error('Error rendering markmap:', error)
      // Limpar referências em caso de erro
      if (markmapRef.current) {
        markmapRef.current.destroy?.()
        markmapRef.current = null
      }
      if (toolbarRef.current) {
        toolbarRef.current.innerHTML = ''
      }
    }
  }

  // Sincronizar com o conteúdo inicial do componente pai
  useEffect(() => {
    if (initialMarkdownContent !== undefined) {
      setMarkdownContent(initialMarkdownContent)
    }
  }, [initialMarkdownContent])

  // Renderizar markmap quando o conteúdo mudar
  useEffect(() => {
    if (markdownContent) {
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        renderMarkmap()
      }, 100)
    }
  }, [markdownContent])

  const generateMindMap = async () => {
    setShowGenerateDialog(true)
  }

  const generateFromText = async () => {
    // Validar se há texto do processo
    if (!processText || processText.trim() === '') {
      alert('Nenhum texto do processo foi encontrado. Por favor, vá até a aba "Informações Básicas" e adicione uma descrição do processo primeiro.')
      setShowGenerateDialog(false)
      return
    }

    setShowGenerateDialog(false)
    setGenerating(true)
    
    // Simular geração com base no texto do processo
    setTimeout(() => {
      updateMarkdownContent(`# Mapa Mental do Processo
## (Gerado baseado no texto)

## Informações Principais
- Baseado na descrição fornecida
- Análise do conteúdo textual
- Estrutura identificada automaticamente

## Etapas do Processo
- Etapa inicial identificada
- Processos intermediários
- Conclusão e resultados

## Observações
- Gerado a partir do texto: "${processText.substring(0, 100)}${processText.length > 100 ? '...' : ''}"
- Processamento realizado pela Lamyda AI`)
      setGenerating(false)
    }, 2000)
  }

  const handleGenerateSelection = () => {
    if (!selectedSource) {
      alert('Por favor, selecione uma fonte para gerar o mapa mental.')
      return
    }

    if (selectedSource === 'text') {
      generateFromText()
    } else if (selectedSource === 'video') {
      generateFromVideo()
    }
  }

  // Função para atualizar o markdown e notificar o componente pai
  const updateMarkdownContent = (newContent: string) => {
    setMarkdownContent(newContent)
    onMarkdownChange?.(newContent)
  }

  // Função para processar o texto e converter \n em quebras de linha reais
  const processMarkdownText = (text: string): string => {
    if (!text) return ''
    
    // Substituir \n por quebras de linha reais
    return text.replace(/\\n/g, '\n')
  }

  const generateFromVideo = async () => {
    // Validar se o vídeo foi importado
    if (!videoData) {
      alert('Nenhum vídeo foi importado ainda. Por favor, vá até a aba "Vídeo" e importe um vídeo primeiro.')
      setShowGenerateDialog(false)
      return
    }

    // Validar se o vídeo foi processado com IA
    if (!videoData.aiProcessedData) {
      alert('O vídeo ainda não foi processado com IA. Por favor, vá até a aba "Vídeo" e clique em "Gerar com Lamyda AI" primeiro.')
      setShowGenerateDialog(false)
      return
    }

    setShowGenerateDialog(false)
    setGenerating(true)
    
    try {
      // Usar o markdown do JSON processado pela IA
      const aiData = videoData.aiProcessedData
      console.log('=== DEBUG: AI Data from video ===')
      console.log('Full aiData:', aiData)
      console.log('aiData type:', typeof aiData)
      console.log('aiData keys:', aiData ? Object.keys(aiData) : 'null/undefined')
      
      // Verificar todas as possíveis chaves de markdown
      console.log('markmap_markdown:', aiData?.markmap_markdown)
      console.log('document_markdown:', aiData?.document_markdown)
      console.log('markmap_by_ai:', aiData?.markmap_by_ai)
      console.log('document_by_ai:', aiData?.document_by_ai)
      
      // Verificar dentro de processed_data
      console.log('processed_data.markmap_by_ai:', aiData?.processed_data?.markmap_by_ai)
      console.log('processed_data.document_by_ai:', aiData?.processed_data?.document_by_ai)
      console.log('processed_data.markdown_markmap:', aiData?.processed_data?.markdown_markmap)
      
      // Tentar diferentes chaves possíveis (incluindo dentro de processed_data)
      let markdownFromAI = aiData?.markmap_markdown || 
                          aiData?.document_markdown || 
                          aiData?.markmap_by_ai || 
                          aiData?.document_by_ai ||
                          aiData?.processed_data?.markmap_by_ai ||
                          aiData?.processed_data?.document_by_ai ||
                          aiData?.processed_data?.markdown_markmap || ''
      
      console.log('Selected markdown:', markdownFromAI)
      
      if (markdownFromAI && markdownFromAI.trim() !== '') {
        // Processar o texto para converter \n em quebras de linha reais
        const processedMarkdown = processMarkdownText(markdownFromAI)
        console.log('Processed markdown:', processedMarkdown)
        
        updateMarkdownContent(processedMarkdown)
      } else {
        // Fallback se não houver markdown no JSON
        console.log('No valid markdown found in AI data, using fallback')
        console.log('Checked fields: markmap_markdown, document_markdown, markmap_by_ai, document_by_ai')
        updateMarkdownContent(`# Processo Gerado pelo Vídeo
## (Baseado na análise de IA)

## Etapas Principais
- Etapa identificada no vídeo
- Processo analisado pela IA
- Fluxo de trabalho detectado

## Observações
- Análise baseada no conteúdo do vídeo
- Processamento realizado pela Lamyda AI`)
      }
      
      setGenerating(false)
    } catch (error) {
      console.error('Error generating mindmap from video:', error)
      alert('Erro ao gerar mapa mental do vídeo. Tente novamente.')
      setGenerating(false)
    }
  }

  // Adicionar resize observer para reajustar o mapa quando o container mudar
  useEffect(() => {
    const handleResize = () => {
      if (markmapRef.current) {
        setTimeout(() => {
          markmapRef.current?.fit()
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Limpar markmap quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (markmapRef.current) {
        markmapRef.current.destroy?.()
      }
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div className="text-left">
          <h2 className="text-2xl font-medium tracking-tight mb-2">Mapa Mental do Processo</h2>
          <p className="text-sm text-gray-500 mb-4">Visualize e organize as etapas do processo em um mapa mental</p>
        </div>
        
        <div>
          <Button
            type="button"
            onClick={generateMindMap}
            disabled={generating}
            className="ai-button"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Gerando...' : 'Gerar com Lamyda AI'}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {!markdownContent && !generating ? (
          /* Empty State */
          <div className="text-center py-12 px-8 border-t border-gray-200">
            <Map className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum mapa mental criado ainda</p>
            <p className="text-sm text-gray-400 mt-1 mb-8">
              Escolha uma das opções abaixo para começar
            </p>
            
            <div className="flex flex-col space-y-4 max-w-md mx-auto">
              <Button
                type="button"
                  onClick={() => {
                    updateMarkdownContent('# Título do Processo\n\n## Seção 1\n- Item 1\n- Item 2\n\n## Seção 2\n- Item A\n- Item B')
                  }}
                variant="outline"
                className="shadow-none rounded-sm font-medium w-full justify-start h-auto p-4"
              >
                <Plus className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Escrever do Zero</div>
                  <div className="text-sm text-gray-500">Crie seu próprio mapa mental</div>
                </div>
              </Button>
              
              <Button
                type="button"
                onClick={generateMindMap}
                className="ai-button w-full justify-start h-auto"
                style={{ padding: '1rem' }}
              >
                <Sparkles className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Gerar com Lamyda AI</div>
                  <div className="text-sm opacity-80">Use inteligência artificial</div>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          /* Split View: Editor + Preview (sempre visível) */
          <div className="flex-1 bg-white border-t border-gray-200 overflow-hidden">
            <div className="flex h-full">
              {/* Editor - 30% */}
              <div className="w-[30%] border-r border-gray-200 flex flex-col">
                <Textarea
                  value={markdownContent}
                  onChange={(e) => updateMarkdownContent(e.target.value)}
                  placeholder="Digite o markdown do mapa mental aqui..."
                  className="flex-1 w-full border-0 resize-none focus:ring-0 focus-visible:ring-0 font-mono text-sm p-4"
                  style={{ minHeight: '400px' }}
                />
              </div>
              
              {/* Preview - 70% */}
              <div className="flex-1 markmap-container relative">
                <svg
                  ref={svgRef}
                  className="w-full h-full"
                  style={{ 
                    minHeight: '400px',
                    display: 'block'
                  }}
                />
                {/* Toolbar Container */}
                <div ref={toolbarRef} className="absolute inset-0 pointer-events-none">
                  {/* Toolbar será inserida aqui */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Gerar Mapa Mental
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600 mb-6">
              Qual fonte você deseja usar para gerar o mapa mental?
            </p>
            
            <div className="space-y-3">
              {/* Texto do Processo */}
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedSource('text')}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="radio"
                      name="source"
                      value="text"
                      checked={selectedSource === 'text'}
                      className="w-4 h-4 text-lamyda-primary border-gray-300 focus:ring-lamyda-primary"
                      onChange={() => setSelectedSource('text')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900">Texto do Processo</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Gerar mapa mental baseado nas informações escritas do processo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vídeo do Processo */}
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedSource('video')}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="radio"
                      name="source"
                      value="video"
                      checked={selectedSource === 'video'}
                      className="w-4 h-4 text-lamyda-primary border-gray-300 focus:ring-lamyda-primary"
                      onChange={() => setSelectedSource('video')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Video className="w-5 h-5 text-purple-600" />
                      <h3 className="font-medium text-gray-900">Vídeo do Processo</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Gerar mapa mental baseado na análise do vídeo enviado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Neste momento, todo o processo de geração é gratuito! 
              Nossa equipe entrará em contato para entender suas 
              necessidades e garantir que tudo seja feito da melhor forma 
              e no menor tempo possível.
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleGenerateSelection}
              className="bg-lamyda-primary hover:brightness-110 text-white px-6"
            >
              Gerar Mapa Mental
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
