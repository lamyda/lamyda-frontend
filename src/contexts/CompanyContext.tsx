import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from './AuthContext'

interface CompanyInfo {
  id: string;
  name: string;
  description?: string;
  type: 'personal' | 'company';
  owner_id: string;
  created_at: string;
  updated_at: string;
  userRole?: 'owner' | 'administrator' | 'collaborator' | 'visitor';
}

interface CompanyStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
}

interface CompanyContextType {
  companyInfo: CompanyInfo | null;
  companyStats: CompanyStats | null;
  loading: boolean;
  refreshCompanyInfo: () => Promise<void>;
  refreshCompanyStats: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany deve ser usado dentro de um CompanyProvider')
  }
  return context
}

interface CompanyProviderProps {
  children: React.ReactNode
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { user } = useAuth()

  const fetchCompanyInfo = async () => {
    if (!user?.id) {
      console.log('fetchCompanyInfo: No user.id available');
      return;
    }
    
    console.log('=== FETCH COMPANY INFO DEBUG ===');
    console.log('user.id:', user.id);
    
    try {
      setLoading(true);
      
      // Verificar se temos uma sessão válida
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('No valid session found, skipping company info fetch');
        return;
      }
      
      console.log('Session valid, proceeding with company fetch');
      
      // Primeiro, vamos testar se conseguimos encontrar o registro em company_users
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select('company_id, role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
        
      console.log('Company user data:', { companyUserData, companyUserError });
      
      if (companyUserError) {
        if (companyUserError.code === 'PGRST116') {
          console.log('User not found in company_users table');
          setCompanyInfo(null);
          return;
        }
        throw companyUserError;
      }
      
      if (!companyUserData) {
        console.log('No company user data found');
        setCompanyInfo(null);
        return;
      }
      
      // Agora buscar os dados da empresa separadamente
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, description, type, owner_id, created_at, updated_at')
        .eq('id', companyUserData.company_id)
        .single();
        
      console.log('Company data:', { companyData, companyError });
      
      if (companyError) {
        throw companyError;
      }
      
      console.log('Company found:', companyData);
      console.log('User role:', companyUserData.role);
      
      setCompanyInfo({
        ...companyData,
        userRole: companyUserData.role
      });
      
    } catch (error) {
      console.error('Error fetching company information:', error);
      setCompanyInfo(null);
    } finally {
      setLoading(false);
    }
    
    console.log('=== END FETCH COMPANY INFO DEBUG ===');
  };

  const fetchCompanyStats = async () => {
    if (!companyInfo?.id) {
      return;
    }

    try {
      console.log('=== FETCH COMPANY STATS ===');
      console.log('company.id:', companyInfo.id);
      
      // Usar função RPC para buscar estatísticas (evita problemas de RLS)
      const { data, error } = await supabase.rpc('count_company_members', {
        p_company_id: companyInfo.id
      });

      if (error) {
        throw error;
      }

      console.log('Company stats from RPC:', data);

      setCompanyStats({
        totalMembers: data.totalMembers || 0,
        activeMembers: data.activeMembers || 0,
        pendingInvites: data.pendingInvites || 0
      });

    } catch (error) {
      console.error('Error fetching company stats:', error);
      setCompanyStats(null);
    }
  };

  // Funções públicas para refresh
  const refreshCompanyInfo = async () => {
    await fetchCompanyInfo();
  };

  const refreshCompanyStats = async () => {
    await fetchCompanyStats();
  };

  // Effect para carregar dados da empresa quando usuário mudar
  useEffect(() => {
    if (user?.id) {
      // Adicionar um pequeno delay para garantir que a sessão esteja completamente estabelecida
      const timer = setTimeout(() => {
        fetchCompanyInfo();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setCompanyInfo(null);
      setCompanyStats(null);
    }
  }, [user?.id]);

  // Effect para carregar estatísticas quando empresa mudar
  useEffect(() => {
    if (companyInfo?.id) {
      fetchCompanyStats();
    } else {
      setCompanyStats(null);
    }
  }, [companyInfo?.id]);

  const value = {
    companyInfo,
    companyStats,
    loading,
    refreshCompanyInfo,
    refreshCompanyStats,
  }

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export default CompanyContext;
