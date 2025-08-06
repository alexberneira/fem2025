const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;

const htmlContent = `
<!DOCTYPE html>
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
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .title {
            font-size: 32px;
            font-weight: bold;
            color: #333;
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
            border-color: #007AFF;
        }

        .login-button {
            background: #007AFF;
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
            background: #0056CC;
        }

        .login-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .alert {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }

        .alert.error {
            background: #FFE5E5;
            color: #D32F2F;
            border: 1px solid #FFCDD2;
        }

        .alert.success {
            background: #E8F5E8;
            color: #388E3C;
            border: 1px solid #C8E6C9;
        }

        .status {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 8px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">FEM App</h1>
            <p class="subtitle">Faça login para continuar</p>
        </div>

        <div id="alert" class="alert"></div>

        <form class="form" id="loginForm">
            <div class="input-container">
                <label class="label" for="email">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    class="input" 
                    placeholder="Digite seu email"
                    required
                >
            </div>

            <div class="input-container">
                <label class="label" for="password">Senha</label>
                <input 
                    type="password" 
                    id="password" 
                    class="input" 
                    placeholder="Digite sua senha"
                    required
                >
            </div>

            <button type="submit" class="login-button" id="loginButton">
                Entrar
            </button>
        </form>

        <div class="status">
            ✅ Servidor rodando na porta 8081<br>
            📱 Tela de login funcionando no navegador
        </div>
    </div>

    <script>
        const form = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('loginButton');
        const alertDiv = document.getElementById('alert');

        function showAlert(message, type) {
            alertDiv.textContent = message;
            alertDiv.className = \`alert \${type}\`;
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

            // Simular chamada de API
            setTimeout(() => {
                loginButton.textContent = 'Entrar';
                loginButton.disabled = false;
                showAlert('Login realizado com sucesso!', 'success');
                
                // Limpar campos
                emailInput.value = '';
                passwordInput.value = '';
                
                // Esconder alerta após 3 segundos
                setTimeout(hideAlert, 3000);
            }, 2000);
        });
    </script>
</body>
</html>
`;

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

    // Servir a tela de login para qualquer rota
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
});

server.listen(PORT, () => {
    console.log('🚀 Servidor FEM App iniciado!');
    console.log('📱 Tela de login disponível em:');
    console.log(`   http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Para parar o servidor, pressione Ctrl+C');
    console.log('');
});

// Tratamento de erro
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Porta ${PORT} já está em uso!`);
        console.log('💡 Tente parar outros processos na porta 8081');
    } else {
        console.log('❌ Erro no servidor:', err.message);
    }
}); 