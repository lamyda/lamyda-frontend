import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Trash2, Eye, Plus, Calendar, HardDrive, FileImage, FileVideo, FileAudio, FileSpreadsheet, FileArchive, File } from "lucide-react"

interface DocumentsComponentProps {
  processId?: string
  documents?: DocumentItem[]
  onDocumentsChange?: (documents: DocumentItem[]) => void
}

interface DocumentItem {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  file: File
  url?: string
}

export default function DocumentsComponent({ processId, documents, onDocumentsChange }: DocumentsComponentProps) {
  const [uploading, setUploading] = useState(false)

  // Remover parâmetro não utilizado para evitar warning
  console.log('Process ID:', processId)

  // Usar documentos do estado pai diretamente
  const documentsList = documents || []

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    
    // Simular upload (aqui você implementaria o upload real)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      const newDocument: DocumentItem = {
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        file: file,
        url: URL.createObjectURL(file)
      }
      
      // Atualizar documentos via callback do pai
      if (onDocumentsChange) {
        const updatedDocuments = [...documentsList, newDocument]
        onDocumentsChange(updatedDocuments)
      }
    }
    
    setUploading(false)
    
    // Limpar input
    event.target.value = ''
  }

  const removeDocument = (id: string) => {
    if (onDocumentsChange) {
      const updatedDocuments = documentsList.filter(doc => doc.id !== id)
      onDocumentsChange(updatedDocuments)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-600" />
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />
    if (type.includes('word') || type.includes('document')) return <FileText className="w-5 h-5 text-blue-700" />
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className="w-5 h-5 text-green-700" />
    if (type.includes('powerpoint') || type.includes('presentation')) return <FileText className="w-5 h-5 text-orange-600" />
    if (type.includes('video')) return <FileVideo className="w-5 h-5 text-purple-600" />
    if (type.includes('audio')) return <FileAudio className="w-5 h-5 text-green-600" />
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <FileArchive className="w-5 h-5 text-yellow-600" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between px-8 pt-8">
        <div className="text-left">
          <h2 className="text-2xl font-medium tracking-tight mb-2">
            Documentos do Processo {documentsList.length > 0 && `(${documentsList.length})`}
          </h2>
          <p className="text-sm text-gray-500 mb-4">Adicione arquivos, documentos e anexos relacionados a este processo</p>
        </div>
        
        <div>
          <input
            type="file"
            multiple
            accept="*/*"
            onChange={handleFileUpload}
            className="hidden"
            id="document-upload"
          />
          <label htmlFor="document-upload">
            <Button
              type="button"
              className="bg-lamyda-primary hover:brightness-110 shadow-none rounded-sm text-white font-medium"
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-6">

        {/* Documents Table */}
        {documentsList.length > 0 && (
          <div className="border-t border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-medium">Nome do Arquivo</TableHead>
                    <TableHead className="font-medium w-32">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Tamanho
                      </div>
                    </TableHead>
                    <TableHead className="font-medium w-40">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data de Upload
                      </div>
                    </TableHead>
                    <TableHead className="font-medium w-32 text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentsList.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {getFileIcon(doc.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 truncate max-w-xs">{doc.name}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {doc.type.split('/').pop() || 'Arquivo'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatFileSize(doc.size)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(doc.uploadDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          {doc.url && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.url, '_blank')}
                              className="h-8 w-8 p-0"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {doc.url && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const a = document.createElement('a')
                                a.href = doc.url!
                                a.download = doc.name
                                a.click()
                              }}
                              className="h-8 w-8 p-0"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        )}

        {/* Empty State */}
        {documentsList.length === 0 && (
          <div className="text-center py-12 px-8 border-t border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum documento adicionado ainda</p>
            <p className="text-sm text-gray-400 mt-1">
              Os documentos que você adicionar aparecerão aqui
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
