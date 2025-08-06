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
            padding: 12px 20px;
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
            font-size: 20px;
            font-weight: bold;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .user-name {
            font-weight: 600;
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
            margin: 20px auto;
            padding: 0 20px;
        }

        .welcome-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
        }

        .welcome-title {
            font-size: 28px;
            color: #333;
            margin-bottom: 10px;
        }

        .welcome-name {
            font-size: 20px;
            color: #2C4B8C;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .welcome-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 20px;
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
            font-size: 13px;
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
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }

        .action-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(44, 75, 140, 0.2);
        }

        .action-icon {
            font-size: 32px;
            margin-bottom: 15px;
        }

        .action-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }

        .action-description {
            font-size: 14px;
            color: #666;
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
            <div class="action-card" onclick="sincronizarDados()">
                <div class="action-icon">🔄</div>
                <div class="action-title">Sincronizar</div>
                <div class="action-description" id="syncDescription">Buscar empresas do servidor</div>
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
                    
                    // Limpar dados locais se não há empresas
                    localStorage.removeItem('empresas');
                    localStorage.removeItem('empresas_timestamp');
                    
                    // Mostrar mensagem de nenhum dado
                    syncButton.innerHTML = '<div class="action-icon">ℹ️</div><div class="action-title">Nenhum dado</div><div class="action-description">Nenhuma empresa pendente</div>';
                    
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

        function processarEmpresas(data) {
            const empresas = [];
            
            // Filtrar apenas os dados de empresas (chaves numéricas)
            Object.keys(data).forEach(key => {
                if (!isNaN(key)) {
                    const empresa = data[key];
                    empresas.push({
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
                        horarios: {
                            seg: empresa.hr_seg,
                            ter: empresa.hr_ter,
                            qua: empresa.hr_qua,
                            qui: empresa.hr_qui,
                            sex: empresa.hr_sex,
                            sab: empresa.hr_sab,
                            dom: empresa.hr_dom
                        }
                    });
                }
            });
            
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
            const pendentes = empresas.filter(empresa => empresa.status === 0).length;
            const realizadas = empresas.filter(empresa => empresa.status === 1).length;
            const total = empresas.length;
            
            document.getElementById('empresasPendentes').textContent = pendentes;
            document.getElementById('empresasRealizadas').textContent = realizadas;
            document.getElementById('totalEmpresas').textContent = total;
            
            console.log('📊 Estatísticas atualizadas:');
            console.log('   📋 Pendentes:', pendentes);
            console.log('   ✅ Realizadas:', realizadas);
            console.log('   🏢 Total:', total);
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
                    empresasFiltradas = dadosLocais.empresas.filter(empresa => empresa.status === 0);
                    break;
                case 'realizadas':
                    empresasFiltradas = dadosLocais.empresas.filter(empresa => empresa.status === 1);
                    break;
                case 'total':
                    empresasFiltradas = dadosLocais.empresas;
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