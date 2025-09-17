import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabase';

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    process_id: string;
    video_url: string;
    storage_path: string;
    file_size: number;
    file_name: string;
  };
  error?: string;
  details?: string;
}

export default function VideoUploadTest() {
  const [processId, setProcessId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Verificar se é um arquivo de vídeo
    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione um arquivo de vídeo.');
      return;
    }

    // Verificar tamanho (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo 100MB.');
      return;
    }

    setSelectedFile(file);
    setResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!processId.trim()) {
      alert('Por favor, informe o ID do processo.');
      return;
    }

    if (!selectedFile) {
      alert('Por favor, selecione um arquivo de vídeo.');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // Preparar FormData
      const formData = new FormData();
      formData.append('process_id', processId.trim());
      formData.append('video', selectedFile);

      // Chamar a edge function
      const response = await supabase.functions.invoke('video-upload', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data);
      
      // Limpar formulário em caso de sucesso
      if (response.data.success) {
        setSelectedFile(null);
        setProcessId('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      setResult({
        success: false,
        message: 'Erro no upload',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Teste de Upload de Vídeo
        </h1>

        {/* Campo Process ID */}
        <div className="mb-6">
          <Label htmlFor="processId" className="text-sm font-medium">
            ID do Processo *
          </Label>
          <Input
            id="processId"
            type="text"
            placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
            value={processId}
            onChange={(e) => setProcessId(e.target.value)}
            className="mt-1"
            disabled={uploading}
          />
        </div>

        {/* Área de Upload */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">
            Arquivo de Vídeo *
          </Label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <div className="text-green-600 font-medium">
                  ✓ Arquivo selecionado
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Nome:</strong> {selectedFile.name}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Tamanho:</strong> {formatFileSize(selectedFile.size)}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Tipo:</strong> {selectedFile.type}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={uploading}
                >
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-gray-500">
                  Arraste e solte um vídeo aqui, ou clique para selecionar
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Selecionar Arquivo
                </Button>
                <div className="text-xs text-gray-400">
                  Formatos suportados: MP4, MOV, AVI, etc. (máx. 100MB)
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Botão de Upload */}
        <div className="mb-6">
          <Button
            onClick={handleUpload}
            disabled={uploading || !processId.trim() || !selectedFile}
            className="w-full"
            size="lg"
          >
            {uploading ? 'Enviando...' : 'Enviar Vídeo'}
          </Button>
        </div>

        {/* Resultado */}
        {result && (
          <div className={`rounded-lg p-4 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-medium mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Sucesso!' : '❌ Erro'}
            </h3>
            
            <p className={`text-sm mb-3 ${
              result.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.message}
            </p>

            {result.success && result.data && (
              <div className="space-y-2 text-sm text-green-700">
                <div><strong>Process ID:</strong> {result.data.process_id}</div>
                <div><strong>Arquivo:</strong> {result.data.file_name}</div>
                <div><strong>Tamanho:</strong> {formatFileSize(result.data.file_size)}</div>
                <div><strong>Caminho:</strong> {result.data.storage_path}</div>
                <div className="pt-2">
                  <strong>URL do Vídeo:</strong>
                  <a 
                    href={result.data.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {result.data.video_url}
                  </a>
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
            <li>Insira o UUID de um processo existente</li>
            <li>Selecione ou arraste um arquivo de vídeo</li>
            <li>Clique em "Enviar Vídeo"</li>
            <li>O vídeo será salvo no storage e o campo video_url será atualizado</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
