import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Users, FileText, Settings } from "lucide-react"
import { useArea } from "@/contexts/AreaContext"

export default function AreaDetail() {
  const { id } = useParams<{ id: string }>()
  const { currentArea: area, loadingDetail: loading, fetchAreaDetail } = useArea()

  useEffect(() => {
    if (id) {
      fetchAreaDetail(id)
    }
  }, [id, fetchAreaDetail])


  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-sm border p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!loading && !area) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-medium">Área não encontrada</h1>
        </div>
        
        <div className="bg-white rounded-sm border p-8 text-center">
          <div className="text-gray-500 mb-4">
            A área solicitada não foi encontrada ou você não tem permissão para visualizá-la.
          </div>
        </div>
      </div>
    )
  }

  if (!area) return null

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">

      {/* Informações principais da área */}
      <div className="bg-white rounded-sm border p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{area.name}</h1>
            <p className="text-gray-600 text-base leading-relaxed">
              {area.description || 'Sem descrição disponível'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Editar área
          </Button>
        </div>

        {/* Estatísticas da área */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {Math.floor(Math.random() * 15) + 1}
                </div>
                <div className="text-sm text-gray-600">Times ativos</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-sm flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {Math.floor(Math.random() * 50) + 1}
                </div>
                <div className="text-sm text-gray-600">Documentos</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-sm flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {area.manager_name || 'Não definido'}
                </div>
                <div className="text-sm text-gray-600">Gerente</div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Criada em</h3>
              <p className="text-gray-900">
                {new Date(area.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Última atualização</h3>
              <p className="text-gray-900">
                {new Date(area.updated_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seções futuras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Times da Área</h2>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Nenhum time encontrado</p>
            <p className="text-sm">Os times desta área aparecerão aqui</p>
          </div>
        </div>

        <div className="bg-white rounded-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos Recentes</h2>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Nenhum documento encontrado</p>
            <p className="text-sm">Os documentos desta área aparecerão aqui</p>
          </div>
        </div>
      </div>
    </div>
  )
}
