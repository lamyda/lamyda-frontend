import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Share2, MoreHorizontal, FileText, Video, Map, Users } from "lucide-react"
import { useProcess } from "@/contexts/ProcessContext"
import { useBreadcrumb } from "@/layouts/PrivateLayout"

export default function ProcessDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProcess, fetchProcessDetail, loadingDetail } = useProcess()
  const { setBreadcrumb, resetBreadcrumb } = useBreadcrumb()
  
  const [activeTab, setActiveTab] = useState('overview')

  // Carregar detalhes do processo
  useEffect(() => {
    if (id) {
      fetchProcessDetail(id)
    }
  }, [id, fetchProcessDetail])

  // Atualizar breadcrumb
  useEffect(() => {
    if (currentProcess?.name) {
      setBreadcrumb(currentProcess.name)
    }
    return () => resetBreadcrumb()
  }, [currentProcess?.name, setBreadcrumb, resetBreadcrumb])

  if (loadingDetail) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando processo...</p>
        </div>
      </div>
    )
  }

  if (!currentProcess) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processo não encontrado</h3>
          <p className="text-gray-500 mb-4">O processo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/processes')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Processos
          </Button>
        </div>
      </div>
    )
  }

  const getProcessTypeLabel = (type: string) => {
    switch (type) {
      case 'policy':
        return 'Política'
      case 'guideline':
        return 'Diretriz'
      case 'process':
      default:
        return 'Processo'
    }
  }

  const getProcessTypeBadge = (type: string) => {
    switch (type) {
      case 'policy':
        return 'bg-green-100 text-green-800'
      case 'guideline':
        return 'bg-blue-100 text-blue-800'
      case 'process':
      default:
        return 'bg-purple-100 text-purple-800'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: FileText },
    { id: 'video', label: 'Vídeo', icon: Video },
    { id: 'mindmap', label: 'Mapa Mental', icon: Map },
    { id: 'team', label: 'Equipe', icon: Users },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Descrição */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">
                {currentProcess.description || 'Nenhuma descrição disponível.'}
              </p>
            </div>

            {/* Conteúdo do Editor */}
            {currentProcess.document_by_user && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalhes</h3>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: typeof currentProcess.document_by_user === 'object' 
                      ? currentProcess.document_by_user.html 
                      : currentProcess.document_by_user 
                  }}
                />
              </div>
            )}

            {/* Conteúdo gerado pela IA */}
            {currentProcess.document_by_ai && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conteúdo gerado pela IA</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {currentProcess.document_by_ai}
                  </pre>
                </div>
              </div>
            )}

            {/* JSON de IA (se disponível) */}
            {currentProcess.json_by_ai && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise de IA</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(currentProcess.json_by_ai, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )
      case 'video':
        return (
          <div className="space-y-6">
            {currentProcess.video_url ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vídeo do Processo</h3>
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    src={currentProcess.video_url}
                    controls
                    className="w-full h-auto"
                    style={{ maxHeight: '500px' }}
                  >
                    Seu navegador não suporta a reprodução de vídeo.
                  </video>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum vídeo disponível para este processo.</p>
              </div>
            )}
          </div>
        )
      case 'mindmap':
        return (
          <div className="space-y-6">
            {currentProcess.markmap_by_user || currentProcess.markmap_by_ai ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mapa Mental</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {currentProcess.markmap_by_user || currentProcess.markmap_by_ai}
                  </pre>
                </div>
                
                {/* Mostrar origem do conteúdo */}
                <div className="text-xs text-gray-500 mt-2">
                  {currentProcess.markmap_by_user ? 'Editado pelo usuário' : 'Gerado pela IA'}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum mapa mental disponível para este processo.</p>
              </div>
            )}
          </div>
        )
      case 'team':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações da Equipe</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Área */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Área</h4>
                <p className="text-gray-700">
                  {currentProcess.area_name || 'Não definido'}
                </p>
              </div>

              {/* Time */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Time</h4>
                <p className="text-gray-700">
                  {currentProcess.team_name || 'Não definido'}
                </p>
              </div>

              {/* Responsável */}
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-2">Responsável</h4>
                <p className="text-gray-700">
                  {currentProcess.person_in_charge_name || 'Não definido'}
                </p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{currentProcess.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProcessTypeBadge(currentProcess.type)}`}>
                  {getProcessTypeLabel(currentProcess.type)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Criado em {new Date(currentProcess.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
