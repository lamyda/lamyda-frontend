import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

interface UserSignUpData {
  email: string;
  password: string;
  name: string;
  inviteCode: string;
}

interface SignUpResult {
  error: string | null;
  session?: Session | null;
  user?: User | null;
}

interface UserInfo {
  user_name: string;
  user_email: string;
  is_owner: boolean;
  is_company_created: boolean;
  is_password_change_required: boolean;
  created_at: string;
  updated_at: string;
}


interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userInfo: UserInfo | null;
  signUp: (data: UserSignUpData) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (password: string) => Promise<{ error: string | null }>;
  updateCompanyCreated: (companyId?: string) => Promise<{ error: string | null }>;
  processInviteAcceptance: (companyId: string, role: string, invitedBy: string) => Promise<{ error: string | null }>;
  markPasswordSet: () => Promise<{ error: string | null }>;
  requiresPasswordChange: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  const fetchUserInfo = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_name, user_email, is_owner, is_company_created, is_password_change_required, created_at, updated_at')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Error fetching user information:', error);
      setUserInfo(null);
    }
  }, [user?.id]);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUserInfo(null);
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Separar o fetchUserInfo em um useEffect próprio
  useEffect(() => {
    if (user?.id) {
      fetchUserInfo();
    }
  }, [user?.id, fetchUserInfo])


  const signUp = async ({ email, password, name, inviteCode }: UserSignUpData) => {
    try {

      const signUpData: any = { 
        email, 
        password,
        options: {
          data: {
            user_name: name,
            invite_code: inviteCode,
          }
        }
      };

      const { data, error: authError } = await supabase.auth.signUp(signUpData);
  
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: 'Este email já está cadastrado. Tente fazer login ou use outro email.' };
      }

      if (authError) {
        throw authError;
      }
        
      return { 
        error: null,
        user: data.user,
        session: data.session 
      };
    } catch (error: any) {
      console.error('AuthContext: Erro no signUp:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      if (error.message?.includes('Database error saving new user') ||
          error.message?.includes('Código de convite inválido') || 
          error.message?.includes('Código de convite é obrigatório') ||
          error.message?.includes('já utilizado')) {
        return { error: 'Código de convite inválido ou já utilizado.' };
      }

      if (error.message?.includes('inválido') || error.message?.includes('expirado')) {
        return { error: error.message };
      }

      if (error.message?.includes('User already registered')) {
        return { error: 'Este email já está cadastrado. Tente fazer login ou use outro email.' };
      }
        
      if (error.message?.includes('duplicate key value') || error.message?.includes('already exists')) {
        return { error: 'Este email já está cadastrado. Tente fazer login ou use outro email.' };
      }
        
      if (error.message?.includes('Invalid email')) {
        return { error: 'Email inválido. Verifique o formato do email.' };
      }
        
      if (error.message?.includes('Password should be at least')) {
        return { error: 'A senha deve ter pelo menos 6 caracteres.' };
      }
        
      return { error: 'Erro ao criar conta, tente mais tarde!' };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error?.message || null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error: error?.message || null };
  };
  
  const resetPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message || null };
  };

  const updateCompanyCreated = async (companyId?: string) => {
    if (!user) return { error: 'Usuário não encontrado' };
    
    try {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ is_company_created: true })
        .eq('user_id', user.id);

      if (userUpdateError) throw userUpdateError;

      if (companyId) {
        const { error: companyUserError } = await supabase
          .from('company_users')
          .insert({
            company_id: companyId,
            user_id: user.id,
            role: 'owner',
            added_by: user.id,
            is_active: true
          });

        if (companyUserError) throw companyUserError;
      }
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('user_name, user_email, is_owner, is_company_created, is_password_change_required, created_at, updated_at')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setUserInfo(data);
      }

      
      return { error: null };
    } catch (error: any) {
      console.error('Error updating company created status:', error);
      return { error: error.message || 'Erro ao atualizar status' };
    }
  };

  const processInviteAcceptance = async (companyId: string, role: string, invitedBy: string) => {
    if (!user) return { error: 'Usuário não encontrado' };
    
    try {
      const { error } = await supabase.rpc('process_invite_acceptance', {
        p_company_id: companyId,
        p_role: role,
        p_invited_by: invitedBy
      });

      if (error) throw error;
      
      // Refresh user info to get updated password_change_required status
      await fetchUserInfo();
      
      return { error: null };
    } catch (error: any) {
      console.error('Error processing invite acceptance:', error);
      return { error: error.message || 'Erro ao processar convite' };
    }
  };

  const markPasswordSet = async () => {
    if (!user) return { error: 'Usuário não encontrado' };
    
    try {
      const { error } = await supabase.rpc('mark_password_set');

      if (error) throw error;
      
      // Refresh user info to get updated password_change_required status
      await fetchUserInfo();
      
      return { error: null };
    } catch (error: any) {
      console.error('Error marking password as set:', error);
      return { error: error.message || 'Erro ao atualizar senha' };
    }
  };

  const requiresPasswordChange = () => {
    return userInfo?.is_password_change_required === true;
  };

  const value = {
    user, 
    session, 
    loading, 
    signIn, 
    signUp, 
    signOut,
    forgotPassword,
    resetPassword,
    userInfo,
    updateCompanyCreated,
    processInviteAcceptance,
    markPasswordSet,
    requiresPasswordChange,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 

export default AuthContext;