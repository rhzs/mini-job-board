'use client'

import React, { useState } from 'react'
import { ChevronDown, Building2, Plus, Users, Settings, User, LogOut, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useTenant } from '@/lib/tenant-context'
import { useAuth } from '@/lib/auth-context'

interface CompanySelectorProps {
  onCreateCompany: () => void
  onJoinCompany: () => void
  onManageCompany?: () => void
}

export default function CompanySelector({ 
  onCreateCompany, 
  onJoinCompany, 
  onManageCompany 
}: CompanySelectorProps) {
  const { user, signOut } = useAuth()
  const { currentCompany, userCompanies, switchCompany, switchToPersonal, isLoading } = useTenant()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  if (!user) {
    return null
  }

  const handleCompanySwitch = async (companyId: string) => {
    try {
      await switchCompany(companyId)
      setIsOpen(false)
    } catch (error) {
      console.error('Error switching company:', error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'member': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 h-9 px-3 data-[state=open]:bg-accent"
          disabled={isLoading}
        >
          {currentCompany ? (
            <>
              {currentCompany.logo_url ? (
                <img 
                  src={currentCompany.logo_url} 
                  alt={currentCompany.company_name}
                  className="w-5 h-5 rounded object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                  {getCompanyInitials(currentCompany.company_name)}
                </div>
              )}
              <span className="hidden sm:inline font-medium text-sm max-w-32 truncate">
                {currentCompany.company_name}
              </span>
              <Badge variant="secondary" className="hidden md:inline text-xs">
                {currentCompany.role}
              </Badge>
            </>
          ) : (
            <>
              <User className="w-5 h-5 text-green-600" />
              <span className="hidden sm:inline text-sm font-medium text-green-600">
                Personal Mode
              </span>
              <Badge variant="outline" className="hidden md:inline text-xs border-green-600 text-green-600">
                Personal
              </Badge>
            </>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80">
        {/* User Info Section */}
        {user && (
          <>
            <div className="px-3 py-3 bg-accent/30 rounded-md mx-2 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Current Mode Section */}
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
          Current Mode
        </div>
        {currentCompany ? (
          <div className="px-3 py-2 bg-accent/50 rounded-md mx-2 mb-2">
            <div className="flex items-center gap-3">
              {currentCompany.logo_url ? (
                <img 
                  src={currentCompany.logo_url} 
                  alt={currentCompany.company_name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {getCompanyInitials(currentCompany.company_name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {currentCompany.company_name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getRoleColor(currentCompany.role)}`}>
                    {currentCompany.role}
                  </Badge>
                                      {currentCompany.location && (
                      <span className="text-xs text-muted-foreground truncate">
                        {currentCompany.location}
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md mx-2 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-green-700 dark:text-green-400">
                  Personal Mode
                </div>
                <div className="text-xs text-green-600 dark:text-green-500">
                  Browsing jobs as an individual
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Companies Section */}
        {userCompanies.length > 0 && (currentCompany ? userCompanies.length > 1 : true) && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
              {currentCompany ? 'Switch Company' : 'Available Companies'}
            </div>
            {userCompanies
              .filter(company => company.company_id !== currentCompany?.company_id)
              .map((company) => (
                <DropdownMenuItem 
                  key={company.company_id}
                  className="cursor-pointer p-3"
                  onClick={() => handleCompanySwitch(company.company_id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={company.company_name}
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                        {getCompanyInitials(company.company_name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {company.company_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getRoleColor(company.role)}`}>
                          {company.role}
                        </Badge>
                        {company.industry && (
                          <span className="text-xs text-muted-foreground">
                            {company.industry}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
          </>
        )}

        {/* Actions Section */}
        <DropdownMenuSeparator />
        
        {/* Personal Mode Option - only show if not already in personal mode */}
        {currentCompany && (
          <DropdownMenuItem 
            className="cursor-pointer p-3"
            onClick={async () => {
              try {
                // Switch to personal mode first
                await switchToPersonal()
                // Close dropdown after a brief delay to prevent interference
                setTimeout(() => setIsOpen(false), 100)
              } catch (error) {
                console.error('Error in switchToPersonal dropdown click:', error)
                // Still close dropdown even if error occurs
                setTimeout(() => setIsOpen(false), 100)
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Switch to Personal Mode</div>
                <div className="text-xs text-muted-foreground">
                  Browse jobs as an individual
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          className="cursor-pointer p-3"
          onClick={() => {
            setIsOpen(false)
            router.push('/company/create')
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded border-2 border-dashed border-muted-foreground flex items-center justify-center">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium text-sm">Add New Company</div>
              <div className="text-xs text-muted-foreground">
                Create your own organization
              </div>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="cursor-pointer p-3"
          onClick={() => {
            setIsOpen(false)
            onJoinCompany()
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-sm">Link Company</div>
              <div className="text-xs text-muted-foreground">
                Connect with an existing organization
              </div>
            </div>
          </div>
        </DropdownMenuItem>

        {/* Company Management */}
        {currentCompany && (currentCompany.role === 'owner' || currentCompany.role === 'admin') && onManageCompany && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer p-3"
              onClick={() => {
                setIsOpen(false)
                onManageCompany()
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Manage Company</div>
                  <div className="text-xs text-muted-foreground">
                    Settings, members, and more
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {/* No Companies State */}
        {userCompanies.length === 0 && (
          <div className="px-3 py-4 text-center">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-sm font-medium">No Companies</div>
            <div className="text-xs text-muted-foreground mb-3">
              Create or join a company to get started
            </div>
          </div>
        )}

        {/* Sign Out Section */}
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer p-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Sign Out</div>
                  <div className="text-xs text-muted-foreground">
                    End your session
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 