import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from './AuthContext'
import { useNavigate } from 'react-router-dom'

export interface OnboardingData {
  selectedOption: 'personal' | 'company' | null
  workspaceName: string
  workspaceDescription: string
}

export interface OnboardingContextType {
  currentStep: number
  onboardingData: OnboardingData
  isSubmitting: boolean
  error: string | null
  
  setCurrentStep: (step: number) => void
  updateOnboardingData: (data: Partial<OnboardingData>) => void
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => void
  
  canProceedToNext: () => boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

interface OnboardingProviderProps {
  children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    selectedOption: null,
    workspaceName: '',
    workspaceDescription: ''
  })

  const { updateCompanyCreated } = useAuth()
  const navigate = useNavigate()

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
    setError(null)
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.selectedOption !== null
      case 2:
        return Boolean(onboardingData.workspaceName.trim() && onboardingData.workspaceDescription.trim())
      default:
        return false
    }
  }

  const completeOnboarding = async () => {
    if (!canProceedToNext()) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase.rpc('complete_onboarding', {
        p_type: onboardingData.selectedOption,
        p_name: onboardingData.workspaceName.trim(),
        p_description: onboardingData.workspaceDescription.trim() || null
      })

      if (supabaseError) {
        console.error('Erro:', supabaseError)
        throw new Error(supabaseError.message || 'Erro ao finalizar onboarding')
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Erro inesperado ao finalizar onboarding')
      }

      const companyId = data?.company?.id
      if (companyId) {
        await updateCompanyCreated(companyId)
      } else {
        console.warn('Company ID not found in onboarding response, calling updateCompanyCreated without ID')
        await updateCompanyCreated()
      }

      console.log('Onboarding finalizado com sucesso:', data)
      navigate('/dashboard')

    } catch (err) {
      console.error('Error ao finalizar onboarding:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetOnboarding = () => {
    setCurrentStep(1)
    setIsSubmitting(false)
    setError(null)
    setOnboardingData({
      selectedOption: null,
      workspaceName: '',
      workspaceDescription: ''
    })
  }

  const value: OnboardingContextType = {
    currentStep,
    onboardingData,
    isSubmitting,
    error,
    
    setCurrentStep,
    updateOnboardingData,
    completeOnboarding,
    resetOnboarding,
    
    canProceedToNext
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

export default OnboardingContext
