// Configurações da API
const API_BASE_URL = 'https://farmasis.crfrs.org.br/ws/fem';
const API_TIMEOUT = 10000; // 10 segundos

// Tipos para a API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  message?: string;
}

// Interface para resposta da API real do CRF
export interface CRFLoginResponse {
  user: string | null;
  senha: string | null;
  msg: string;
  nome?: string;
  email?: string;
  iduser?: string;
  uf?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Classe para gerenciar requisições HTTP
class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // Método para fazer requisições HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    defaultOptions.signal = controller.signal;

    try {
      const response = await fetch(url, defaultOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: A requisição demorou muito para responder');
        }
        throw error;
      }
      
      throw new Error('Erro desconhecido na requisição');
    }
  }

  // Método para login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.request<CRFLoginResponse>('/login.php', {
        method: 'POST',
        body: JSON.stringify({
          username: credentials.email,
          password: credentials.password,
        }),
      });

      // Verificar se a resposta indica sucesso
      if (response.msg === 'sucesso' && response.nome && response.email) {
        return {
          success: true,
          token: `token-${response.iduser}`, // Token baseado no ID do usuário
          user: {
            id: response.iduser || '1',
            name: response.nome,
            email: response.email,
            role: 'fiscal',
            uf: response.uf,
          },
          message: 'Login realizado com sucesso!',
        };
      } else {
        return {
          success: false,
          message: 'Credenciais inválidas ou usuário não autorizado',
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro no login',
      };
    }
  }

  // Método para verificar se o token é válido
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this.request<{ valid: boolean }>('/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.valid;
    } catch (error) {
      console.error('Erro na validação do token:', error);
      return false;
    }
  }

  // Método para obter dados do usuário
  async getUserProfile(token: string) {
    try {
      const response = await this.request<LoginResponse['user']>('/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      throw error;
    }
  }
}

// Instância global do serviço de API
export const apiService = new ApiService(API_BASE_URL, API_TIMEOUT);

// Função helper para simular API (para desenvolvimento)
export const simulateApiCall = async (
  endpoint: string,
  data?: any,
  delay: number = 2000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simular diferentes cenários
      if (endpoint === '/auth/login') {
        const { email, password } = data;
        
        // Simular validação
        if (!email || !password) {
          reject(new Error('Email e senha são obrigatórios'));
          return;
        }

        // Simular credenciais válidas
        if (email === 'admin@crf.org.br' && password === '123456') {
          resolve({
            success: true,
            token: 'fake-jwt-token-123456',
            user: {
              id: '1',
              name: 'Administrador CRF',
              email: 'admin@crf.org.br',
              role: 'admin',
            },
            message: 'Login realizado com sucesso!',
          });
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      } else {
        reject(new Error('Endpoint não implementado'));
      }
    }, delay);
  });
}; 