const http = require('http');
const url = require('url');
const https = require('https');
const crypto = require('crypto');

// Importar módulos refatorados
const { SERVER_CONFIG } = require('./src/shared/constants');
const SessionMiddleware = require('./src/server/middleware/sessionMiddleware');
const ApiRoutes = require('./src/server/routes/apiRoutes');

// Instanciar rotas da API
const apiRoutes = new ApiRoutes();

// Função para fazer hash de senha
function hashPassword(password, algorithm = 'sha1') {
    return crypto.createHash(algorithm).update(password).digest('hex');
}

// Função para gerar ID de sessão
function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

// Função para fazer login na API CRF
async function fazerLogin() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            username: SERVER_CONFIG.LOGIN_CREDENTIALS.username,
            password: SERVER_CONFIG.LOGIN_CREDENTIALS.password
        });

        const options = {
            hostname: 'api.crf.gov.br',
            port: 443,
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'FEM-App/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Erro ao processar resposta do login'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Função para processar empresas
function processarEmpresas(data) {
    if (!data.data || !Array.isArray(data.data)) {
        return [];
    }

    return data.data.map(empresa => ({
        id: empresa.id || empresa.codigo,
        nome: empresa.nome || empresa.razao_social,
        cnpj: empresa.cnpj,
        ativo: empresa.ativo !== false,
        dataIni: empresa.data_ini,
        dataFim: empresa.data_fim,
        status: empresa.status || 'Pendente'
    }));
}

// Função para validar período da empresa
function validarPeriodoEmpresa(empresa) {
    if (!empresa.dataIni && !empresa.dataFim) {
        return true;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (empresa.dataIni) {
        const dataIni = new Date(empresa.dataIni);
        if (hoje < dataIni) {
            return false;
        }
    }

    if (empresa.dataFim) {
        const dataFim = new Date(empresa.dataFim);
        if (hoje > dataFim) {
            return false;
        }
    }

    return true;
}

// HTML da página de login
const loginHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FEM App - Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .login-container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }

        .logo {
            text-align: center;
            margin-bottom: 2rem;
        }

        .logo h1 {
            color: #333;
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .logo p {
            color: #666;
            font-size: 0.9rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 500;
        }

        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 5px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }

        .login-btn {
            width: 100%;
            padding: 0.75rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .login-btn:hover {
            transform: translateY(-2px);
        }

        .login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .error-message {
            color: #e74c3c;
            text-align: center;
            margin-top: 1rem;
            font-size: 0.9rem;
        }

        .loading {
            display: none;
            text-align: center;
            margin-top: 1rem;
        }

        .loading.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>FEM App</h1>
            <p>Sistema de Fiscalização</p>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Usuário</label>
                <input type="text" id="username" name="username" value="alex.berneira@crf.gov.br" readonly>
            </div>
            
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" value="FEM2025@" readonly>
            </div>
            
            <button type="submit" class="login-btn" id="loginBtn">
                Entrar
            </button>
        </form>
        
        <div class="error-message" id="errorMessage"></div>
        
        <div class="loading" id="loading">
            <p>Fazendo login...</p>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loginBtn = document.getElementById('loginBtn');
            const loading = document.getElementById('loading');
            const errorMessage = document.getElementById('errorMessage');
            
            loginBtn.disabled = true;
            loading.classList.add('show');
            errorMessage.textContent = '';
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: document.getElementById('username').value,
                        password: document.getElementById('password').value
                    })
                });
                
                const data = await response.json();
                
                if (data.msg === 'sucesso') {
                    localStorage.setItem('sessionId', data.sessionId);
                    localStorage.setItem('userName', data.user.name);
                    window.location.href = '/app';
                } else {
                    errorMessage.textContent = data.message || 'Erro no login';
                }
            } catch (error) {
                errorMessage.textContent = 'Erro de conexão';
            } finally {
                loginBtn.disabled = false;
                loading.classList.remove('show');
            }
        });
    </script>
</body>
</html>`;

// Criar servidor HTTP
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Lidar com preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        // Rota de login
        if (path === '/' && method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(loginHtml);
            return;
        }

        // API de login
        if (path === '/api/login' && method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const { username, password } = JSON.parse(body);
                    
                    if (username === SERVER_CONFIG.LOGIN_CREDENTIALS.username && 
                        password === SERVER_CONFIG.LOGIN_CREDENTIALS.password) {
                        
                        const userData = {
                            name: 'Alex Berneira FEM',
                            username: username,
                            fiscalId: 31
                        };
                        
                        const sessionId = SessionMiddleware.createSession(userData);
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            msg: 'sucesso',
                            sessionId: sessionId,
                            user: userData
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            msg: 'erro',
                            message: 'Credenciais inválidas'
                        }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        msg: 'erro',
                        message: 'Dados inválidos'
                    }));
                }
            });
            return;
        }

        // Rotas da API que requerem autenticação
        if (path.startsWith('/api/') && path !== '/api/login') {
            // Verificar autenticação
            const sessionId = req.headers.authorization;
            if (!SessionMiddleware.verifySession(sessionId)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    msg: 'erro',
                    message: 'Sessão inválida ou expirada'
                }));
                return;
            }

            // Roteamento da API
            switch (path) {
                case '/api/config-termo':
                    await apiRoutes.configTermo(req, res);
                    break;
                case '/api/rts-historico':
                    await apiRoutes.rtsHistorico(req, res);
                    break;
                case '/api/tipos-inspecao':
                    await apiRoutes.tiposInspecao(req, res);
                    break;
                case '/api/inspecoes-historico':
                    await apiRoutes.inspecoesHistorico(req, res);
                    break;
                case '/api/protocolos':
                    await apiRoutes.protocolos(req, res);
                    break;
                case '/api/afastamentos':
                    await apiRoutes.afastamentos(req, res);
                    break;
                case '/api/denuncias':
                    await apiRoutes.denuncias(req, res);
                    break;
                case '/api/outros-profissionais':
                    await apiRoutes.outrosProfissionais(req, res);
                    break;
                case '/api/outros-vinculos':
                    await apiRoutes.outrosVinculos(req, res);
                    break;
                case '/api/processos-eticos':
                    await apiRoutes.processosEticos(req, res);
                    break;
                case '/api/metas':
                    await apiRoutes.metas(req, res);
                    break;
                case '/api/session':
                    apiRoutes.session(req, res);
                    break;
                default:
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        msg: 'erro',
                        message: 'Endpoint não encontrado'
                    }));
            }
            return;
        }

        // Páginas que requerem autenticação
        if (path === '/app' || path === '/empresas') {
            const sessionId = req.headers.authorization;
            if (!SessionMiddleware.verifySession(sessionId)) {
                res.writeHead(302, { 'Location': '/' });
                res.end();
                return;
            }
            
            // Aqui você pode servir as páginas HTML
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>Página em construção</h1>');
            return;
        }

        // Rota não encontrada
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Página não encontrada');

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro interno do servidor');
    }
});

// Iniciar servidor
server.listen(SERVER_CONFIG.PORT, () => {
    console.log('🚀 Servidor FEM App iniciado!');
    console.log('📱 Tela de login disponível em:');
    console.log(`   http://localhost:${SERVER_CONFIG.PORT}`);
    console.log('📋 Para parar o servidor, pressione Ctrl+C');
});

// Limpeza periódica de sessões expiradas
setInterval(() => {
    SessionMiddleware.cleanupExpiredSessions();
}, 5 * 60 * 1000); // A cada 5 minutos 