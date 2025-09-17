import { ChevronDown, UserPlus, Users } from "lucide-react"
import { useCompany } from "@/contexts/CompanyContext"
import { Skeleton } from "@/components/ui/skeleton"
import InviteMemberDialog from "./invite-member-dialog"
import ViewMembersDialog from "./view-members-dialog"

export default function CompanyInformation() {
  const { companyInfo, companyStats, loading } = useCompany()

  const getDisplayName = () => {
    if (companyInfo?.name) {
      return companyInfo.name
    }
    return null
  }

  const getMemberCount = () => {
    if (companyStats?.totalMembers) {
      const count = companyStats.totalMembers
      return `${count} ${count === 1 ? 'membro' : 'membros'}`
    }
    return "Carregando..."
  }

  const canInviteMembers = () => {
    return companyInfo?.userRole === 'owner' || companyInfo?.userRole === 'administrator'
  }

  const isLoading = loading || !companyInfo

  return (
    <div className="px-4 py-3 pt-6 pb-0">
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2">
        <div className="flex items-center justify-between cursor-pointer mb-3">
          <div className="flex flex-col">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {getDisplayName() || "Carregando..."}
                </div>
                <div className="text-xs text-gray-500">{getMemberCount()}</div>
              </>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        
        <hr className="border-gray-200 mb-3" />
        
        {canInviteMembers() ? (
          <InviteMemberDialog>
            <button 
              className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-md w-full text-left disabled:opacity-50"
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4 text-gray-400" />
              <span>Convidar membros</span>
            </button>
          </InviteMemberDialog>
        ) : (
          <ViewMembersDialog>
            <button 
              className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-md w-full text-left disabled:opacity-50"
              disabled={isLoading}
            >
              <Users className="w-4 h-4 text-gray-400" />
              <span>Ver membros</span>
            </button>
          </ViewMembersDialog>
        )}
      </div>
    </div>
  )
}
