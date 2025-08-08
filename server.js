const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8081;

// Gerenciamento de sessões
const sessions = new Map();

// Funções de criptografia para testar diferentes formatos
function hashPassword(password, algorithm = 'sha1') {
    switch(algorithm) {
        case 'md5':
            return crypto.createHash('md5').update(password).digest('hex');
        case 'sha1':
            return crypto.createHash('sha1').update(password).digest('hex');
        case 'sha1_upper':
            return crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
        case 'sha1_base64':
            return crypto.createHash('sha1').update(password).digest('base64');
        case 'sha256':
            return crypto.createHash('sha256').update(password).digest('hex');
        default:
            return password; // texto plano
    }
}

// Gerar ID de sessão
function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

const htmlContent = `<!DOCTYPE html>
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
            border-top: 4px solid #3CB3A7;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .title {
            font-size: 32px;
            font-weight: bold;
            color: #2C4B8C;
            margin-bottom: 8px;
        }

        .subtitle {
            font-size: 16px;
            color: #666;
        }

        .form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .input-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .label {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }

        .input {
            padding: 12px 16px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            background: white;
        }

        .input:focus {
            outline: none;
            border-color: #3CB3A7;
        }

        .login-button {
            background: linear-gradient(135deg, #3CB3A7 0%, #5F8C82 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 16px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .login-button:hover {
            background: linear-gradient(135deg, #5F8C82 0%, #3CB3A7 100%);
        }

        .login-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 16px;
            display: none;
        }

        .alert.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .alert.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span style="font-size: 48px; color: #2C4B8C;">🏥</span>
            </div>
            <h1 class="title">FEM App</h1>
            <p class="subtitle">Fiscalização Eletrônica Móvel</p>
            <p class="subtitle" style="font-size: 12px; color: #3CB3A7; margin-top: 8px;">CRFRS</p>
        </div>

        <form class="form" id="loginForm">
            <div class="input-container">
                <label for="email" class="label">Email</label>
                <input type="email" id="email" class="input" placeholder="Seu email" required>
            </div>

            <div class="input-container">
                <label for="password" class="label">Senha</label>
                <input type="password" id="password" class="input" placeholder="Sua senha" required>
            </div>

            <button type="submit" class="login-button" id="loginButton">Entrar</button>

            <div id="alert" class="alert"></div>
        </form>
    </div>

    <script>
        const form = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('loginButton');
        const alertDiv = document.getElementById('alert');

        function showAlert(message, type) {
            alertDiv.textContent = message;
            alertDiv.className = 'alert ' + type;
            alertDiv.style.display = 'block';
        }

        function hideAlert() {
            alertDiv.style.display = 'none';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                showAlert('Por favor, preencha todos os campos', 'error');
                return;
            }

            // Simular loading
            loginButton.textContent = 'Entrando...';
            loginButton.disabled = true;

            // Conectar com API real do CRF
            setTimeout(async () => {
                try {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: email,
                            password: password,
                        }),
                    });

                    const data = await response.json();
                    
                    if (data.msg === 'sucesso' && data.nome) {
                        showAlert('Login realizado com sucesso! Bem-vindo, ' + data.nome + '!', 'success');
                        
                        // Salvar sessionId no localStorage
                        if (data.sessionId) {
                            localStorage.setItem('sessionId', data.sessionId);
                        }
                        
                        // Limpar campos
                        emailInput.value = '';
                        passwordInput.value = '';
                        
                        // Manter botão desabilitado e redirecionar após 2 segundos
                        setTimeout(() => {
                            window.location.href = '/app';
                        }, 2000);
                    } else {
                        // Reativar botão apenas em caso de erro
                        loginButton.textContent = 'Entrar';
                        loginButton.disabled = false;
                        showAlert('Credenciais inválidas ou usuário não autorizado.', 'error');
                    }
                } catch (error) {
                    // Reativar botão apenas em caso de erro
                    loginButton.textContent = 'Entrar';
                    loginButton.disabled = false;
                    showAlert('Erro de conexão com a API do CRF. Tente novamente.', 'error');
                }
                
                // Esconder alerta após 3 segundos
                setTimeout(hideAlert, 3000);
            }, 2000);
        });
    </script>
</body>
</html>`;

// Página de listar empresas
const empresasHtmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FEM App - Listar Empresas</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }

        .header {
            background: linear-gradient(135deg, #3CB3A7 0%, #5F8C82 100%);
            color: white;
            padding: 8px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 18px;
            font-weight: bold;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .user-name {
            font-weight: 600;
            font-size: 14px;
        }

        .back-btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            text-decoration: none;
        }

        .back-btn:hover {
            background: rgba(255,255,255,0.3);
        }

        .main-content {
            max-width: 1200px;
            margin: 15px auto;
            padding: 0 20px;
        }

        .page-header {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            text-align: center;
        }

        .page-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 8px;
        }

        .page-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
        }

        .stats-bar {
            display: flex;
            justify-content: space-around;
            margin-top: 15px;
        }

        .stat-item {
            text-align: center;
        }

        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #2C4B8C;
        }

        .stat-label {
            font-size: 12px;
            color: #666;
        }

        .empresas-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .empresa-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid #2C4B8C;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .empresa-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(44, 75, 140, 0.2);
        }

        .empresa-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .empresa-inscricao {
            font-weight: bold;
            color: #333;
            font-size: 16px;
        }

        .empresa-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-pendente {
            background: #fff3cd;
            color: #856404;
        }

        .status-realizada {
            background: #d4edda;
            color: #155724;
        }

        .empresa-razao {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .empresa-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
            font-size: 12px;
            color: #666;
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .detail-icon {
            font-size: 14px;
        }

        .no-empresas {
            text-align: center;
            padding: 40px;
            color: #666;
        }

        .no-empresas-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }

        .loading-icon {
            font-size: 24px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">FEM App</div>
            <div class="user-info">
                <span class="user-name" id="userName">Carregando...</span>
                <a href="/app" class="back-btn">← Voltar</a>
            </div>
        </div>
    </div>

    <div class="main-content">
        <div class="page-header">
            <h1 class="page-title">📋 Lista de Empresas</h1>
            <p class="page-subtitle">Empresas pendentes de fiscalização</p>
            
            <div class="stats-bar">
                <div class="stat-item">
                    <div class="stat-number" id="totalEmpresas">0</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="empresasPendentes">0</div>
                    <div class="stat-label">Pendentes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="empresasRealizadas">0</div>
                    <div class="stat-label">Realizadas</div>
                </div>
            </div>
        </div>

        <div class="empresas-container">
            <div id="empresasList" class="loading">
                <div class="loading-icon">🔄</div>
                <p>Carregando empresas...</p>
            </div>
        </div>
    </div>

    <script>
        // Verificar sessão ao carregar a página
        window.onload = function() {
            checkSession();
        };

        function checkSession() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                window.location.href = '/';
                return;
            }

            // Buscar dados da sessão
            fetch('/api/session', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('userName').textContent = data.user.nome;
                    carregarEmpresas();
                } else {
                    localStorage.removeItem('sessionId');
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Erro ao verificar sessão:', error);
                localStorage.removeItem('sessionId');
                window.location.href = '/';
            });
        }

        function carregarEmpresas() {
            const empresasData = localStorage.getItem('empresas');
            
            if (!empresasData) {
                mostrarSemEmpresas();
                return;
            }

            try {
                const empresas = JSON.parse(empresasData);
                const empresasAtivas = empresas.filter(empresa => empresa.ativo);
                
                if (empresasAtivas.length === 0) {
                    mostrarSemEmpresas();
                    return;
                }

                // Atualizar estatísticas
                const pendentes = empresasAtivas.filter(empresa => empresa.status === 0).length;
                const realizadas = empresasAtivas.filter(empresa => empresa.status === 1).length;
                const total = empresasAtivas.length;

                document.getElementById('totalEmpresas').textContent = total;
                document.getElementById('empresasPendentes').textContent = pendentes;
                document.getElementById('empresasRealizadas').textContent = realizadas;

                // Renderizar lista de empresas
                renderizarEmpresas(empresasAtivas);
            } catch (error) {
                console.error('Erro ao carregar empresas:', error);
                mostrarSemEmpresas();
            }
        }

        function renderizarEmpresas(empresas) {
            const container = document.getElementById('empresasList');
            
            if (empresas.length === 0) {
                container.innerHTML = '<div class="no-empresas"><div class="no-empresas-icon">📋</div><p>Nenhuma empresa encontrada</p></div>';
                return;
            }

            let html = '';
            
            empresas.forEach(empresa => {
                const statusClass = empresa.status === 0 ? 'status-pendente' : 'status-realizada';
                const statusText = empresa.status === 0 ? 'PENDENTE' : 'REALIZADA';
                
                html += \`
                    <div class="empresa-item">
                        <div class="empresa-header">
                            <div class="empresa-inscricao">\${empresa.nome || 'N/A'}</div>
                            <div class="empresa-status \${statusClass}">\${statusText}</div>
                        </div>
                        <div class="empresa-razao">\${empresa.razao || 'Razão social não informada'}</div>
                        <div class="empresa-details">
                            <div class="detail-item">
                                <span class="detail-icon">📍</span>
                                <span>\${empresa.endereco || 'Endereço não informado'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">📞</span>
                                <span>\${empresa.telefone || 'Telefone não informado'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">📧</span>
                                <span>\${empresa.email || 'Email não informado'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">🔍</span>
                                <span>\${empresa.tipoInspecao || 'Tipo não informado'}</span>
                            </div>
                        </div>
                    </div>
                \`;
            });

            container.innerHTML = html;
        }

        function mostrarSemEmpresas() {
            document.getElementById('totalEmpresas').textContent = '0';
            document.getElementById('empresasPendentes').textContent = '0';
            document.getElementById('empresasRealizadas').textContent = '0';

            const container = document.getElementById('empresasList');
            container.innerHTML = \`
                <div class="no-empresas">
                    <div class="no-empresas-icon">📋</div>
                    <p>Nenhuma empresa encontrada no banco de dados local</p>
                    <p style="font-size: 12px; margin-top: 10px; color: #999;">
                        Sincronize os dados no dashboard principal para carregar as empresas
                    </p>
                </div>
            \`;
        }
    </script>
</body>
</html>`;

// Página inicial do app
const appHtmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FEM App - Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }

        .header {
            background: linear-gradient(135deg, #3CB3A7 0%, #5F8C82 100%);
            color: white;
            padding: 8px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 18px;
            font-weight: bold;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .user-name {
            font-weight: 600;
            font-size: 14px;
        }

        .logout-btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        }

        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }

        .main-content {
            max-width: 1200px;
            margin: 15px auto;
            padding: 0 20px;
        }

        .welcome-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            text-align: center;
        }

        .welcome-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 8px;
        }

        .welcome-name {
            font-size: 18px;
            color: #2C4B8C;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .welcome-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }

        .stat-card {
            background: white;
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 1px 5px rgba(0,0,0,0.1);
            text-align: center;
        }

        .stat-icon {
            font-size: 14px;
            margin-bottom: 3px;
        }

        .stat-number {
            font-size: 18px;
            font-weight: bold;
            color: #2C4B8C;
            margin-bottom: 2px;
        }

        .stat-label {
            font-size: 10px;
            color: #666;
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }

        .modal-content {
            background-color: white;
            margin: 2% auto;
            padding: 0;
            border-radius: 12px;
            width: 95%;
            max-width: 1200px;
            height: 96vh;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .modal-header {
            background: #3CB3A7;
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 18px;
        }

        .close {
            color: white;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            line-height: 1;
        }

        .close:hover {
            opacity: 0.7;
        }

        .modal-body {
            padding: 20px;
            height: calc(96vh - 80px);
            overflow-y: auto;
        }

        .empresa-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .empresa-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            border-left: 4px solid #2C4B8C;
        }

        .empresa-inscricao {
            font-weight: bold;
            color: #333;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .empresa-razao {
            color: #666;
            font-size: 14px;
            margin-bottom: 3px;
        }

        .empresa-endereco {
            color: #999;
            font-size: 12px;
            margin-top: 4px;
        }

        .stat-card {
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(44, 75, 140, 0.2);
        }

        .actions-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 20px;
        }

        .actions-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 8px;
            margin-bottom: 8px;
        }

        .action-card {
            background: white;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: left;
            cursor: pointer;
            transition: transform 0.2s;
            min-height: 50px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(44, 75, 140, 0.2);
        }

        .action-icon {
            font-size: 20px;
            flex-shrink: 0;
        }

        .action-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">FEM App</div>
            <div class="user-info">
                <span class="user-name" id="userName">Carregando...</span>
                <button class="logout-btn" onclick="logout()">Sair</button>
            </div>
        </div>
    </div>

    <div class="main-content">
        <div class="welcome-card">
            <h1 class="welcome-title">Bem-vindo</h1>
            <h2 class="welcome-name" id="welcomeName">Alex Berneira FEM</h2>
            <p class="welcome-subtitle">Fiscalização eletrônica móvel</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card" onclick="abrirModal('pendentes')">
                <div class="stat-icon">📋</div>
                <div class="stat-number" id="empresasPendentes">0</div>
                <div class="stat-label">Pendentes</div>
            </div>
            <div class="stat-card" onclick="abrirModal('realizadas')">
                <div class="stat-icon">✅</div>
                <div class="stat-number" id="empresasRealizadas">0</div>
                <div class="stat-label">Realizadas</div>
            </div>
            <div class="stat-card" onclick="abrirModal('total')">
                <div class="stat-icon">🏢</div>
                <div class="stat-number" id="totalEmpresas">0</div>
                <div class="stat-label">Total</div>
            </div>
        </div>

        <!-- Modal Pendentes -->
        <div id="modalPendentes" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📋 Empresas Pendentes</h2>
                    <span class="close" onclick="fecharModal('pendentes')">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="listaPendentes" class="empresa-list">
                        <!-- Lista será preenchida via JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Realizadas -->
        <div id="modalRealizadas" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>✅ Empresas Realizadas</h2>
                    <span class="close" onclick="fecharModal('realizadas')">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="listaRealizadas" class="empresa-list">
                        <!-- Lista será preenchida via JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Total -->
        <div id="modalTotal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🏢 Todas as Empresas</h2>
                    <span class="close" onclick="fecharModal('total')">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="listaTotal" class="empresa-list">
                        <!-- Lista será preenchida via JavaScript -->
                    </div>
                </div>
            </div>
        </div>

                    <div class="actions-grid">
                <!-- Linha 1: Baixar Tudo -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarTudo()">
                        <div class="action-icon">🚀</div>
                        <div class="action-title">Baixar Tudo</div>
                    </div>
                </div>

                <!-- Linha 2: Listar Empresas -->
                <div class="actions-row">
                    <div class="action-card" onclick="window.location.href='/empresas'">
                        <div class="action-icon">📋</div>
                        <div class="action-title">Listar Empresas</div>
                    </div>
                </div>

                <!-- Linha 3: Sincronização e Visualização -->
                <div class="actions-row">
                    <div class="action-card" onclick="sincronizarDados()">
                        <div class="action-icon">🔄</div>
                        <div class="action-title">Sincronizar</div>
                    </div>
                    <div class="action-card" onclick="visualizarEmpresasLocais()" style="background-color: #ff6b6b;">
                        <div class="action-icon">👁️</div>
                        <div class="action-title">Ver Empresas</div>
                    </div>
                </div>

                <!-- Linha 4: Configuração do Termo -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarConfigTermo()">
                        <div class="action-icon">📋</div>
                        <div class="action-title">Baixar Configuração</div>
                    </div>
                    <div class="action-card" onclick="visualizarConfigTermo()" style="background-color: #4ecdc4;">
                        <div class="action-icon">📋</div>
                        <div class="action-title">Ver Configuração</div>
                    </div>
                </div>

                <!-- Linha 5: Histórico de RTS -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarRtsHistorico()">
                        <div class="action-icon">👥</div>
                        <div class="action-title">Baixar RTS</div>
                    </div>
                    <div class="action-card" onclick="visualizarRtsHistorico()" style="background-color: #ffa726;">
                        <div class="action-icon">👥</div>
                        <div class="action-title">Ver RTS</div>
                    </div>
                </div>

                <!-- Linha 6: Tipos de Inspeção -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarTiposInspecao()">
                        <div class="action-icon">🔍</div>
                        <div class="action-title">Baixar Tipos</div>
                    </div>
                    <div class="action-card" onclick="visualizarTiposInspecao()" style="background-color: #9c27b0;">
                        <div class="action-icon">🔍</div>
                        <div class="action-title">Ver Tipos</div>
                    </div>
                </div>

                <!-- Linha 7: Histórico de Inspeções -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarInspecoesHistorico()">
                        <div class="action-icon">📊</div>
                        <div class="action-title">Baixar Inspeções</div>
                    </div>
                    <div class="action-card" onclick="visualizarInspecoesHistorico()" style="background-color: #e91e63;">
                        <div class="action-icon">📊</div>
                        <div class="action-title">Ver Inspeções</div>
                    </div>
                </div>

                <!-- Linha 8: Protocolos -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarProtocolos()">
                        <div class="action-icon">📄</div>
                        <div class="action-title">Baixar Protocolos</div>
                    </div>
                    <div class="action-card" onclick="visualizarProtocolos()" style="background-color: #795548;">
                        <div class="action-icon">📄</div>
                        <div class="action-title">Ver Protocolos</div>
                    </div>
                </div>

                <!-- Linha 9: Afastamentos -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarAfastamentos()">
                        <div class="action-icon">🏥</div>
                        <div class="action-title">Baixar Afastamentos</div>
                    </div>
                    <div class="action-card" onclick="visualizarAfastamentos()" style="background-color: #607d8b;">
                        <div class="action-icon">🏥</div>
                        <div class="action-title">Ver Afastamentos</div>
                    </div>
                </div>

                <!-- Linha 10: Denúncias -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarDenuncias()">
                        <div class="action-icon">🚨</div>
                        <div class="action-title">Baixar Denúncias</div>
                    </div>
                    <div class="action-card" onclick="visualizarDenuncias()" style="background-color: #f44336;">
                        <div class="action-icon">🚨</div>
                        <div class="action-title">Ver Denúncias</div>
                    </div>
                </div>

                <!-- Linha 11: Outros Profissionais -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarOutrosProfissionais()">
                        <div class="action-icon">👨‍⚕️</div>
                        <div class="action-title">Baixar Outros Profissionais</div>
                    </div>
                    <div class="action-card" onclick="visualizarOutrosProfissionais()" style="background-color: #2196f3;">
                        <div class="action-icon">👨‍⚕️</div>
                        <div class="action-title">Ver Outros Profissionais</div>
                    </div>
                </div>

                <!-- Linha 12: Outros Vínculos -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarOutrosVinculos()">
                        <div class="action-icon">🔗</div>
                        <div class="action-title">Baixar Outros Vínculos</div>
                    </div>
                    <div class="action-card" onclick="visualizarOutrosVinculos()" style="background-color: #ff9800;">
                        <div class="action-icon">🔗</div>
                        <div class="action-title">Ver Outros Vínculos</div>
                    </div>
                </div>

                <!-- Linha 13: Processos Éticos -->
                <div class="actions-row">
                    <div class="action-card" onclick="baixarProcessosEticos()">
                        <div class="action-icon">⚖️</div>
                        <div class="action-title">Baixar Processos Éticos</div>
                    </div>
                    <div class="action-card" onclick="visualizarProcessosEticos()" style="background-color: #673ab7;">
                        <div class="action-icon">⚖️</div>
                        <div class="action-title">Ver Processos Éticos</div>
                    </div>
                </div>
            </div>
    </div>

    <script>
        // Verificar sessão ao carregar a página
        window.onload = function() {
            checkSession();
        };

        function checkSession() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                window.location.href = '/';
                return;
            }

            // Buscar dados da sessão
            fetch('/api/session', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('userName').textContent = data.user.nome;
                    document.getElementById('welcomeName').textContent = data.user.nome;
                    
                    // Verificar dados locais
                    verificarDadosLocais();
                    
                    // Verificar configuração do termo
                    verificarConfigTermo();
                    
                    // Verificar histórico de RTS
                    verificarRtsHistorico();
                    
                    // Verificar tipos de inspeção
                    verificarTiposInspecao();
                    
                    // Verificar histórico de inspeções
                    verificarInspecoesHistorico();
                    
                    // Verificar protocolos
                    verificarProtocolos();
                    
                    // Verificar afastamentos
                    verificarAfastamentos();
                    
                    // Verificar denúncias
                    verificarDenuncias();
                    
                    // Verificar outros profissionais
                    verificarOutrosProfissionais();
                    
                    // Verificar outros vínculos
                    verificarOutrosVinculos();
                    
                    // Verificar processos éticos
                    verificarProcessosEticos();
                } else {
                    localStorage.removeItem('sessionId');
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Erro ao verificar sessão:', error);
                localStorage.removeItem('sessionId');
                window.location.href = '/';
            });
        }

        function sincronizarDados() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const syncButton = event.target.closest('.action-card');
            const originalContent = syncButton.innerHTML;
            syncButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Sincronizando...</div><div class="action-description">Buscando empresas...</div>';
            syncButton.style.opacity = '0.7';
            syncButton.style.cursor = 'not-allowed';

            // Buscar dados atualizados
            fetch('/api/metas', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Processar e salvar empresas localmente
                    const empresas = processarEmpresas(data);
                    
                    console.log('🔄 Sincronização: Carregadas', empresas.length, 'empresas pendentes');
                    console.log('💾 Armazenamento: Empresas salvas localmente');
                    
                    // Atualizar estatísticas
                    atualizarEstatisticas(empresas);
                    
                    // Atualizar descrição com nova data
                    atualizarDescricaoSync(Date.now());
                    
                    // Mostrar sucesso
                    syncButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Sincronizado!</div><div class="action-description">' + empresas.length + ' empresas salvas</div>';
                    syncButton.style.background = '#d4edda';
                    syncButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        syncButton.innerHTML = originalContent;
                        syncButton.style.opacity = '1';
                        syncButton.style.cursor = 'pointer';
                        syncButton.style.background = '';
                        syncButton.style.color = '';
                        // Atualizar descrição com data da sincronização
                        atualizarDescricaoSync(Date.now());
                    }, 3000);
                } else {
                    console.log('🔄 Sincronização: Nenhuma empresa encontrada');
                    
                    // Desativar todas as empresas locais
                    const empresasLocais = getEmpresasLocais();
                    if (empresasLocais && empresasLocais.length > 0) {
                        const empresasDesativadas = empresasLocais.map(empresa => ({
                            ...empresa,
                            ativa: false
                        }));
                        
                        localStorage.setItem('empresas', JSON.stringify(empresasDesativadas));
                        localStorage.setItem('empresas_timestamp', Date.now().toString());
                        
                        console.log('🔄 Sincronização: Todas as empresas foram desativadas');
                        
                        // Atualizar estatísticas com empresas desativadas
                        atualizarEstatisticas(empresasDesativadas);
                        
                        // Mostrar mensagem de empresas desativadas
                        syncButton.innerHTML = '<div class="action-icon">⚠️</div><div class="action-title">Empresas Desativadas</div><div class="action-description">Todas as empresas foram desativadas</div>';
                    } else {
                        // Limpar dados locais se não há empresas
                        localStorage.removeItem('empresas');
                        localStorage.removeItem('empresas_timestamp');
                        
                        // Mostrar mensagem de nenhum dado
                        syncButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div><div class="action-description">Nenhuma empresa pendente</div>';
                    }
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        syncButton.innerHTML = originalContent;
                        syncButton.style.opacity = '1';
                        syncButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro na sincronização:', error);
                
                // Mostrar erro
                syncButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div><div class="action-description">Falha na sincronização</div>';
                syncButton.style.background = '#f8d7da';
                syncButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    syncButton.innerHTML = originalContent;
                    syncButton.style.opacity = '1';
                    syncButton.style.cursor = 'pointer';
                    syncButton.style.background = '';
                    syncButton.style.color = '';
                }, 3000);
            });
        }

        function baixarConfigTermo() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const configButton = event.target.closest('.action-card');
            const originalContent = configButton.innerHTML;
            configButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div><div class="action-description">Configuração do termo...</div>';
            configButton.style.opacity = '0.7';
            configButton.style.cursor = 'not-allowed';

            // Buscar configuração do termo
            fetch('/api/config-termo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar configuração localmente
                    localStorage.setItem('config_termo', JSON.stringify(data));
                    localStorage.setItem('config_termo_timestamp', Date.now().toString());
                    
                    console.log('📋 CONFIG-TERMO: Configuração salva localmente');
                    console.log('💾 Armazenamento: Configuração do termo salva');
                    
                    // Mostrar sucesso
                    configButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div><div class="action-description">Configuração salva</div>';
                    configButton.style.background = '#d4edda';
                    configButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        configButton.innerHTML = originalContent;
                        configButton.style.opacity = '1';
                        configButton.style.cursor = 'pointer';
                        configButton.style.background = '';
                        configButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 CONFIG-TERMO: Nenhuma configuração encontrada');
                    
                    // Mostrar mensagem de nenhum dado
                    configButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div><div class="action-description">Configuração não encontrada</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        configButton.innerHTML = originalContent;
                        configButton.style.opacity = '1';
                        configButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar configuração:', error);
                
                // Mostrar erro
                configButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div><div class="action-description">Falha no download</div>';
                configButton.style.background = '#f8d7da';
                configButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    configButton.innerHTML = originalContent;
                    configButton.style.opacity = '1';
                    configButton.style.cursor = 'pointer';
                    configButton.style.background = '';
                    configButton.style.color = '';
                }, 3000);
            });
        }

        function baixarRtsHistorico() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const rtsButton = event.target.closest('.action-card');
            const originalContent = rtsButton.innerHTML;
            rtsButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div><div class="action-description">Histórico de RTS...</div>';
            rtsButton.style.opacity = '0.7';
            rtsButton.style.cursor = 'not-allowed';

            // Buscar histórico de RTS
            fetch('/api/rts-historico', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar histórico localmente
                    localStorage.setItem('rts_historico', JSON.stringify(data));
                    localStorage.setItem('rts_historico_timestamp', Date.now().toString());
                    
                    console.log('📋 RTS-HISTORICO: Histórico salvo localmente');
                    console.log('💾 Armazenamento: Histórico de RTS salvo');
                    
                    // Mostrar sucesso
                    rtsButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div><div class="action-description">Histórico salvo</div>';
                    rtsButton.style.background = '#d4edda';
                    rtsButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        rtsButton.innerHTML = originalContent;
                        rtsButton.style.opacity = '1';
                        rtsButton.style.cursor = 'pointer';
                        rtsButton.style.background = '';
                        rtsButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 RTS-HISTORICO: Nenhum histórico encontrado');
                    
                    // Mostrar mensagem de nenhum dado
                    rtsButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div><div class="action-description">Histórico não encontrado</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        rtsButton.innerHTML = originalContent;
                        rtsButton.style.opacity = '1';
                        rtsButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar histórico:', error);
                
                // Mostrar erro
                rtsButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div><div class="action-description">Falha no download</div>';
                rtsButton.style.background = '#f8d7da';
                rtsButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    rtsButton.innerHTML = originalContent;
                    rtsButton.style.opacity = '1';
                    rtsButton.style.cursor = 'pointer';
                    rtsButton.style.background = '';
                    rtsButton.style.color = '';
                }, 3000);
            });
        }

        function baixarTiposInspecao() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const tiposButton = event.target.closest('.action-card');
            const originalContent = tiposButton.innerHTML;
            tiposButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div><div class="action-description">Tipos de inspeção...</div>';
            tiposButton.style.opacity = '0.7';
            tiposButton.style.cursor = 'not-allowed';

            // Buscar tipos de inspeção
            fetch('/api/tipos-inspecao', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar tipos localmente
                    localStorage.setItem('tipos_inspecao', JSON.stringify(data));
                    localStorage.setItem('tipos_inspecao_timestamp', Date.now().toString());
                    
                    console.log('📋 TIPOS-INSPECAO: Tipos salvos localmente');
                    console.log('💾 Armazenamento: Tipos de inspeção salvos');
                    
                    // Mostrar sucesso
                    tiposButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div><div class="action-description">Tipos salvos</div>';
                    tiposButton.style.background = '#d4edda';
                    tiposButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        tiposButton.innerHTML = originalContent;
                        tiposButton.style.opacity = '1';
                        tiposButton.style.cursor = 'pointer';
                        tiposButton.style.background = '';
                        tiposButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 TIPOS-INSPECAO: Nenhum tipo encontrado');
                    
                    // Mostrar mensagem de nenhum dado
                    tiposButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div><div class="action-description">Tipos não encontrados</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        tiposButton.innerHTML = originalContent;
                        tiposButton.style.opacity = '1';
                        tiposButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar tipos:', error);
                
                // Mostrar erro
                tiposButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div><div class="action-description">Falha no download</div>';
                tiposButton.style.background = '#f8d7da';
                tiposButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    tiposButton.innerHTML = originalContent;
                    tiposButton.style.opacity = '1';
                    tiposButton.style.cursor = 'pointer';
                    tiposButton.style.background = '';
                    tiposButton.style.color = '';
                }, 3000);
            });
        }

        function baixarInspecoesHistorico() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const inspecoesButton = event.target.closest('.action-card');
            const originalContent = inspecoesButton.innerHTML;
            inspecoesButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div><div class="action-description">Histórico de inspeções...</div>';
            inspecoesButton.style.opacity = '0.7';
            inspecoesButton.style.cursor = 'not-allowed';

            // Buscar histórico de inspeções
            fetch('/api/inspecoes-historico', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar histórico localmente
                    localStorage.setItem('inspecoes_historico', JSON.stringify(data));
                    localStorage.setItem('inspecoes_historico_timestamp', Date.now().toString());
                    
                    console.log('📋 INSPECOES-HISTORICO: Histórico salvo localmente');
                    console.log('💾 Armazenamento: Histórico de inspeções salvo');
                    
                    // Mostrar sucesso
                    inspecoesButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div><div class="action-description">Histórico salvo</div>';
                    inspecoesButton.style.background = '#d4edda';
                    inspecoesButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        inspecoesButton.innerHTML = originalContent;
                        inspecoesButton.style.opacity = '1';
                        inspecoesButton.style.cursor = 'pointer';
                        inspecoesButton.style.background = '';
                        inspecoesButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 INSPECOES-HISTORICO: Nenhum histórico encontrado');
                    
                    // Mostrar mensagem de nenhum dado
                    inspecoesButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div><div class="action-description">Histórico não encontrado</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        inspecoesButton.innerHTML = originalContent;
                        inspecoesButton.style.opacity = '1';
                        inspecoesButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar histórico:', error);
                
                // Mostrar erro
                inspecoesButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div><div class="action-description">Falha no download</div>';
                inspecoesButton.style.background = '#f8d7da';
                inspecoesButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    inspecoesButton.innerHTML = originalContent;
                    inspecoesButton.style.opacity = '1';
                    inspecoesButton.style.cursor = 'pointer';
                    inspecoesButton.style.background = '';
                    inspecoesButton.style.color = '';
                }, 3000);
            });
        }

        function baixarProtocolos() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const protocolosButton = event.target.closest('.action-card');
            const originalContent = protocolosButton.innerHTML;
            protocolosButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div><div class="action-description">Protocolos...</div>';
            protocolosButton.style.opacity = '0.7';
            protocolosButton.style.cursor = 'not-allowed';

            // Buscar protocolos
            fetch('/api/protocolos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar protocolos localmente
                    localStorage.setItem('protocolos', JSON.stringify(data));
                    localStorage.setItem('protocolos_timestamp', Date.now().toString());
                    
                    console.log('📋 PROTOCOLOS: Protocolos salvos localmente');
                    console.log('💾 Armazenamento: Protocolos salvos');
                    
                    // Mostrar sucesso
                    protocolosButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div><div class="action-description">Protocolos salvos</div>';
                    protocolosButton.style.background = '#d4edda';
                    protocolosButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        protocolosButton.innerHTML = originalContent;
                        protocolosButton.style.opacity = '1';
                        protocolosButton.style.cursor = 'pointer';
                        protocolosButton.style.background = '';
                        protocolosButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 PROTOCOLOS: Nenhum protocolo encontrado');
                    
                    // Mostrar mensagem de nenhum dado
                    protocolosButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div><div class="action-description">Protocolos não encontrados</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        protocolosButton.innerHTML = originalContent;
                        protocolosButton.style.opacity = '1';
                        protocolosButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar protocolos:', error);
                
                // Mostrar erro
                protocolosButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div><div class="action-description">Falha no download</div>';
                protocolosButton.style.background = '#f8d7da';
                protocolosButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    protocolosButton.innerHTML = originalContent;
                    protocolosButton.style.opacity = '1';
                    protocolosButton.style.cursor = 'pointer';
                    protocolosButton.style.background = '';
                    protocolosButton.style.color = '';
                }, 3000);
            });
        }

        function baixarAfastamentos() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const afastamentosButton = event.target.closest('.action-card');
            const originalContent = afastamentosButton.innerHTML;
            afastamentosButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div><div class="action-description">Afastamentos...</div>';
            afastamentosButton.style.opacity = '0.7';
            afastamentosButton.style.cursor = 'not-allowed';

            // Buscar afastamentos
            fetch('/api/afastamentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar afastamentos localmente
                    localStorage.setItem('afastamentos', JSON.stringify(data));
                    localStorage.setItem('afastamentos_timestamp', Date.now().toString());
                    
                    console.log('📋 AFASTAMENTOS: Afastamentos salvos localmente');
                    console.log('💾 Armazenamento: Afastamentos salvos');
                    
                    // Mostrar sucesso
                    afastamentosButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div><div class="action-description">Afastamentos salvos</div>';
                    afastamentosButton.style.background = '#d4edda';
                    afastamentosButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        afastamentosButton.innerHTML = originalContent;
                        afastamentosButton.style.opacity = '1';
                        afastamentosButton.style.cursor = 'pointer';
                        afastamentosButton.style.background = '';
                        afastamentosButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 AFASTAMENTOS: Nenhum afastamento encontrado');
                    
                    // Mostrar mensagem de nenhum dado
                    afastamentosButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div><div class="action-description">Afastamentos não encontrados</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        afastamentosButton.innerHTML = originalContent;
                        afastamentosButton.style.opacity = '1';
                        afastamentosButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar afastamentos:', error);
                
                // Mostrar erro
                afastamentosButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div><div class="action-description">Falha no download</div>';
                afastamentosButton.style.background = '#f8d7da';
                afastamentosButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    afastamentosButton.innerHTML = originalContent;
                    afastamentosButton.style.opacity = '1';
                    afastamentosButton.style.cursor = 'pointer';
                    afastamentosButton.style.background = '';
                    afastamentosButton.style.color = '';
                }, 3000);
            });
        }

        function baixarDenuncias() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const denunciasButton = event.target.closest('.action-card');
            const originalContent = denunciasButton.innerHTML;
            denunciasButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div>';
            denunciasButton.style.opacity = '0.7';
            denunciasButton.style.cursor = 'not-allowed';

            // Buscar denúncias
            fetch('/api/denuncias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar denúncias localmente
                    localStorage.setItem('denuncias', JSON.stringify(data));
                    localStorage.setItem('denuncias_timestamp', Date.now().toString());
                    
                    console.log('📋 DENUNCIAS: Denúncias salvos localmente');
                    console.log('💾 Armazenamento: Denúncias salvos');
                    
                    // Mostrar sucesso
                    denunciasButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div>';
                    denunciasButton.style.background = '#d4edda';
                    denunciasButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        denunciasButton.innerHTML = originalContent;
                        denunciasButton.style.opacity = '1';
                        denunciasButton.style.cursor = 'pointer';
                        denunciasButton.style.background = '';
                        denunciasButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 DENUNCIAS: Nenhuma denúncia encontrada');
                    
                    // Mostrar mensagem de nenhum dado
                    denunciasButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        denunciasButton.innerHTML = originalContent;
                        denunciasButton.style.opacity = '1';
                        denunciasButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar denúncias:', error);
                
                // Mostrar erro
                denunciasButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div>';
                denunciasButton.style.background = '#f8d7da';
                denunciasButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    denunciasButton.innerHTML = originalContent;
                    denunciasButton.style.opacity = '1';
                    denunciasButton.style.cursor = 'pointer';
                    denunciasButton.style.background = '';
                    denunciasButton.style.color = '';
                }, 3000);
            });
        }

        function baixarOutrosProfissionais() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const outrosProfissionaisButton = event.target.closest('.action-card');
            const originalContent = outrosProfissionaisButton.innerHTML;
            outrosProfissionaisButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div>';
            outrosProfissionaisButton.style.opacity = '0.7';
            outrosProfissionaisButton.style.cursor = 'not-allowed';

            // Buscar outros profissionais
            fetch('/api/outros-profissionais', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar outros profissionais localmente
                    localStorage.setItem('outros_profissionais', JSON.stringify(data));
                    localStorage.setItem('outros_profissionais_timestamp', Date.now().toString());
                    
                    console.log('📋 OUTROS-PROFISSIONAIS: Outros profissionais salvos localmente');
                    console.log('💾 Armazenamento: Outros profissionais salvos');
                    
                    // Mostrar sucesso
                    outrosProfissionaisButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div>';
                    outrosProfissionaisButton.style.background = '#d4edda';
                    outrosProfissionaisButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        outrosProfissionaisButton.innerHTML = originalContent;
                        outrosProfissionaisButton.style.opacity = '1';
                        outrosProfissionaisButton.style.cursor = 'pointer';
                        outrosProfissionaisButton.style.background = '';
                        outrosProfissionaisButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 OUTROS-PROFISSIONAIS: Nenhum outro profissional encontrado');
                    
                    // Mostrar mensagem de nenhum dado
                    outrosProfissionaisButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        outrosProfissionaisButton.innerHTML = originalContent;
                        outrosProfissionaisButton.style.opacity = '1';
                        outrosProfissionaisButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar outros profissionais:', error);
                
                // Mostrar erro
                outrosProfissionaisButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div>';
                outrosProfissionaisButton.style.background = '#f8d7da';
                outrosProfissionaisButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    outrosProfissionaisButton.innerHTML = originalContent;
                    outrosProfissionaisButton.style.opacity = '1';
                    outrosProfissionaisButton.style.cursor = 'pointer';
                    outrosProfissionaisButton.style.background = '';
                    outrosProfissionaisButton.style.color = '';
                }, 3000);
            });
        }

        function baixarOutrosVinculos() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const outrosVinculosButton = event.target.closest('.action-card');
            const originalContent = outrosVinculosButton.innerHTML;
            outrosVinculosButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div>';
            outrosVinculosButton.style.opacity = '0.7';
            outrosVinculosButton.style.cursor = 'not-allowed';

            // Buscar outros vínculos
            fetch('/api/outros-vinculos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar outros vínculos localmente
                    localStorage.setItem('outros_vinculos', JSON.stringify(data));
                    localStorage.setItem('outros_vinculos_timestamp', Date.now().toString());
                    
                    console.log('📋 OUTROS-VINCULOS: Outros vínculos salvos localmente');
                    console.log('💾 Armazenamento: Outros vínculos salvos');
                    
                    // Mostrar sucesso
                    outrosVinculosButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div>';
                    outrosVinculosButton.style.background = '#d4edda';
                    outrosVinculosButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        outrosVinculosButton.innerHTML = originalContent;
                        outrosVinculosButton.style.opacity = '1';
                        outrosVinculosButton.style.cursor = 'pointer';
                        outrosVinculosButton.style.background = '';
                        outrosVinculosButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 OUTROS-VINCULOS: Nenhum outro vínculo encontrado');
                    
                    // Mostrar mensagem de nenhum dado
                    outrosVinculosButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        outrosVinculosButton.innerHTML = originalContent;
                        outrosVinculosButton.style.opacity = '1';
                        outrosVinculosButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar outros vínculos:', error);
                
                // Mostrar erro
                outrosVinculosButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div>';
                outrosVinculosButton.style.background = '#f8d7da';
                outrosVinculosButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    outrosVinculosButton.innerHTML = originalContent;
                    outrosVinculosButton.style.opacity = '1';
                    outrosVinculosButton.style.cursor = 'pointer';
                    outrosVinculosButton.style.background = '';
                    outrosVinculosButton.style.color = '';
                }, 3000);
            });
        }

        function baixarProcessosEticos() {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                return;
            }

            // Mostrar loading
            const processosEticosButton = event.target.closest('.action-card');
            const originalContent = processosEticosButton.innerHTML;
            processosEticosButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando...</div>';
            processosEticosButton.style.opacity = '0.7';
            processosEticosButton.style.cursor = 'not-allowed';

            // Buscar processos éticos
            fetch('/api/processos-eticos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg === 'sucesso') {
                    // Salvar processos éticos localmente
                    localStorage.setItem('processos_eticos', JSON.stringify(data));
                    localStorage.setItem('processos_eticos_timestamp', Date.now().toString());
                    
                    console.log('📋 PROCESSOS-ETICOS: Processos éticos salvos localmente');
                    console.log('💾 Armazenamento: Processos éticos salvos');
                    
                    // Mostrar sucesso
                    processosEticosButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Baixado!</div>';
                    processosEticosButton.style.background = '#d4edda';
                    processosEticosButton.style.color = '#155724';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        processosEticosButton.innerHTML = originalContent;
                        processosEticosButton.style.opacity = '1';
                        processosEticosButton.style.cursor = 'pointer';
                        processosEticosButton.style.background = '';
                        processosEticosButton.style.color = '';
                    }, 3000);
                } else {
                    console.log('📋 PROCESSOS-ETICOS: Nenhum processo ético encontrado');
                    
                    // Mostrar mensagem de nenhum dado
                    processosEticosButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div>';
                    
                    // Restaurar após 3 segundos
                    setTimeout(() => {
                        processosEticosButton.innerHTML = originalContent;
                        processosEticosButton.style.opacity = '1';
                        processosEticosButton.style.cursor = 'pointer';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erro ao baixar processos éticos:', error);
                
                // Mostrar erro
                processosEticosButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div>';
                processosEticosButton.style.background = '#f8d7da';
                processosEticosButton.style.color = '#721c24';
                
                // Restaurar após 3 segundos
                setTimeout(() => {
                    processosEticosButton.innerHTML = originalContent;
                    processosEticosButton.style.opacity = '1';
                    processosEticosButton.style.cursor = 'pointer';
                    processosEticosButton.style.background = '';
                    processosEticosButton.style.color = '';
                }, 3000);
            });
        }



        function baixarTudo() {
            // Evitar múltiplas execuções simultâneas
            if (window.baixandoTudo) {
                console.log('⚠️ Download já em andamento...');
                return;
            }
            window.baixandoTudo = true;
            
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/';
                window.baixandoTudo = false;
                return;
            }

            // Mostrar loading
            const baixarTudoButton = event.target.closest('.action-card');
            const originalContent = baixarTudoButton.innerHTML;
            baixarTudoButton.innerHTML = '<div class="action-icon">⏳</div><div class="action-title">Baixando tudo...</div>';
            baixarTudoButton.style.opacity = '0.7';
            baixarTudoButton.style.cursor = 'not-allowed';

            console.log('INICIANDO DOWNLOAD DE TODOS OS DADOS...');



            // Array com todas as funções de download
            const downloads = [
                { name: 'Configuracao do Termo', func: baixarConfigTermo },
                { name: 'Historico de RTS', func: baixarRtsHistorico },
                { name: 'Tipos de Inspecao', func: baixarTiposInspecao },
                { name: 'Historico de Inspecoes', func: baixarInspecoesHistorico },
                { name: 'Protocolos', func: baixarProtocolos },
                { name: 'Afastamentos', func: baixarAfastamentos },
                { name: 'Denuncias', func: baixarDenuncias },
                { name: 'Outros Profissionais', func: baixarOutrosProfissionais },
                { name: 'Outros Vinculos', func: baixarOutrosVinculos },
                { name: 'Processos Eticos', func: baixarProcessosEticos },
                { name: 'Empresas (Metas)', func: null }
            ];

            let completed = 0;
            let successCount = 0;
            let errorCount = 0;

            // Função para executar downloads sequencialmente
            function executarDownload(index) {
                if (index >= downloads.length) {
                    // Todos os downloads foram concluídos
                    console.log('DOWNLOAD COMPLETO: ' + successCount + ' sucessos, ' + errorCount + ' erros');
                    
                    if (successCount > 0) {
                        baixarTudoButton.innerHTML = '<div class="action-icon">✅</div><div class="action-title">Concluído!</div>';
                        baixarTudoButton.style.background = '#d4edda';
                        baixarTudoButton.style.color = '#155724';
                    } else {
                        baixarTudoButton.innerHTML = '<div class="action-icon">❌</div><div class="action-title">Erro</div>';
                        baixarTudoButton.style.background = '#f8d7da';
                        baixarTudoButton.style.color = '#721c24';
                    }
                    
                    // Atualizar estatísticas após download completo
                    if (successCount > 0) {
                        // Buscar dados atualizados das empresas
                        const empresasData = localStorage.getItem('empresas');
                        if (empresasData) {
                            try {
                                const empresas = JSON.parse(empresasData);
                                const empresasAtivas = empresas.filter(empresa => empresa.ativo);
                                
                                // Atualizar estatísticas
                                atualizarEstatisticas(empresasAtivas);
                                
                                console.log('📊 Estatísticas atualizadas após download completo');
                            } catch (error) {
                                console.error('Erro ao atualizar estatísticas:', error);
                            }
                        }
                    }
                    
                    // Restaurar após 5 segundos
                    setTimeout(() => {
                        baixarTudoButton.innerHTML = originalContent;
                        baixarTudoButton.style.opacity = '1';
                        baixarTudoButton.style.cursor = 'pointer';
                        baixarTudoButton.style.background = '';
                        baixarTudoButton.style.color = '';
                        // Limpar flag de download
                        window.baixandoTudo = false;
                    }, 5000);
                    return;
                }

                const download = downloads[index];
                console.log('Baixando: ' + download.name + ' (' + (index + 1) + '/' + downloads.length + ')');

                // Simular a execução da função de download
                // Como não podemos chamar as funções diretamente, vamos fazer as requisições manualmente
                const endpoints = [
                    '/api/config-termo',
                    '/api/rts-historico',
                    '/api/tipos-inspecao',
                    '/api/inspecoes-historico',
                    '/api/protocolos',
                    '/api/afastamentos',
                    '/api/denuncias',
                    '/api/outros-profissionais',
                    '/api/outros-vinculos',
                    '/api/processos-eticos',
                    '/api/metas'
                ];

                const endpoint = endpoints[index];
                const storageKeys = [
                    'config_termo',
                    'rts_historico',
                    'tipos_inspecao',
                    'inspecoes_historico',
                    'protocolos',
                    'afastamentos',
                    'denuncias',
                    'outros_profissionais',
                    'outros_vinculos',
                    'processos_eticos',
                    'empresas'
                ];

                const storageKey = storageKeys[index];

                // Determinar o método HTTP correto para cada endpoint
                const method = (endpoint === '/api/config-termo' || endpoint === '/api/tipos-inspecao' || endpoint === '/api/metas') ? 'GET' : 'POST';
                
                fetch(endpoint, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': sessionId
                    }
                })
                .then(response => {
                    // Verificar se a resposta é JSON válido
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        throw new Error('Resposta não é JSON válido');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.msg === 'sucesso') {
                        // Tratamento especial para empresas (metas)
                        if (endpoint === '/api/metas') {
                            // Processar e salvar empresas com estrutura correta
                            const empresas = processarEmpresas(data);
                            localStorage.setItem('empresas', JSON.stringify(empresas));
                            localStorage.setItem('empresas_timestamp', Date.now().toString());
                            console.log('✅ ' + download.name + ': Baixado com sucesso - ' + empresas.length + ' empresas');
                        } else {
                            localStorage.setItem(storageKey, JSON.stringify(data));
                            localStorage.setItem(storageKey + '_timestamp', Date.now().toString());
                            console.log('✅ ' + download.name + ': Baixado com sucesso');
                        }
                        successCount++;
                    } else {
                        console.log('ℹ️ ' + download.name + ': Nenhum dado encontrado');
                    }
                    completed++;
                    executarDownload(index + 1);
                })
                .catch(error => {
                    console.error('❌ ' + download.name + ': Erro ao baixar - ' + error.message);
                    errorCount++;
                    completed++;
                    executarDownload(index + 1);
                });
            }

            // Iniciar o processo de download
            executarDownload(0);
        }

        // Função para validar se uma empresa está dentro do período válido
        function validarPeriodoEmpresa(empresa) {
            // Se não há datas definidas, considera válida
            if (!empresa.dataIni && !empresa.dataFim) {
                return true;
            }

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0); // Zerar horário para comparar apenas a data

            // Validar data de início
            if (empresa.dataIni) {
                const dataIni = new Date(empresa.dataIni);
                if (hoje < dataIni) {
                    return false; // Ainda não chegou a data de início
                }
            }

            // Validar data de fim
            if (empresa.dataFim) {
                const dataFim = new Date(empresa.dataFim);
                if (hoje > dataFim) {
                    return false; // Já passou da data de fim
                }
            }

            return true;
        }

        function processarEmpresas(data) {
            const empresas = [];
            
            // Filtrar apenas os dados de empresas (chaves numéricas)
            Object.keys(data).forEach(key => {
                if (!isNaN(key)) {
                    const empresa = data[key];
                    
                    // Criar objeto da empresa com campos de data
                    const empresaProcessada = {
                        id: empresa.idempresa,
                        nome: empresa.nomeempresa,
                        razao: empresa.razao,
                        cnpj: empresa.cnpj,
                        endereco: empresa.endereco,
                        cidade: empresa.cidade,
                        uf: empresa.uf,
                        telefone: empresa.telefone,
                        email: empresa.email1,
                        latitude: empresa.latitude,
                        longitude: empresa.longitude,
                        tipoInspecao: empresa.nometipoinspecao,
                        ultimaFiscalizacao: empresa.dtultfis,
                        denunciaPendente: empresa.denunciapendente,
                        perfil: empresa.detalheperfil,
                        status: empresa.realizado || 0, // Status da fiscalização (0 = pendente, 1 = realizada)
                        dataIni: empresa.dataini, // Campo da API para data de início
                        dataFim: empresa.datafim, // Campo da API para data de fim
                        ativo: true, // Será definido pela validação
                        horarios: {
                            seg: empresa.hr_seg,
                            ter: empresa.hr_ter,
                            qua: empresa.hr_qua,
                            qui: empresa.hr_qui,
                            sex: empresa.hr_sex,
                            sab: empresa.hr_sab,
                            dom: empresa.hr_dom
                        }
                    };

                    // Aplicar validação de período
                    empresaProcessada.ativo = validarPeriodoEmpresa(empresaProcessada);
                    
                    empresas.push(empresaProcessada);
                }
            });
            
            // Contar empresas ativas e inativas para log
            const ativas = empresas.filter(empresa => empresa.ativo);
            const inativas = empresas.filter(empresa => !empresa.ativo);
            
            console.log('Sincronização: Validação de períodos');
            console.log('Empresas ativas:', ativas.length);
            console.log('Empresas inativas (fora do período):', inativas.length);
            
            // Salvar no localStorage
            localStorage.setItem('empresas', JSON.stringify(empresas));
            localStorage.setItem('empresas_timestamp', Date.now().toString());
            
            return empresas;
        }

        function getEmpresasLocais() {
            const empresasData = localStorage.getItem('empresas');
            const timestamp = localStorage.getItem('empresas_timestamp');
            
            if (empresasData && timestamp) {
                const empresas = JSON.parse(empresasData);
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('💾 Armazenamento: Dados locais encontrados');
                console.log('📅 Última sincronização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                return {
                    empresas: empresas,
                    timestamp: dataSync,
                    horasDesdeSync: diffHoras
                };
            }
            
            return null;
        }

        function limparDadosLocais() {
            localStorage.removeItem('empresas');
            localStorage.removeItem('empresas_timestamp');
            console.log('🗑️ Armazenamento: Dados locais limpos');
        }

        function verificarDadosLocais() {
            const dadosLocais = getEmpresasLocais();
            
            if (dadosLocais) {
                console.log('📱 Dashboard: Dados locais disponíveis');
                console.log('🏢 Empresas carregadas:', dadosLocais.empresas.length);
                
                // Atualizar estatísticas
                atualizarEstatisticas(dadosLocais.empresas);
                
                // Atualizar descrição do botão com data da última sincronização
                atualizarDescricaoSync(dadosLocais.timestamp);
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (dadosLocais.horasDesdeSync > 24) {
                    console.log('⚠️ Aviso: Dados locais desatualizados (mais de 24h)');
                }
            } else {
                console.log('📱 Dashboard: Nenhum dado local encontrado');
                // Limpar estatísticas
                limparEstatisticas();
                // Resetar descrição do botão
                resetarDescricaoSync();
            }
        }

        function atualizarEstatisticas(empresas) {
            // Filtrar apenas empresas ativas (dentro do período válido)
            const empresasAtivas = empresas.filter(empresa => empresa.ativo);
            
            const pendentes = empresasAtivas.filter(empresa => empresa.status === 0).length;
            const realizadas = empresasAtivas.filter(empresa => empresa.status === 1).length;
            const total = empresasAtivas.length;
            const inativas = empresas.filter(empresa => !empresa.ativo).length;
            
            document.getElementById('empresasPendentes').textContent = pendentes;
            document.getElementById('empresasRealizadas').textContent = realizadas;
            document.getElementById('totalEmpresas').textContent = total;
            
            console.log('Estatísticas atualizadas:');
            console.log('   Empresas ativas (pendentes):', pendentes);
            console.log('   Empresas ativas (realizadas):', realizadas);
            console.log('   Total empresas ativas:', total);
            console.log('   Empresas inativas (fora do período):', inativas);
        }

        function limparEstatisticas() {
            document.getElementById('empresasPendentes').textContent = '0';
            document.getElementById('empresasRealizadas').textContent = '0';
            document.getElementById('totalEmpresas').textContent = '0';
        }

        function atualizarDescricaoSync(timestamp) {
            const syncDescription = document.getElementById('syncDescription');
            if (syncDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                syncDescription.textContent = 'Última sincronização: ' + dataFormatada;
            }
        }

        function resetarDescricaoSync() {
            const syncDescription = document.getElementById('syncDescription');
            if (syncDescription) {
                syncDescription.textContent = 'Buscar empresas do servidor';
            }
        }

        function verificarConfigTermo() {
            const configData = localStorage.getItem('config_termo');
            const timestamp = localStorage.getItem('config_termo_timestamp');
            
            if (configData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 CONFIG-TERMO: Configuração local encontrada');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Atualizar descrição com data da última sincronização
                atualizarDescricaoConfig(dataSync);
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Configuração local desatualizada (mais de 24h)');
                }
            } else {
                console.log('📋 CONFIG-TERMO: Nenhuma configuração local encontrada');
                resetarDescricaoConfig();
            }
        }

        function atualizarDescricaoConfig(timestamp) {
            const configDescription = document.getElementById('configDescription');
            if (configDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                configDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoConfig() {
            const configDescription = document.getElementById('configDescription');
            if (configDescription) {
                configDescription.textContent = 'Configuração do termo de inspeção';
            }
        }

        function verificarRtsHistorico() {
            const rtsData = localStorage.getItem('rts_historico');
            const timestamp = localStorage.getItem('rts_historico_timestamp');
            
            if (rtsData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 RTS-HISTORICO: Histórico local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Atualizar descrição com data da última sincronização
                atualizarDescricaoRts(dataSync);
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Histórico local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 RTS-HISTORICO: Nenhum histórico local encontrado');
                resetarDescricaoRts();
            }
        }

        function atualizarDescricaoRts(timestamp) {
            const rtsDescription = document.getElementById('rtsDescription');
            if (rtsDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                rtsDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoRts() {
            const rtsDescription = document.getElementById('rtsDescription');
            if (rtsDescription) {
                rtsDescription.textContent = 'Histórico de RTS das empresas';
            }
        }

        function verificarTiposInspecao() {
            const tiposData = localStorage.getItem('tipos_inspecao');
            const timestamp = localStorage.getItem('tipos_inspecao_timestamp');
            
            if (tiposData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 TIPOS-INSPECAO: Tipos local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Atualizar descrição com data da última sincronização
                atualizarDescricaoTipos(dataSync);
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Tipos local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 TIPOS-INSPECAO: Nenhum tipo local encontrado');
                resetarDescricaoTipos();
            }
        }

        function atualizarDescricaoTipos(timestamp) {
            const tiposDescription = document.getElementById('tiposDescription');
            if (tiposDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                tiposDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoTipos() {
            const tiposDescription = document.getElementById('tiposDescription');
            if (tiposDescription) {
                tiposDescription.textContent = 'Tipos de inspeção disponíveis';
            }
        }

        function verificarInspecoesHistorico() {
            const inspecoesData = localStorage.getItem('inspecoes_historico');
            const timestamp = localStorage.getItem('inspecoes_historico_timestamp');
            
            if (inspecoesData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 INSPECOES-HISTORICO: Histórico local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Atualizar descrição com data da última sincronização
                atualizarDescricaoInspecoes(dataSync);
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Histórico local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 INSPECOES-HISTORICO: Nenhum histórico local encontrado');
                resetarDescricaoInspecoes();
            }
        }

        function atualizarDescricaoInspecoes(timestamp) {
            const inspecoesDescription = document.getElementById('inspecoesDescription');
            if (inspecoesDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                inspecoesDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoInspecoes() {
            const inspecoesDescription = document.getElementById('inspecoesDescription');
            if (inspecoesDescription) {
                inspecoesDescription.textContent = 'Histórico de inspeções das empresas';
            }
        }

        function verificarProtocolos() {
            const protocolosData = localStorage.getItem('protocolos');
            const timestamp = localStorage.getItem('protocolos_timestamp');
            
            if (protocolosData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 PROTOCOLOS: Protocolos local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Atualizar descrição com data da última sincronização
                atualizarDescricaoProtocolos(dataSync);
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Protocolos local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 PROTOCOLOS: Nenhum protocolo local encontrado');
                resetarDescricaoProtocolos();
            }
        }

        function atualizarDescricaoProtocolos(timestamp) {
            const protocolosDescription = document.getElementById('protocolosDescription');
            if (protocolosDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                protocolosDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoProtocolos() {
            const protocolosDescription = document.getElementById('protocolosDescription');
            if (protocolosDescription) {
                protocolosDescription.textContent = 'Protocolos das empresas';
            }
        }

        function verificarAfastamentos() {
            const afastamentosData = localStorage.getItem('afastamentos');
            const timestamp = localStorage.getItem('afastamentos_timestamp');
            
            if (afastamentosData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 AFASTAMENTOS: Afastamentos local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Atualizar descrição com data da última sincronização
                atualizarDescricaoAfastamentos(dataSync);
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Afastamentos local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 AFASTAMENTOS: Nenhum afastamento local encontrado');
                resetarDescricaoAfastamentos();
            }
        }

        function atualizarDescricaoAfastamentos(timestamp) {
            const afastamentosDescription = document.getElementById('afastamentosDescription');
            if (afastamentosDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                afastamentosDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoAfastamentos() {
            const afastamentosDescription = document.getElementById('afastamentosDescription');
            if (afastamentosDescription) {
                afastamentosDescription.textContent = 'Afastamentos dos farmacêuticos';
            }
        }

        function verificarDenuncias() {
            const denunciasData = localStorage.getItem('denuncias');
            const timestamp = localStorage.getItem('denuncias_timestamp');
            
            if (denunciasData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 DENUNCIAS: Denúncias local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Denúncias local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 DENUNCIAS: Nenhuma denúncia local encontrado');
            }
        }

        function atualizarDescricaoDenuncias(timestamp) {
            const denunciasDescription = document.getElementById('denunciasDescription');
            if (denunciasDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                denunciasDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoDenuncias() {
            const denunciasDescription = document.getElementById('denunciasDescription');
            if (denunciasDescription) {
                denunciasDescription.textContent = 'Denúncias das empresas';
            }
        }

        function verificarOutrosProfissionais() {
            const outrosProfissionaisData = localStorage.getItem('outros_profissionais');
            const timestamp = localStorage.getItem('outros_profissionais_timestamp');
            
            if (outrosProfissionaisData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 OUTROS-PROFISSIONAIS: Outros profissionais local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Outros profissionais local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 OUTROS-PROFISSIONAIS: Nenhum outro profissional local encontrado');
            }
        }

        function atualizarDescricaoOutrosProfissionais(timestamp) {
            const outrosProfissionaisDescription = document.getElementById('outrosProfissionaisDescription');
            if (outrosProfissionaisDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                outrosProfissionaisDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoOutrosProfissionais() {
            const outrosProfissionaisDescription = document.getElementById('outrosProfissionaisDescription');
            if (outrosProfissionaisDescription) {
                outrosProfissionaisDescription.textContent = 'Outros profissionais das empresas';
            }
        }

        function verificarOutrosVinculos() {
            const outrosVinculosData = localStorage.getItem('outros_vinculos');
            const timestamp = localStorage.getItem('outros_vinculos_timestamp');
            
            if (outrosVinculosData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 OUTROS-VINCULOS: Outros vínculos local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Outros vínculos local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 OUTROS-VINCULOS: Nenhum outro vínculo local encontrado');
            }
        }

        function atualizarDescricaoOutrosVinculos(timestamp) {
            const outrosVinculosDescription = document.getElementById('outrosVinculosDescription');
            if (outrosVinculosDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                outrosVinculosDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoOutrosVinculos() {
            const outrosVinculosDescription = document.getElementById('outrosVinculosDescription');
            if (outrosVinculosDescription) {
                outrosVinculosDescription.textContent = 'Outros vínculos dos farmacêuticos';
            }
        }

        function verificarProcessosEticos() {
            const processosEticosData = localStorage.getItem('processos_eticos');
            const timestamp = localStorage.getItem('processos_eticos_timestamp');
            
            if (processosEticosData && timestamp) {
                const dataSync = new Date(parseInt(timestamp));
                const agora = new Date();
                const diffHoras = (agora - dataSync) / (1000 * 60 * 60);
                
                console.log('📋 PROCESSOS-ETICOS: Processos éticos local encontrado');
                console.log('📅 Última atualização:', dataSync.toLocaleString());
                console.log('⏰ Tempo desde sync:', Math.round(diffHoras), 'horas');
                
                // Verificar se os dados são muito antigos (mais de 24h)
                if (diffHoras > 24) {
                    console.log('⚠️ Aviso: Processos éticos local desatualizado (mais de 24h)');
                }
            } else {
                console.log('📋 PROCESSOS-ETICOS: Nenhum processo ético local encontrado');
            }
        }

        function atualizarDescricaoProcessosEticos(timestamp) {
            const processosEticosDescription = document.getElementById('processosEticosDescription');
            if (processosEticosDescription) {
                const data = new Date(timestamp);
                const dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                processosEticosDescription.textContent = 'Última atualização: ' + dataFormatada;
            }
        }

        function resetarDescricaoProcessosEticos() {
            const processosEticosDescription = document.getElementById('processosEticosDescription');
            if (processosEticosDescription) {
                processosEticosDescription.textContent = 'Processos éticos dos farmacêuticos';
            }
        }

        function visualizarEmpresasLocais() {
            const dadosLocais = getEmpresasLocais();
            
            if (!dadosLocais) {
                console.log('Nenhum dado local encontrado. Faça uma sincronização primeiro.');
                return;
            }

            const empresas = dadosLocais.empresas;
            const ativas = empresas.filter(empresa => empresa.ativo);
            const inativas = empresas.filter(empresa => !empresa.ativo);
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DAS EMPRESAS ===');
            console.log('Empresas salvas no localStorage:');
            console.log(JSON.stringify(empresas, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Total de empresas:', empresas.length);
            console.log('Empresas ativas:', ativas.length);
            console.log('Empresas inativas:', inativas.length);
            console.log('Empresas ativas:', ativas);
            console.log('Empresas inativas:', inativas);
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarConfigTermo() {
            const configData = localStorage.getItem('config_termo');
            const timestamp = localStorage.getItem('config_termo_timestamp');
            
            if (!configData) {
                console.log('Nenhuma configuração local encontrada. Baixe a configuração primeiro.');
                return;
            }

            const config = JSON.parse(configData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DA CONFIGURAÇÃO ===');
            console.log('Configuração salva no localStorage:');
            console.log(JSON.stringify(config, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de campos:', Object.keys(config).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', config.msg);
            
            // Mostrar alguns campos de exemplo
            const campos = Object.keys(config).filter(key => !isNaN(key));
            console.log('Primeiros 5 campos:');
            campos.slice(0, 5).forEach(key => {
                const campo = config[key];
                console.log('Campo ' + key + ':', {
                    titulo: campo.titulo_campo,
                    tipo: campo.tipo_resposta,
                    ordem: campo.ordem,
                    opcoes: campo.opcoes ? campo.opcoes.length : 0
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarRtsHistorico() {
            const rtsData = localStorage.getItem('rts_historico');
            const timestamp = localStorage.getItem('rts_historico_timestamp');
            
            if (!rtsData) {
                console.log('Nenhum histórico local encontrado. Baixe o histórico primeiro.');
                return;
            }

            const rts = JSON.parse(rtsData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DO HISTÓRICO RTS ===');
            console.log('Histórico salvo no localStorage:');
            console.log(JSON.stringify(rts, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de registros:', Object.keys(rts).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', rts.msg);
            
            // Mostrar alguns registros de exemplo
            const registros = Object.keys(rts).filter(key => !isNaN(key));
            console.log('Primeiros 5 registros:');
            registros.slice(0, 5).forEach(key => {
                const registro = rts[key];
                console.log('Registro ' + key + ':', {
                    empresa: registro.empresa || 'N/A',
                    rts: registro.rts || 'N/A',
                    data: registro.data || 'N/A',
                    status: registro.status || 'N/A'
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarTiposInspecao() {
            const tiposData = localStorage.getItem('tipos_inspecao');
            const timestamp = localStorage.getItem('tipos_inspecao_timestamp');
            
            if (!tiposData) {
                console.log('Nenhum tipo local encontrado. Baixe os tipos primeiro.');
                return;
            }

            const tipos = JSON.parse(tiposData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DOS TIPOS DE INSPEÇÃO ===');
            console.log('Tipos salvos no localStorage:');
            console.log(JSON.stringify(tipos, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de tipos:', Object.keys(tipos).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', tipos.msg);
            
            // Mostrar todos os tipos
            const tiposList = Object.keys(tipos).filter(key => !isNaN(key));
            console.log('Tipos de inspeção disponíveis:');
            tiposList.forEach(key => {
                const tipo = tipos[key];
                console.log('Tipo ' + key + ':', {
                    id: tipo.idtipo_inspecao,
                    nome: tipo.nome
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarInspecoesHistorico() {
            const inspecoesData = localStorage.getItem('inspecoes_historico');
            const timestamp = localStorage.getItem('inspecoes_historico_timestamp');
            
            if (!inspecoesData) {
                console.log('Nenhum histórico local encontrado. Baixe o histórico primeiro.');
                return;
            }

            const inspecoes = JSON.parse(inspecoesData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DO HISTÓRICO DE INSPEÇÕES ===');
            console.log('Histórico salvo no localStorage:');
            console.log(JSON.stringify(inspecoes, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de registros:', Object.keys(inspecoes).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', inspecoes.msg);
            
            // Mostrar alguns registros de exemplo
            const registros = Object.keys(inspecoes).filter(key => !isNaN(key));
            console.log('Primeiros 5 registros:');
            registros.slice(0, 5).forEach(key => {
                const registro = inspecoes[key];
                console.log('Registro ' + key + ':', {
                    empresa: registro.empresa || 'N/A',
                    data: registro.data || 'N/A',
                    tipo: registro.tipo || 'N/A',
                    resultado: registro.resultado || 'N/A'
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarProtocolos() {
            const protocolosData = localStorage.getItem('protocolos');
            const timestamp = localStorage.getItem('protocolos_timestamp');
            
            if (!protocolosData) {
                console.log('Nenhum protocolo local encontrado. Baixe os protocolos primeiro.');
                return;
            }

            const protocolos = JSON.parse(protocolosData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DOS PROTOCOLOS ===');
            console.log('Protocolos salvos no localStorage:');
            console.log(JSON.stringify(protocolos, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de registros:', Object.keys(protocolos).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', protocolos.msg);
            
            // Mostrar alguns registros de exemplo
            const registros = Object.keys(protocolos).filter(key => !isNaN(key));
            console.log('Primeiros 5 registros:');
            registros.slice(0, 5).forEach(key => {
                const registro = protocolos[key];
                console.log('Registro ' + key + ':', {
                    empresa: registro.empresa || 'N/A',
                    protocolo: registro.protocolo || 'N/A',
                    data: registro.data || 'N/A',
                    status: registro.status || 'N/A'
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarAfastamentos() {
            const afastamentosData = localStorage.getItem('afastamentos');
            const timestamp = localStorage.getItem('afastamentos_timestamp');
            
            if (!afastamentosData) {
                console.log('Nenhum afastamento local encontrado. Baixe os afastamentos primeiro.');
                return;
            }

            const afastamentos = JSON.parse(afastamentosData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DOS AFASTAMENTOS ===');
            console.log('Afastamentos salvos no localStorage:');
            console.log(JSON.stringify(afastamentos, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de registros:', Object.keys(afastamentos).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', afastamentos.msg);
            
            // Mostrar alguns registros de exemplo
            const registros = Object.keys(afastamentos).filter(key => !isNaN(key));
            console.log('Primeiros 5 registros:');
            registros.slice(0, 5).forEach(key => {
                const registro = afastamentos[key];
                console.log('Registro ' + key + ':', {
                    empresa: registro.empresa || 'N/A',
                    farmaceutico: registro.farmaceutico || 'N/A',
                    data_inicio: registro.data_inicio || 'N/A',
                    data_fim: registro.data_fim || 'N/A',
                    motivo: registro.motivo || 'N/A'
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarDenuncias() {
            const denunciasData = localStorage.getItem('denuncias');
            const timestamp = localStorage.getItem('denuncias_timestamp');
            
            if (!denunciasData) {
                console.log('Nenhuma denúncia local encontrado. Baixe as denúncias primeiro.');
                return;
            }

            const denuncias = JSON.parse(denunciasData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DAS DENUNCIAS ===');
            console.log('Denúncias salvos no localStorage:');
            console.log(JSON.stringify(denuncias, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de registros:', Object.keys(denuncias).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', denuncias.msg);
            
            // Mostrar alguns registros de exemplo
            const registros = Object.keys(denuncias).filter(key => !isNaN(key));
            console.log('Primeiros 5 registros:');
            registros.slice(0, 5).forEach(key => {
                const registro = denuncias[key];
                console.log('Registro ' + key + ':', {
                    empresa: registro.empresa || 'N/A',
                    denunciante: registro.denunciante || 'N/A',
                    data_denuncia: registro.data_denuncia || 'N/A',
                    descricao: registro.descricao || 'N/A',
                    status: registro.status || 'N/A'
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarOutrosProfissionais() {
            const outrosProfissionaisData = localStorage.getItem('outros_profissionais');
            const timestamp = localStorage.getItem('outros_profissionais_timestamp');
            
            if (!outrosProfissionaisData) {
                console.log('Nenhum outro profissional local encontrado. Baixe os outros profissionais primeiro.');
                return;
            }

            const outrosProfissionais = JSON.parse(outrosProfissionaisData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DOS OUTROS PROFISSIONAIS ===');
            console.log('Outros profissionais salvos no localStorage:');
            console.log(JSON.stringify(outrosProfissionais, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de registros:', Object.keys(outrosProfissionais).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', outrosProfissionais.msg);
            
            // Mostrar alguns registros de exemplo
            const registros = Object.keys(outrosProfissionais).filter(key => !isNaN(key));
            console.log('Primeiros 5 registros:');
            registros.slice(0, 5).forEach(key => {
                const registro = outrosProfissionais[key];
                console.log('Registro ' + key + ':', {
                    empresa: registro.empresa || 'N/A',
                    profissional: registro.profissional || 'N/A',
                    cargo: registro.cargo || 'N/A',
                    registro: registro.registro || 'N/A',
                    status: registro.status || 'N/A'
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarOutrosVinculos() {
            const outrosVinculosData = localStorage.getItem('outros_vinculos');
            const timestamp = localStorage.getItem('outros_vinculos_timestamp');
            
            if (!outrosVinculosData) {
                console.log('Nenhum outro vínculo local encontrado. Baixe os outros vínculos primeiro.');
                return;
            }

            const outrosVinculos = JSON.parse(outrosVinculosData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DOS OUTROS VINCULOS ===');
            console.log('Outros vínculos salvos no localStorage:');
            console.log(JSON.stringify(outrosVinculos, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de registros:', Object.keys(outrosVinculos).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', outrosVinculos.msg);
            
            // Mostrar alguns registros de exemplo
            const registros = Object.keys(outrosVinculos).filter(key => !isNaN(key));
            console.log('Primeiros 5 registros:');
            registros.slice(0, 5).forEach(key => {
                const registro = outrosVinculos[key];
                console.log('Registro ' + key + ':', {
                    farmaceutico: registro.farmaceutico || 'N/A',
                    empresa: registro.empresa || 'N/A',
                    vinculo: registro.vinculo || 'N/A',
                    data_inicio: registro.data_inicio || 'N/A',
                    data_fim: registro.data_fim || 'N/A',
                    status: registro.status || 'N/A'
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function visualizarProcessosEticos() {
            const processosEticosData = localStorage.getItem('processos_eticos');
            const timestamp = localStorage.getItem('processos_eticos_timestamp');
            
            if (!processosEticosData) {
                console.log('Nenhum processo ético local encontrado. Baixe os processos éticos primeiro.');
                return;
            }

            const processosEticos = JSON.parse(processosEticosData);
            const dataSync = new Date(parseInt(timestamp));
            
            // Mostrar JSON completo no console
            console.log('=== JSON COMPLETO DOS PROCESSOS ETICOS ===');
            console.log('Processos éticos salvos no localStorage:');
            console.log(JSON.stringify(processosEticos, null, 2));
            console.log('=== FIM DO JSON ===');
            
            // Mostrar também dados estruturados
            console.log('=== DADOS ESTRUTURADOS ===');
            console.log('Data de download:', dataSync.toLocaleString());
            console.log('Total de registros:', Object.keys(processosEticos).filter(key => !isNaN(key)).length);
            console.log('Mensagem:', processosEticos.msg);
            
            // Mostrar alguns registros de exemplo
            const registros = Object.keys(processosEticos).filter(key => !isNaN(key));
            console.log('Primeiros 5 registros:');
            registros.slice(0, 5).forEach(key => {
                const registro = processosEticos[key];
                console.log('Registro ' + key + ':', {
                    farmaceutico: registro.farmaceutico || 'N/A',
                    processo: registro.processo || 'N/A',
                    data_abertura: registro.data_abertura || 'N/A',
                    data_conclusao: registro.data_conclusao || 'N/A',
                    status: registro.status || 'N/A',
                    descricao: registro.descricao || 'N/A'
                });
            });
            console.log('=== FIM DOS DADOS ESTRUTURADOS ===');
        }

        function abrirModal(tipo) {
            const modalId = 'modal' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'block';
                preencherListaEmpresas(tipo);
            }
        }

        function fecharModal(tipo) {
            const modalId = 'modal' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'none';
            }
        }

        function preencherListaEmpresas(tipo) {
            const dadosLocais = getEmpresasLocais();
            if (!dadosLocais) {
                console.log('❌ Nenhum dado local encontrado');
                return;
            }

            let empresasFiltradas = [];
            
            switch(tipo) {
                case 'pendentes':
                    // Mostrar apenas empresas pendentes E ativas
                    empresasFiltradas = dadosLocais.empresas.filter(empresa => empresa.status === 0 && empresa.ativo);
                    break;
                case 'realizadas':
                    // Mostrar apenas empresas realizadas E ativas
                    empresasFiltradas = dadosLocais.empresas.filter(empresa => empresa.status === 1 && empresa.ativo);
                    break;
                case 'total':
                    // Mostrar apenas empresas ativas
                    empresasFiltradas = dadosLocais.empresas.filter(empresa => empresa.ativo);
                    break;
            }

            const listaId = 'lista' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
            const listaElement = document.getElementById(listaId);
            
            if (listaElement) {
                if (empresasFiltradas.length === 0) {
                    listaElement.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhuma empresa encontrada</p>';
                } else {
                    const html = empresasFiltradas.map(empresa => 
                        '<div class="empresa-item">' +
                        '<div class="empresa-inscricao">' + (empresa.cnpj || 'N/A') + '</div>' +
                        '<div class="empresa-razao">' + (empresa.razao || empresa.nome || 'N/A') + '</div>' +
                        '<div class="empresa-endereco">' + (empresa.endereco || 'N/A') + ', ' + (empresa.cidade || 'N/A') + ' - ' + (empresa.uf || 'N/A') + '</div>' +
                        '</div>'
                    ).join('');
                    
                    listaElement.innerHTML = html;
                }
                
                console.log('📋 Modal:', tipo, '- Empresas carregadas:', empresasFiltradas.length);
            }
        }

        // Fechar modal ao clicar fora dele
        window.onclick = function(event) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        function logout() {
            const sessionId = localStorage.getItem('sessionId');
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionId
                }
            })
            .then(() => {
                localStorage.removeItem('sessionId');
                window.location.href = '/';
            })
            .catch(error => {
                console.error('Erro ao fazer logout:', error);
                localStorage.removeItem('sessionId');
                window.location.href = '/';
            });
        }


    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Rota para página inicial do app
    if (req.url === '/app') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(appHtmlContent);
        return;
    }

    // Rota para a tela de listar empresas
    if (req.url === '/empresas') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(empresasHtmlContent);
        return;
    }

    // API para verificar sessão
    if (req.url === '/api/session' && req.method === 'GET') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        console.log('🔍 SESSION: Verificando sessão:', sessionId);
        console.log('🔍 SESSION: Sessões ativas:', sessions.size);
        
        if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            console.log('✅ SESSION: Sessão válida encontrada');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                user: session.user
            }));
        } else {
            console.log('❌ SESSION: Sessão inválida ou não encontrada');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
        }
        return;
    }

    // API para logout
    if (req.url === '/api/logout' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (sessionId && sessions.has(sessionId)) {
            sessions.delete(sessionId);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: 'Logout realizado com sucesso'
        }));
        return;
    }

    // API para buscar metas do fiscal
    if (req.url === '/api/metas' && req.method === 'GET') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 METAS: Buscando metas para fiscal ID:', userId);

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: `/ws/fem/meta-lista.php?iduser=${userId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 METAS: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantas empresas foram encontradas
                        const empresas = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 METAS: Empresas encontradas:', empresas);
                    } else {
                        console.log('📋 METAS: Nenhuma empresa encontrada');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 METAS: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados das metas' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 METAS: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.end();
        return;
    }

    // API para buscar configuração do termo de inspeção
    if (req.url === '/api/config-termo' && req.method === 'GET') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        console.log('📋 CONFIG-TERMO: Buscando configuração do termo de inspeção');

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/campostv-json.php',
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    // Verificar se a resposta começa com HTML (erro comum)
                    if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
                        console.log('💥 CONFIG-TERMO: API retornou HTML em vez de JSON');
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            msg: 'erro',
                            error: 'API retornou HTML em vez de JSON',
                            message: 'Erro de comunicação com o servidor'
                        }));
                        return;
                    }
                    
                    const responseData = JSON.parse(data);
                    console.log('📋 CONFIG-TERMO: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos campos foram encontrados
                        const campos = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 CONFIG-TERMO: Campos encontrados:', campos);
                    } else {
                        console.log('📋 CONFIG-TERMO: Nenhum campo encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 CONFIG-TERMO: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        msg: 'erro',
                        error: 'Erro ao processar dados da configuração',
                        message: 'Erro ao processar dados da configuração'
                    }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 CONFIG-TERMO: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro de conexão com a API',
                message: 'Erro de conexão com a API'
            }));
        });

        proxyReq.end();
        return;
    }

    // API para buscar histórico de RTS
    if (req.url === '/api/rts-historico' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 RTS-HISTORICO: Buscando histórico de RTS para fiscal ID:', userId);

        const postData = `iduser=${userId}`;

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/rts-hist-json.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 RTS-HISTORICO: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos registros foram encontrados
                        const registros = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 RTS-HISTORICO: Registros encontrados:', registros);
                    } else {
                        console.log('📋 RTS-HISTORICO: Nenhum registro encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 RTS-HISTORICO: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados do histórico' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 RTS-HISTORICO: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.write(postData);
        proxyReq.end();
        return;
    }

    // API para buscar tipos de inspeção
    if (req.url === '/api/tipos-inspecao' && req.method === 'GET') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        console.log('📋 TIPOS-INSPECAO: Buscando tipos de inspeção');

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/tiposinspecao-json.php',
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    // Verificar se a resposta começa com HTML (erro comum)
                    if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
                        console.log('💥 TIPOS-INSPECAO: API retornou HTML em vez de JSON');
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            msg: 'erro',
                            error: 'API retornou HTML em vez de JSON',
                            message: 'Erro de comunicação com o servidor'
                        }));
                        return;
                    }
                    
                    const responseData = JSON.parse(data);
                    console.log('📋 TIPOS-INSPECAO: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos tipos foram encontrados
                        const tipos = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 TIPOS-INSPECAO: Tipos encontrados:', tipos);
                    } else {
                        console.log('📋 TIPOS-INSPECAO: Nenhum tipo encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 TIPOS-INSPECAO: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        msg: 'erro',
                        error: 'Erro ao processar dados dos tipos',
                        message: 'Erro ao processar dados dos tipos'
                    }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 TIPOS-INSPECAO: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro de conexão com a API',
                message: 'Erro de conexão com a API'
            }));
        });

        proxyReq.end();
        return;
    }

    // API para buscar histórico de inspeções
    if (req.url === '/api/inspecoes-historico' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 INSPECOES-HISTORICO: Buscando histórico de inspeções para fiscal ID:', userId);

        const postData = `iduser=${userId}`;

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/inspecoes-json.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 INSPECOES-HISTORICO: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos registros foram encontrados
                        const registros = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 INSPECOES-HISTORICO: Registros encontrados:', registros);
                    } else {
                        console.log('📋 INSPECOES-HISTORICO: Nenhum registro encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 INSPECOES-HISTORICO: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados do histórico' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 INSPECOES-HISTORICO: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.write(postData);
        proxyReq.end();
        return;
    }

    // API para buscar protocolos
    if (req.url === '/api/protocolos' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 PROTOCOLOS: Buscando protocolos para fiscal ID:', userId);

        const postData = `iduser=${userId}`;

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/protocolos-json.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 PROTOCOLOS: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos registros foram encontrados
                        const registros = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 PROTOCOLOS: Registros encontrados:', registros);
                    } else {
                        console.log('📋 PROTOCOLOS: Nenhum registro encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 PROTOCOLOS: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados dos protocolos' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 PROTOCOLOS: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.write(postData);
        proxyReq.end();
        return;
    }

    // API para buscar afastamentos
    if (req.url === '/api/afastamentos' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 AFASTAMENTOS: Buscando afastamentos para fiscal ID:', userId);

        const postData = `iduser=${userId}`;

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/afastamentos-json.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 AFASTAMENTOS: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos registros foram encontrados
                        const registros = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 AFASTAMENTOS: Registros encontrados:', registros);
                    } else {
                        console.log('📋 AFASTAMENTOS: Nenhum registro encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 AFASTAMENTOS: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados dos afastamentos' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 AFASTAMENTOS: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.write(postData);
        proxyReq.end();
        return;
    }

    // API para buscar denúncias
    if (req.url === '/api/denuncias' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 DENUNCIAS: Buscando denúncias para fiscal ID:', userId);

        const postData = `iduser=${userId}`;

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/denuncias-json.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 DENUNCIAS: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos registros foram encontrados
                        const registros = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 DENUNCIAS: Registros encontrados:', registros);
                    } else {
                        console.log('📋 DENUNCIAS: Nenhum registro encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 DENUNCIAS: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados das denúncias' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 DENUNCIAS: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.write(postData);
        proxyReq.end();
        return;
    }

    // API para buscar outros profissionais
    if (req.url === '/api/outros-profissionais' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 OUTROS-PROFISSIONAIS: Buscando outros profissionais para fiscal ID:', userId);

        const postData = `iduser=${userId}`;

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/outro-job-json.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 OUTROS-PROFISSIONAIS: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos registros foram encontrados
                        const registros = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 OUTROS-PROFISSIONAIS: Registros encontrados:', registros);
                    } else {
                        console.log('📋 OUTROS-PROFISSIONAIS: Nenhum registro encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 OUTROS-PROFISSIONAIS: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados dos outros profissionais' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 OUTROS-PROFISSIONAIS: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.write(postData);
        proxyReq.end();
        return;
    }

    // API para buscar outros vínculos profissionais
    if (req.url === '/api/outros-vinculos' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 OUTROS-VINCULOS: Buscando outros vínculos para fiscal ID:', userId);

        const postData = `iduser=${userId}`;

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/outro-job-prof-json.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 OUTROS-VINCULOS: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos registros foram encontrados
                        const registros = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 OUTROS-VINCULOS: Registros encontrados:', registros);
                    } else {
                        console.log('📋 OUTROS-VINCULOS: Nenhum registro encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 OUTROS-VINCULOS: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados dos outros vínculos' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 OUTROS-VINCULOS: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.write(postData);
        proxyReq.end();
        return;
    }

    // API para buscar processos éticos
    if (req.url === '/api/processos-eticos' && req.method === 'POST') {
        const sessionId = req.headers['x-session-id'] || req.headers['authorization'];
        
        if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Sessão inválida'
            }));
            return;
        }

        const session = sessions.get(sessionId);
        const userId = session.user.id;

        console.log('📋 PROCESSOS-ETICOS: Buscando processos éticos para fiscal ID:', userId);

        const postData = `iduser=${userId}`;

        const options = {
            hostname: 'farmasis.crfrs.org.br',
            port: 443,
            path: '/ws/fem/etica-pf-json.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log('📋 PROCESSOS-ETICOS: Resposta da API CRF:', responseData.msg);
                    
                    if (responseData.msg === 'sucesso') {
                        // Contar quantos registros foram encontrados
                        const registros = Object.keys(responseData).filter(key => !isNaN(key)).length;
                        console.log('📋 PROCESSOS-ETICOS: Registros encontrados:', registros);
                    } else {
                        console.log('📋 PROCESSOS-ETICOS: Nenhum registro encontrado');
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                } catch (error) {
                    console.log('💥 PROCESSOS-ETICOS: Erro ao processar resposta:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao processar dados dos processos éticos' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.log('💥 PROCESSOS-ETICOS: Erro na requisição:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
        });

        proxyReq.write(postData);
        proxyReq.end();
        return;
    }

    // Proxy para API do CRF
    if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            // Parse dos dados recebidos
            const requestData = JSON.parse(body);
            const originalPassword = requestData.password;
            
            // Enviar senha sem criptografar (texto plano)
            const hashedPassword = originalPassword;
            
            const options = {
                hostname: 'farmasis.crfrs.org.br',
                port: 443,
                path: '/ws/fem/login.php',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(`username=${encodeURIComponent(requestData.username)}&password=${encodeURIComponent(hashedPassword)}`)
                }
            };

            const proxyReq = https.request(options, (proxyRes) => {
                let data = '';
                proxyRes.on('data', (chunk) => {
                    data += chunk;
                });
                
                proxyRes.on('end', () => {
                    try {
                        const responseData = JSON.parse(data);
                        
                        if (responseData.msg === 'sucesso' && responseData.nome) {
                            // Criar sessão
                            const sessionId = generateSessionId();
                            const userData = {
                                id: responseData.iduser,
                                nome: responseData.nome,
                                email: responseData.email,
                                uf: responseData.uf
                            };
                            
                            sessions.set(sessionId, {
                                user: userData,
                                createdAt: Date.now()
                            });
                            
                            console.log('✅ LOGIN: Sessão criada:', sessionId);
                            console.log('✅ LOGIN: Usuário:', userData.nome);
                            console.log('✅ LOGIN: Total de sessões:', sessions.size);
                            
                            // Retornar dados com sessionId
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                ...responseData,
                                sessionId: sessionId
                            }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(data);
                        }
                    } catch (error) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(data);
                    }
                });
            });

            proxyReq.on('error', (err) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
            });

            const requestBody = `username=${encodeURIComponent(requestData.username)}&password=${encodeURIComponent(hashedPassword)}`;
            
            proxyReq.write(requestBody);
            proxyReq.end();
        });
        
        return;
    }

    // Servir a tela de login para qualquer rota
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
});

server.listen(PORT, () => {
    console.log('🚀 Servidor FEM App iniciado!');
    console.log('📱 Tela de login disponível em:');
    console.log('   http://localhost:' + PORT);
    console.log('');
    console.log('📋 Para parar o servidor, pressione Ctrl+C');
    console.log('');
});

// Tratamento de erro
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('❌ Porta ' + PORT + ' já está em uso!');
        console.log('💡 Tente parar outros processos na porta 8081');
    } else {
        console.log('❌ Erro no servidor:', err.message);
    }
}); 