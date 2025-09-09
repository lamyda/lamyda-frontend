import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { user, userInfo } = useAuth()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bem-vindo ao Dashboard!
        </h2>
        <p className="text-gray-600 mb-6">
          Você está logado e pode acessar conteúdo privado.
        </p>

        {/* Informações do usuário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Informações da Conta
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-600">{user?.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-600 font-mono text-xs">{user?.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Confirmado:</span>
                <span className="ml-2 text-gray-600">
                  {user?.email_confirmed_at ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Perfil do Usuário
            </h3>
            {userInfo ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <span className="ml-2 text-gray-600">{userInfo.user_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Owner:</span>
                  <span className="ml-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      userInfo.is_owner 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userInfo.is_owner ? 'Sim' : 'Não'}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Empresa Criada:</span>
                  <span className="ml-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      userInfo.is_company_created 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userInfo.is_company_created ? 'Sim' : 'Não'}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cadastro:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(userInfo.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Carregando informações do perfil...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de exemplo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Funcionalidade 1</h3>
              <p className="text-sm text-gray-500">Descrição da funcionalidade</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Funcionalidade 2</h3>
              <p className="text-sm text-gray-500">Descrição da funcionalidade</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Funcionalidade 3</h3>
              <p className="text-sm text-gray-500">Descrição da funcionalidade</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
