import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'

interface UserAccountProps {
  isFirstOnboarding?: boolean | null
}

export default function UserAccount({ isFirstOnboarding }: UserAccountProps) {
  const { userInfo, signOut } = useAuth()

  const getInitials = (name?: string) => {
    if (!name) return ''
    const names = name.split(' ')
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase()
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }

  const capitalizeWords = (name?: string) => {
    if (!name) return ''
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isFirstOnboarding ? (
          <div className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {userInfo ? getInitials(userInfo.user_name) : '..'}
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-gray-900">
                {userInfo ? capitalizeWords(userInfo.user_name) : 'Carregando...'}
              </span>
              <span className="text-xs text-gray-500">
                {userInfo ? userInfo.user_email : ''}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
            <span className="text-sm font-medium text-gray-600">
              {userInfo ? getInitials(userInfo.user_name) : '..'}
            </span>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 shadow-none" align="end">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium text-gray-900">
            {userInfo ? capitalizeWords(userInfo.user_name) : 'Carregando...'}
          </p>
          <p className="text-xs text-gray-500">
            {userInfo ? userInfo.user_email : ''}
          </p>
        </div>
        <DropdownMenuItem
          onClick={signOut}
          className="text-gray-900 focus:text-gray-900 focus:bg-gray-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
