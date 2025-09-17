import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompany } from "@/contexts/CompanyContext"
import { supabase } from "@/services/supabase"
import { useEffect, useState } from "react"

interface ViewMembersDialogProps {
  children: React.ReactNode
}

interface CompanyMember {
  user_id: string
  user_name: string
  user_email: string
  role: 'owner' | 'administrator' | 'collaborator' | 'visitor'
  is_active: boolean
  created_at: string
}

export default function ViewMembersDialog({ children }: ViewMembersDialogProps) {
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const { companyInfo } = useCompany()

  const fetchMembers = async () => {
    if (!companyInfo?.id) return

    setLoading(true)
    try {
      console.log('=== FETCH MEMBERS ===')
      console.log('company.id:', companyInfo.id)
      
      // Usar RPC para buscar membros (evita problemas de RLS)
      const { data, error } = await supabase.rpc('get_company_members', {
        p_company_id: companyInfo.id
      })

      if (error) {
        console.error('Error fetching members:', error)
        return
      }

      console.log('Members data:', data)
      setMembers(data || [])
      
    } catch (error) {
      console.error('Error fetching company members:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  // Carregar membros quando o dialog abrir
  useEffect(() => {
    if (isOpen && companyInfo?.id) {
      fetchMembers()
    }
  }, [isOpen, companyInfo?.id])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-base font-medium">
            Membros da Empresa
            {!loading && members.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({members.length} {members.length === 1 ? 'membro' : 'membros'})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Visualize todos os membros da {companyInfo?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-0">
          {loading ? (
            // Loading skeleton
            <div className="space-y-0">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-3 border-b border-gray-100 last:border-b-0">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            // Empty state
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum membro encontrado</p>
            </div>
          ) : (
            // Members list
            <div className={`space-y-0 ${members.length >= 4 ? 'max-h-80 overflow-y-auto' : ''}`}>
              {/* Members */}
              {members.map((member, index) => (
                <div
                  key={member.user_id}
                  className={`flex items-center space-x-4 pt-4 pb-4 hover:bg-gray-50 transition-colors ${
                    index < members.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium">
                    {getInitials(member.user_name)}
                  </div>
                  
                  {/* Nome e Email */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {member.user_name}
                      {member.role === 'owner' && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {member.user_email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="rounded-sm">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
