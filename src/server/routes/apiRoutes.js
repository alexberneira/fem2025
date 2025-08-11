const https = require('https');
const CrfApiService = require('../services/crfApiService');
const SessionMiddleware = require('../middleware/sessionMiddleware');

class ApiRoutes {
    constructor() {
        this.crfApi = new CrfApiService();
    }

    // Rota para configuração do termo
    async configTermo(req, res) {
        try {
            const data = await this.crfApi.buscarConfigTermo();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 CONFIG-TERMO: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados da configuração',
                message: 'Erro ao processar dados da configuração'
            }));
        }
    }

    // Rota para histórico de RTS
    async rtsHistorico(req, res) {
        try {
            const data = await this.crfApi.buscarRtsHistorico(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 RTS-HISTORICO: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados do histórico RTS',
                message: 'Erro ao processar dados do histórico RTS'
            }));
        }
    }

    // Rota para tipos de inspeção
    async tiposInspecao(req, res) {
        try {
            const data = await this.crfApi.buscarTiposInspecao();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 TIPOS-INSPECAO: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados dos tipos de inspeção',
                message: 'Erro ao processar dados dos tipos de inspeção'
            }));
        }
    }

    // Rota para histórico de inspeções
    async inspecoesHistorico(req, res) {
        try {
            const data = await this.crfApi.buscarInspecoesHistorico(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 INSPECOES-HISTORICO: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados do histórico de inspeções',
                message: 'Erro ao processar dados do histórico de inspeções'
            }));
        }
    }

    // Rota para protocolos
    async protocolos(req, res) {
        try {
            const data = await this.crfApi.buscarProtocolos(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 PROTOCOLOS: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados dos protocolos',
                message: 'Erro ao processar dados dos protocolos'
            }));
        }
    }

    // Rota para afastamentos
    async afastamentos(req, res) {
        try {
            const data = await this.crfApi.buscarAfastamentos(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 AFASTAMENTOS: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados dos afastamentos',
                message: 'Erro ao processar dados dos afastamentos'
            }));
        }
    }

    // Rota para denúncias
    async denuncias(req, res) {
        try {
            const data = await this.crfApi.buscarDenuncias(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 DENUNCIAS: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados das denúncias',
                message: 'Erro ao processar dados das denúncias'
            }));
        }
    }

    // Rota para outros profissionais
    async outrosProfissionais(req, res) {
        try {
            const data = await this.crfApi.buscarOutrosProfissionais(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 OUTROS-PROFISSIONAIS: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados dos outros profissionais',
                message: 'Erro ao processar dados dos outros profissionais'
            }));
        }
    }

    // Rota para outros vínculos
    async outrosVinculos(req, res) {
        try {
            const data = await this.crfApi.buscarOutrosVinculos(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 OUTROS-VINCULOS: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados dos outros vínculos',
                message: 'Erro ao processar dados dos outros vínculos'
            }));
        }
    }

    // Rota para processos éticos
    async processosEticos(req, res) {
        try {
            const data = await this.crfApi.buscarProcessosEticos(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 PROCESSOS-ETICOS: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados dos processos éticos',
                message: 'Erro ao processar dados dos processos éticos'
            }));
        }
    }

    // Rota para metas (empresas)
    async metas(req, res) {
        try {
            const data = await this.crfApi.buscarMetas(31);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log('💥 METAS: Erro ao processar resposta:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Erro ao processar dados das metas',
                message: 'Erro ao processar dados das metas'
            }));
        }
    }

    // Rota para verificar sessão
    session(req, res) {
        const sessionId = req.headers.authorization;
        const isValid = SessionMiddleware.verifySession(sessionId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            valid: isValid,
            sessionId: sessionId
        }));
    }
}

module.exports = ApiRoutes; 