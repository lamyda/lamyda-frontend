import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import { useCallback, useRef, useState, useEffect } from 'react'
import { supabase } from '@/services/supabase'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
  Sparkles
} from 'lucide-react'
import { Button } from './button'
import { Separator } from './separator'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  processId?: string // ID do processo para associar as imagens como documentos
  onTempImagesChange?: (images: TempImage[]) => void // Callback para imagens temporárias
  onGenerateWithAI?: () => void // Callback para gerar conteúdo com IA
}

interface TempImage {
  id: string
  file: File
  dataUrl: string
  name: string
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = "Digite aqui...",
  className = "",
  minHeight = "200px",
  processId,
  onTempImagesChange,
  onGenerateWithAI
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tempImages, setTempImages] = useState<TempImage[]>([])
  
  // Log das imagens temporárias para debug (pode remover em produção)
  console.log('Current temp images:', tempImages)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Dropcursor.configure({
        color: '#3b82f6',
        width: 2,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none ${className}`,
      },
    },
  })

  // Sincronizar conteúdo quando prop content mudar
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('🔄 SINCRONIZANDO CONTEÚDO DO TIPTAP:', content)
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Função para adicionar imagem temporária (durante criação)
  const addTempImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      // Converter para data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Criar ID único para a imagem temporária
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`
      
      // Criar objeto de imagem temporária
      const tempImage: TempImage = {
        id: tempId,
        file,
        dataUrl,
        name: file.name
      }

      // Adicionar à lista de imagens temporárias
      setTempImages(prev => {
        const newImages = [...prev, tempImage]
        // Notificar componente pai sobre mudança
        onTempImagesChange?.(newImages)
        return newImages
      })

      return dataUrl
    } catch (error) {
      console.error('Error creating temp image:', error)
      return null
    }
  }, [onTempImagesChange])

  // Função para upload de imagem e criar documento (quando processo já existe)
  const uploadImageAsDocument = useCallback(async (file: File): Promise<string | null> => {
    if (!processId) {
      console.error('Process ID is required to upload images')
      return null
    }

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `process-images/${fileName}`

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('process-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return null
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('process-files')
        .getPublicUrl(filePath)

      // Calcular hash do arquivo para versionamento
      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Criar documento na tabela documents
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          process_id: processId,
          file_name: file.name,
          file_type: file.type,
          file_url: publicUrl,
          file_size: file.size,
          file_hash: fileHash,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (documentError) {
        console.error('Error creating document record:', documentError)
        // Se falhar ao criar o documento, tentar deletar o arquivo do storage
        await supabase.storage.from('process-files').remove([filePath])
        return null
      }

      console.log('Image uploaded and document created:', documentData)
      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }, [processId])

  // Função para adicionar imagem
  const addImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Função para lidar com seleção de arquivo
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    try {
      let imageUrl: string | null = null

      if (processId) {
        // Se processo já existe, fazer upload direto
        imageUrl = await uploadImageAsDocument(file)
      } else {
        // Se está criando processo, adicionar como imagem temporária
        imageUrl = await addTempImage(file)
      }
      
      if (imageUrl) {
        // Adicionar imagem no editor
        editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run()
      } else {
        alert('Erro ao processar a imagem. Tente novamente.')
      }
    } catch (error) {
      console.error('Error handling file:', error)
      alert('Erro ao processar a imagem.')
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [editor, processId, uploadImageAsDocument, addTempImage])

  if (!editor) {
    return null
  }

  return (
    <div className="rounded-none overflow-hidden tiptap-editor-container">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Text Formatting */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Text Alignment */}
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'left' }) || (!editor.isActive({ textAlign: 'center' }) && !editor.isActive({ textAlign: 'right' }) && !editor.isActive({ textAlign: 'justify' })) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className="h-8 w-8 p-0"
          title="Alinhar à esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className="h-8 w-8 p-0"
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className="h-8 w-8 p-0"
          title="Alinhar à direita"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className="h-8 w-8 p-0"
          title="Justificar"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Image Upload */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="h-8 w-8 p-0"
          title={processId ? "Adicionar imagem" : "Adicionar imagem (temporária)"}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Headings */}
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-8 px-2 text-xs font-semibold"
        >
          H1
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-8 px-2 text-xs font-semibold"
        >
          H2
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="h-8 px-2 text-xs font-semibold"
        >
          H3
        </Button>
        
        {/* Gerar com IA - Posicionado à direita */}
        {onGenerateWithAI && (
          <>
            <div className="flex-1" /> {/* Spacer para empurrar o botão para a direita */}
            <Button
              type="button"
              onClick={onGenerateWithAI}
              className="ai-button h-8 px-3 text-xs font-medium"
              style={{ padding: '0.5rem 0.75rem' }}
            >
              <Sparkles className="h-3 w-3 mr-1.5" />
              Gerar com Lamyda AI
            </Button>
          </>
        )}
      </div>
      
      {/* Editor */}
      <div className="p-4" style={{ minHeight }}>
        <EditorContent 
          editor={editor} 
          className="focus:outline-none"
        />
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
