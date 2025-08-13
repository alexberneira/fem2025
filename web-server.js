const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8081;
const CRF_API_BASE = 'https://farmasis.crfrs.org.br/ws/fem';
const CRF_API_REAL = 'https://farmasis.crfrs.org.br/ws/fem';

const server = http.createServer((req, res) => {
    // Log detalhado de cada requisição
    const timestamp = new Date().toISOString();
    console.log(`\n📥 [${timestamp}] Nova requisição recebida:`);
    console.log(`   🌐 Método: ${req.method}`);
    console.log(`   🔗 URL: ${req.url}`);
    console.log(`   👤 User-Agent: ${req.headers['user-agent'] || 'N/A'}`);
    console.log(`   📍 IP: ${req.connection.remoteAddress || 'N/A'}`);
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Responder a requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        console.log(`   🔄 Requisição OPTIONS (CORS preflight)`);
        res.writeHead(200);
        res.end();
        return;
    }

    // Rotas para downloads e funcionalidades (tratadas localmente)
    if (req.url === '/empresas') {
        console.log(`   📋 Rota processada: /empresas (página HTML)`);
        serveEmpresasPage(req, res);
        return;
    }

    if (req.url.startsWith('/empresa-detalhes.html')) {
        console.log(`   🏢 Rota processada: /empresa-detalhes.html (detalhes da empresa)`);
        const empresaFilePath = path.join(__dirname, 'public', 'empresa-detalhes.html');
        // Verificar se o arquivo existe e servi-lo
        fs.access(empresaFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.log(`   ❌ Arquivo não encontrado: ${empresaFilePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Página não encontrada</h1>');
                return;
            }
            
            // Ler e servir o arquivo
            fs.readFile(empresaFilePath, (err, data) => {
                if (err) {
                    console.log(`   ❌ Erro ao ler arquivo: ${empresaFilePath}`);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<h1>500 - Erro interno do servidor</h1>');
                    return;
                }
                
                console.log(`   ✅ Arquivo servido com sucesso: ${empresaFilePath}`);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        });
        return;
    }

    if (req.url === '/api/sincronizar') {
        console.log(`   🔄 Rota processada: /api/sincronizar (sincronização)`);
        handleSincronizacao(req, res);
        return;
    }

    if (req.url === '/api/empresas') {
        console.log(`   📥 Rota processada: /api/empresas (proxy API CRF)`);
        handleRealApiProxy(req, res, '/meta-lista.php');
        return;
    }

    // Rota removida para permitir que a função JavaScript execute diretamente
    // if (req.url === '/api/empresas-locais') {
    //     console.log(`   👁️ Rota processada: /api/empresas-locais (empresas locais)`);
    //     handleEmpresasLocais(req, res);
    //     return;
    // }

    // Proxy para endpoints reais da API CRF
    if (req.url === '/api/config-termo') {
        console.log(`   📋 Rota processada: /api/config-termo (proxy API CRF)`);
        handleRealApiProxy(req, res, '/campostv-json.php');
        return;
    }

    if (req.url === '/api/rts-historico') {
        console.log(`   👥 Rota processada: /api/rts-historico (proxy API CRF)`);
        handleRealApiProxy(req, res, '/rts-hist-json.php');
        return;
    }

    if (req.url === '/api/tipos-inspecao') {
        console.log(`   🔍 Rota processada: /api/tipos-inspecao (proxy API CRF)`);
        handleRealApiProxy(req, res, '/tiposinspecao-json.php');
        return;
    }

    if (req.url === '/api/inspecoes-historico') {
        console.log(`   📊 Rota processada: /api/inspecoes-historico (proxy API CRF)`);
        handleRealApiProxy(req, res, '/inspecoes-json.php');
        return;
    }

    if (req.url === '/api/protocolos') {
        console.log(`   📄 Rota processada: /api/protocolos (proxy API CRF)`);
        handleRealApiProxy(req, res, '/protocolos-json.php');
        return;
    }

    if (req.url === '/api/afastamentos') {
        console.log(`   🏥 Rota processada: /api/afastamentos (proxy API CRF)`);
        handleRealApiProxy(req, res, '/afastamentos-json.php');
        return;
    }

    if (req.url === '/api/denuncias') {
        console.log(`   🚨 Rota processada: /api/denuncias (proxy API CRF)`);
        handleRealApiProxy(req, res, '/denuncias-json.php');
        return;
    }

    if (req.url === '/api/outros-profissionais') {
        console.log(`   👨‍⚕️ Rota processada: /api/outros-profissionais (proxy API CRF)`);
        handleRealApiProxy(req, res, '/outro-job-prof-json.php');
        return;
    }

    if (req.url === '/api/outros-vinculos') {
        console.log(`   🔗 Rota processada: /api/outros-vinculos (proxy API CRF)`);
        handleRealApiProxy(req, res, '/outro-job-json.php');
        return;
    }

    if (req.url === '/api/processos-eticos') {
        console.log(`   ⚖️ Rota processada: /api/processos-eticos (proxy API CRF)`);
        handleRealApiProxy(req, res, '/etica-pf-json.php');
        return;
    }

    // Proxy para API do CRF (apenas para endpoints que realmente existem)
    if (req.url.startsWith('/api/') && req.url.includes('login.php')) {
        console.log(`   🔐 Rota processada: ${req.url} (proxy login CRF)`);
        handleApiProxy(req, res);
        return;
    }

    let filePath = '';

    // Roteamento baseado na URL
    if (req.url === '/' || req.url === '/index.html') {
        console.log(`   🏠 Rota processada: ${req.url} (página inicial)`);
        filePath = path.join(__dirname, 'public', 'index.html');
    } else if (req.url === '/dashboard' || req.url === '/dashboard.html') {
        console.log(`   📱 Rota processada: ${req.url} (dashboard)`);
        filePath = path.join(__dirname, 'public', 'dashboard.html');
    } else {
        // Tentar servir arquivos estáticos
        console.log(`   📁 Rota processada: ${req.url} (arquivo estático)`);
        filePath = path.join(__dirname, 'public', req.url);
    }

    // Verificar se o arquivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Arquivo não encontrado
            console.log(`   ❌ Arquivo não encontrado: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Página não encontrada</h1>');
            return;
        }

        // Ler e servir o arquivo
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(`   ❌ Erro ao ler arquivo: ${filePath}`);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Erro interno do servidor</h1>');
                return;
            }

            // Determinar o tipo de conteúdo baseado na extensão
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'text/html';

            switch (ext) {
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.gif':
                    contentType = 'image/gif';
                    break;
                case '.svg':
                    contentType = 'image/svg+xml';
                    break;
            }

            console.log(`   ✅ Arquivo servido com sucesso: ${filePath} (${contentType})`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

// Função para fazer proxy das requisições da API (apenas para login)
function handleApiProxy(req, res) {
    const apiPath = req.url.replace('/api', '');
    const targetUrl = `${CRF_API_BASE}${apiPath}`;
    
    console.log(`🔄 Proxy: ${req.method} ${req.url} -> ${targetUrl}`);

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            // Parse dos dados JSON recebidos do frontend
            const requestData = JSON.parse(body);
            const username = requestData.username || requestData.email;
            const password = requestData.password;
            
            // Converter para formato form-urlencoded que a API espera
            const formData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
            
            // Configurar opções para a requisição HTTPS
            const options = {
                hostname: 'farmasis.crfrs.org.br',
                port: 443,
                path: `/ws/fem${apiPath}`,
                method: req.method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(formData),
                    'User-Agent': 'CRF-App/1.0'
                },
                // Ignorar verificação de certificado SSL para desenvolvimento
                rejectUnauthorized: false
            };

            console.log(`📤 Enviando dados: username=${username}, password=${password}`);

            // Fazer a requisição para a API do CRF
            const apiReq = https.request(options, (apiRes) => {
                let data = '';
                
                apiRes.on('data', (chunk) => {
                    data += chunk;
                });

                apiRes.on('end', () => {
                    // Responder com os dados da API
                    res.writeHead(apiRes.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    });
                    
                    console.log(`✅ Proxy response: ${apiRes.statusCode} - ${data.substring(0, 100)}...`);
                    res.end(data);
                });
            });

            apiReq.on('error', (error) => {
                console.error('❌ Proxy error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Erro ao conectar com a API do CRF',
                    message: error.message
                }));
            });

            // Enviar dados no formato correto
            apiReq.write(formData);
            apiReq.end();
            
        } catch (error) {
            console.error('❌ Erro ao processar dados:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Dados inválidos',
                message: error.message
            }));
        }
    });
}

// Função para fazer proxy para a API real do CRF
function handleRealApiProxy(req, res, endpoint) {
    console.log(`🌐 Real API Proxy: ${req.method} ${req.url} -> ${CRF_API_REAL}${endpoint}`);
    
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            // Configurar opções para a requisição HTTPS
            const options = {
                hostname: 'farmasis.crfrs.org.br',
                port: 443,
                path: `/ws/fem${endpoint}`,
                method: req.method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'FEM-App/1.0'
                },
                // Ignorar verificação de certificado SSL para desenvolvimento
                rejectUnauthorized: false
            };

            // Se há dados no body, adicionar ao request
            if (body) {
                options.headers['Content-Length'] = Buffer.byteLength(body);
            }

            console.log(`📤 Enviando requisição para API real: ${endpoint}`);
            console.log(`📦 Body da requisição: ${body}`);

            // Fazer a requisição para a API real do CRF
            const apiReq = https.request(options, (apiRes) => {
                let data = '';
                
                apiRes.on('data', (chunk) => {
                    data += chunk;
                });

                apiRes.on('end', () => {
                    // Responder com os dados da API
                    res.writeHead(apiRes.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    });
                    
                    console.log(`✅ Real API response: ${apiRes.statusCode} - ${data.substring(0, 100)}...`);
                    res.end(data);
                });
            });

            apiReq.on('error', (error) => {
                console.error('❌ Real API error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Erro ao conectar com a API real do CRF',
                    message: error.message
                }));
            });

            // Enviar dados se houver
            if (body) {
                apiReq.write(body);
            }
            apiReq.end();
            
        } catch (error) {
            console.error('❌ Erro ao processar dados:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Dados inválidos',
                message: error.message
            }));
        }
    });
}

// Funções para lidar com downloads e funcionalidades
function serveEmpresasPage(req, res) {
    console.log('   📋 Servindo página empresas.html');
    
    const filePath = path.join(__dirname, 'public', 'empresas.html');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('   ❌ Erro ao ler empresas.html:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
            return;
        }
        
        console.log('   ✅ Página empresas.html servida com sucesso');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}

function handleSincronizacao(req, res) {
    console.log('🔄 Sincronização solicitada');
    console.log('📊 Iniciando processo de sincronização...');
    
    // Simular sincronização
    setTimeout(() => {
        console.log('✅ Sincronização concluída com sucesso');
        console.log('📅 Timestamp:', new Date().toISOString());
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: 'Sincronização concluída com sucesso',
            timestamp: new Date().toISOString()
        }));
    }, 2000);
}

// Função removida - agora a função JavaScript lê diretamente do localStorage
// function handleEmpresasLocais(req, res) {
//     console.log('👁️ Visualizando empresas locais');
//     console.log('📋 Carregando dados de empresas do armazenamento local...');
//     
//     // Simular dados locais
//     const empresasLocais = [
//         { id: 1, nome: 'Farmácia Central', cnpj: '12.345.678/0001-90', cidade: 'Porto Alegre', status: 'Ativo' },
//         { id: 2, nome: 'Drogaria Popular', cnpj: '98.765.432/0001-10', cidade: 'Canoas', status: 'Ativo' },
//         { id: 3, nome: 'Farmácia São João', cnpj: '11.222.333/0001-44', cidade: 'Gravataí', status: 'Inativo' }
//     ];
//     
//     console.log(`📊 Total de empresas encontradas: ${empresasLocais.length}`);
//     empresasLocais.forEach((empresa, index) => {
//         console.log(`   ${index + 1}. ${empresa.nome} (${empresa.cidade}) - ${empresa.index}) - ${empresa.status}`);
//     });
//     
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({
//         success: true,
//         empresas: empresasLocais,
//         total: empresasLocais.length
//     }));
// }

server.listen(PORT, () => {
    console.log('🚀 Servidor web iniciado!');
    console.log('📱 App disponível em:');
    console.log(`   http://localhost:${PORT}`);
    console.log('🔗 Proxy API CRF: /api/login.php');
    console.log('🌐 API Real CRF: /api/* (farmasis.crfrs.org.br/ws/fem)');
    console.log('📋 Downloads e funcionalidades disponíveis');
    console.log('📋 Para parar o servidor, pressione Ctrl+C');
});

// Tratamento de erros
server.on('error', (error) => {
    console.error('❌ Erro no servidor:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
    });
}); 