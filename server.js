const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8081;

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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">FEM App</h1>
            <p class="subtitle">Sistema de Gestão Farmacêutica</p>
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
                loginButton.textContent = 'Entrar';
                loginButton.disabled = false;
                
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
                        
                        // Limpar campos
                        emailInput.value = '';
                        passwordInput.value = '';
                    } else {
                        showAlert('Credenciais inválidas ou usuário não autorizado.', 'error');
                    }
                } catch (error) {
                    showAlert('Erro de conexão com a API do CRF. Tente novamente.', 'error');
                }
                
                // Esconder alerta após 3 segundos
                setTimeout(hideAlert, 3000);
            }, 2000);
        });
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
                    res.writeHead(proxyRes.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(data);
                });
            });

            proxyReq.on('error', (err) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro de conexão com a API' }));
            });

            const requestBody = `username=${encodeURIComponent(requestData.username)}&password=${encodeURIComponent(hashedPassword)}`;
            
            // Log de envio removido para produção
            
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