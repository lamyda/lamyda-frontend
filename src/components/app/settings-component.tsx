import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { FileText, Shield, Archive } from "lucide-react"

interface SettingsComponentProps {
  processId?: string
}

export default function SettingsComponent({ }: SettingsComponentProps) {
  const [settings, setSettings] = useState({
    visibility: 'private', // 'private', 'team', 'company'
    allowComments: true,
    requireApproval: false,
    versionControl: true,
    notifyChanges: true,
    autoArchive: false,
    archiveDays: 365
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="w-full h-screen flex flex-col space-y-6 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Configurações do Processo</h2>
        <p className="text-gray-600">Defina acessos, permissões e configurações avançadas</p>
      </div>

      <div className="flex-1 space-y-8 overflow-auto">
        {/* Access Control */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Controle de Acesso</h3>
          </div>
          
          <div className="space-y-4 pl-7">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilidade do Processo</Label>
              <Select 
                value={settings.visibility} 
                onValueChange={(value) => handleSettingChange('visibility', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Privado - Apenas eu</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="team">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Time - Membros do time</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="company">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Empresa - Todos da empresa</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Comentários</Label>
                <p className="text-sm text-gray-500">Usuários podem adicionar comentários no processo</p>
              </div>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(checked) => handleSettingChange('allowComments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requer Aprovação</Label>
                <p className="text-sm text-gray-500">Mudanças precisam ser aprovadas antes de serem publicadas</p>
              </div>
              <Switch
                checked={settings.requireApproval}
                onCheckedChange={(checked) => handleSettingChange('requireApproval', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Document Management */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Gerenciamento de Documentos</h3>
          </div>
          
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Controle de Versão</Label>
                <p className="text-sm text-gray-500">Manter histórico de todas as alterações</p>
              </div>
              <Switch
                checked={settings.versionControl}
                onCheckedChange={(checked) => handleSettingChange('versionControl', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar Mudanças</Label>
                <p className="text-sm text-gray-500">Enviar notificações quando o processo for atualizado</p>
              </div>
              <Switch
                checked={settings.notifyChanges}
                onCheckedChange={(checked) => handleSettingChange('notifyChanges', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Archive Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Archive className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Arquivamento</h3>
          </div>
          
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Arquivamento Automático</Label>
                <p className="text-sm text-gray-500">Arquivar automaticamente processos inativos</p>
              </div>
              <Switch
                checked={settings.autoArchive}
                onCheckedChange={(checked) => handleSettingChange('autoArchive', checked)}
              />
            </div>

            {settings.autoArchive && (
              <div className="space-y-2">
                <Label htmlFor="archiveDays">Dias para Arquivamento</Label>
                <Input
                  id="archiveDays"
                  type="number"
                  value={settings.archiveDays}
                  onChange={(e) => handleSettingChange('archiveDays', parseInt(e.target.value))}
                  placeholder="365"
                  className="w-32"
                />
                <p className="text-xs text-gray-500">
                  Processos sem atividade por {settings.archiveDays} dias serão arquivados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-end">
          <Button
            type="button"
            className="bg-lamyda-primary hover:brightness-110 shadow-none rounded-sm text-white font-medium"
          >
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
