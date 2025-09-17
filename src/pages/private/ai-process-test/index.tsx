import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabase';

interface ProcessAnalysis {
  empresa?: string;
  descricao_para_busca?: string;
  stacks_ferramentas?: Array<{
    nome: string;
    descricao: string;
  }>;
  processo_passos?: Array<{
    passo: number;
    descricao: string;
    timestamp: string;
    duracao: string;
  }>;
  processo_passos_markdown?: string;
  exemplo_pratico_markdown?: string;
  markdown_markmap?: string;
  conteudo_bruto?: string;
  erro_parsing?: string;
}

interface AIProcessResponse {
  success: boolean;
  message: string;
  data?: {
    process_id: string;
    process_name: string;
    company_name: string;
    area_name: string;
    analysis: ProcessAnalysis;
    gemini_response?: any;
  };
  error?: string;
  details?: string;
}

export default function AIProcessTest() {
  const [processId, setProcessId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AIProcessResponse | null>(null);

  const handleProcessVideo = async () => {
    if (!processId.trim()) {
      alert('Por favor, informe o ID do processo.');
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      // Chamar a edge function video-ai-processes
      const response = await supabase.functions.invoke('video-ai-processes', {
        body: {
          process_id: processId.trim()
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data);

    } catch (error) {
      console.error('Erro no processamento:', error);
      setResult({
        success: false,
        message: 'Erro no processamento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setProcessing(false);
    }
  };

  const renderDescricaoParaBusca = (descricao: ProcessAnalysis['descricao_para_busca']) => {
    if (!descricao) return null;

    return (
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">🔍 Descrição para Busca:</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
          <div className="mb-3 flex justify-between items-center">
            <span className="text-sm text-green-600">Descrição otimizada para indexação e busca</span>
            <button
              onClick={() => navigator.clipboard.writeText(descricao)}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              📋 Copiar
            </button>
          </div>
          <p className="text-sm text-green-800 leading-relaxed">{descricao}</p>
        </div>
      </div>
    );
  };

  const renderStacksFerramentas = (stacks: ProcessAnalysis['stacks_ferramentas']) => {
    if (!stacks || stacks.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">🛠️ Stacks e Ferramentas Utilizadas:</h4>
        <div className="grid gap-3">
          {stacks.map((stack, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-blue-50">
              <h5 className="font-medium text-blue-800 mb-1">{stack.nome}</h5>
              <p className="text-sm text-blue-700">{stack.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProcessoPassosJson = (passos: ProcessAnalysis['processo_passos']) => {
    if (!passos || passos.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">⏱️ Passos do Processo (com Timestamps):</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
          <div className="mb-3 flex justify-between items-center">
            <span className="text-sm text-purple-600">Estrutura JSON com timestamps do vídeo</span>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(passos, null, 2))}
              className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
            >
              📋 Copiar JSON
            </button>
          </div>
          <div className="space-y-3">
            {passos.map((passo, index) => (
              <div key={index} className="bg-white rounded border p-3 flex items-start space-x-3">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {passo.passo}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 mb-1">{passo.descricao}</p>
                  <div className="flex space-x-4 text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      ⏰ {passo.timestamp}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      ⏱️ {passo.duracao}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProcessStepsMarkdown = (markdown: ProcessAnalysis['processo_passos_markdown']) => {
    if (!markdown) return null;

    return (
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">📋 Processo Passo a Passo:</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="mb-3 flex justify-between items-center">
            <span className="text-sm text-gray-600">Salvo em: <code className="bg-gray-200 px-1 rounded text-xs">document_markdown</code></span>
            <button
              onClick={() => navigator.clipboard.writeText(markdown)}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              📋 Copiar
            </button>
          </div>
          <div className="bg-white rounded border p-4 max-h-80 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {markdown}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  const renderExemploPraticoMarkdown = (markdown: ProcessAnalysis['exemplo_pratico_markdown']) => {
    if (!markdown) return null;

    return (
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">💡 Exemplo Prático:</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
          <div className="mb-3 flex justify-between items-center">
            <span className="text-sm text-green-600">Salvo em: <code className="bg-green-200 px-1 rounded text-xs">example_markdown</code></span>
            <button
              onClick={() => navigator.clipboard.writeText(markdown)}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              📋 Copiar
            </button>
          </div>
          <div className="bg-white rounded border p-4 max-h-80 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {markdown}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  const renderMarkdownMarkmap = (markdown: ProcessAnalysis['markdown_markmap']) => {
    if (!markdown) return null;

    return (
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">🗺️ Markmap (Mapa Mental):</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="mb-3 flex justify-between items-center">
            <span className="text-sm text-gray-600">Salvo em: <code className="bg-gray-200 px-1 rounded text-xs">markmap_markdown</code></span>
            <button
              onClick={() => navigator.clipboard.writeText(markdown)}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              📋 Copiar
            </button>
          </div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto bg-white p-3 rounded border">
            {markdown}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🤖 Teste Lamyda AI - Processamento de Vídeos
        </h1>

        {/* Campo Process ID */}
        <div className="mb-6">
          <Label htmlFor="processId" className="text-sm font-medium">
            ID do Processo *
          </Label>
          <Input
            id="processId"
            type="text"
            placeholder="Ex: f95efab9-1bdd-4966-9ba8-37c1a7bbbe70"
            value={processId}
            onChange={(e) => setProcessId(e.target.value)}
            className="mt-1"
            disabled={processing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Insira o ID de um processo que já tenha um vídeo enviado.
          </p>
        </div>

        {/* Botão de Processamento */}
        <div className="mb-6">
          <Button
            onClick={handleProcessVideo}
            disabled={processing || !processId.trim()}
            className="w-full"
            size="lg"
          >
            {processing ? '🔄 Processando com Lamyda AI...' : '🚀 Processar Vídeo com IA'}
          </Button>
          
          {processing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-sm text-blue-700">
                  A IA está analisando o vídeo... Isso pode levar alguns minutos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Resultado */}
        {result && (
          <div className={`rounded-lg p-4 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-medium mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Processamento Concluído!' : '❌ Erro no Processamento'}
            </h3>
            
            <p className={`text-sm mb-4 ${
              result.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.message}
            </p>

            {result.success && result.data && (
              <div className="space-y-6">
                {/* Informações do Processo */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">📋 Informações do Processo</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Processo:</strong> {result.data.process_name}</div>
                    <div><strong>Empresa:</strong> {result.data.company_name}</div>
                    <div><strong>Área:</strong> {result.data.area_name}</div>
                    <div><strong>ID:</strong> {result.data.process_id}</div>
                  </div>
                </div>

                {/* Análise da IA */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">🤖 Análise da Lamyda AI</h4>
                  
                  {/* Nome da Empresa */}
                  {result.data.analysis.empresa && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">🏢 Empresa Analisada:</h5>
                      <p className="text-sm text-blue-700">{result.data.analysis.empresa}</p>
                    </div>
                  )}

                  {/* Descrição para Busca */}
                  {renderDescricaoParaBusca(result.data.analysis.descricao_para_busca)}

                  {/* Stacks e Ferramentas */}
                  {renderStacksFerramentas(result.data.analysis.stacks_ferramentas)}

                  {/* Passos do Processo (JSON com Timestamps) */}
                  {renderProcessoPassosJson(result.data.analysis.processo_passos)}

                  {/* Processo Passo a Passo (Markdown) */}
                  {renderProcessStepsMarkdown(result.data.analysis.processo_passos_markdown)}

                  {/* Exemplo Prático (Markdown) */}
                  {renderExemploPraticoMarkdown(result.data.analysis.exemplo_pratico_markdown)}

                  {/* Markmap Markdown */}
                  {renderMarkdownMarkmap(result.data.analysis.markdown_markmap)}

                  {/* Conteúdo bruto (se houver erro de parsing) */}
                  {result.data.analysis.conteudo_bruto && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">📄 Resposta Completa da IA:</h5>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {result.data.analysis.conteudo_bruto}
                      </pre>
                    </div>
                  )}

                  {/* Erro de Parsing (se houver) */}
                  {result.data.analysis.erro_parsing && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="font-medium text-yellow-800 mb-2">⚠️ Aviso de Parsing:</h5>
                      <p className="text-sm text-yellow-700">{result.data.analysis.erro_parsing}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!result.success && (result.error || result.details) && (
              <div className="text-sm text-red-700">
                <strong>Detalhes:</strong> {result.error || result.details}
              </div>
            )}
          </div>
        )}

        {/* Instruções */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Como usar:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Certifique-se de que o processo já tem um vídeo enviado (use a página de upload primeiro)</li>
            <li>Insira o UUID do processo</li>
            <li>Clique em "Processar Vídeo com IA"</li>
            <li>Aguarde a análise completa da Lamyda AI</li>
            <li>Visualize os resultados detalhados abaixo</li>
          </ol>
          
          <div className="mt-3 p-3 bg-blue-100 rounded border-l-4 border-blue-500">
            <p className="text-sm text-blue-700">
              <strong>💡 Dica:</strong> Use o ID do processo de teste: <code className="bg-white px-1 rounded">f95efab9-1bdd-4966-9ba8-37c1a7bbbe70</code>
              <br />
              (Primeiro faça upload de um vídeo para este processo na página de teste de upload)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
