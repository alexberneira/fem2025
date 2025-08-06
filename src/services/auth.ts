import React from 'react';
import { apiService, simulateApiCall, LoginRequest, LoginResponse } from './api';

// Interface para o usuário autenticado
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  uf?: string;
}

// Interface para o estado de autenticação
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Classe para gerenciar autenticação
class AuthService {
  private currentToken: string | null = null;
  private currentUser: AuthenticatedUser | null = null;

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!this.currentToken;
  }

  // Obter token atual
  getToken(): string | null {
    return this.currentToken;
  }

  // Obter dados do usuário atual
  getUser(): AuthenticatedUser | null {
    return this.currentUser;
  }

  // Fazer login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Usar API real do CRF
      const response = await apiService.login(credentials);
      
      if (response.success && response.token && response.user) {
        // Salvar token e dados do usuário
        this.currentToken = response.token;
        this.currentUser = response.user;
      }

      return response;
    } catch (error) {
      console.error('Erro no login:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro no login',
      };
    }
  }

  // Fazer logout
  logout(): void {
    this.currentToken = null;
    this.currentUser = null;
  }

  // Verificar se o token é válido
  async validateToken(): Promise<boolean> {
    return !!this.currentToken;
  }

  // Obter dados do usuário atual
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    return this.currentUser;
  }

  // Limpar dados de autenticação
  clearAuth(): void {
    this.logout();
  }
}

// Instância global do serviço de autenticação
export const authService = new AuthService();

// Hook para gerenciar estado de autenticação (para React)
export const useAuth = () => {
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getUser(),
    token: authService.getToken(),
    isLoading: false,
    error: null,
  });

  const login = async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.login(credentials);

      if (response.success) {
        setAuthState({
          isAuthenticated: true,
          user: response.user || null,
          token: response.token || null,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Erro no login',
        }));
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}; 