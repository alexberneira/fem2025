const https = require('https');
const { CRF_API_CONFIG } = require('../../shared/constants');

class CrfApiService {
    constructor() {
        this.baseUrl = CRF_API_CONFIG.BASE_URL;
    }

    // Função para fazer requisições HTTPS
    async makeRequest(path, method = 'GET', postData = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.crf.gov.br',
                port: 443,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
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
                        reject(new Error('Erro ao processar resposta JSON'));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (postData) {
                req.write(JSON.stringify(postData));
            }
            
            req.end();
        });
    }

    // Buscar configuração do termo
    async buscarConfigTermo() {
        console.log('📋 CONFIG-TERMO: Buscando configuração do termo de inspeção');
        try {
            const data = await this.makeRequest('/api/config-termo');
            console.log('📋 CONFIG-TERMO: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 CONFIG-TERMO: Campos encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ CONFIG-TERMO: Erro:', error.message);
            throw error;
        }
    }

    // Buscar histórico de RTS
    async buscarRtsHistorico(fiscalId) {
        console.log('📋 RTS-HISTORICO: Buscando histórico de RTS para fiscal ID:', fiscalId);
        try {
            const postData = { fiscal_id: fiscalId };
            const data = await this.makeRequest('/api/rts-historico', 'POST', postData);
            console.log('📋 RTS-HISTORICO: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 RTS-HISTORICO: Registros encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ RTS-HISTORICO: Erro:', error.message);
            throw error;
        }
    }

    // Buscar tipos de inspeção
    async buscarTiposInspecao() {
        console.log('📋 TIPOS-INSPECAO: Buscando tipos de inspeção');
        try {
            const data = await this.makeRequest('/api/tipos-inspecao');
            console.log('📋 TIPOS-INSPECAO: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 TIPOS-INSPECAO: Tipos encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ TIPOS-INSPECAO: Erro:', error.message);
            throw error;
        }
    }

    // Buscar histórico de inspeções
    async buscarInspecoesHistorico(fiscalId) {
        console.log('📋 INSPECOES-HISTORICO: Buscando histórico de inspeções para fiscal ID:', fiscalId);
        try {
            const postData = { fiscal_id: fiscalId };
            const data = await this.makeRequest('/api/inspecoes-historico', 'POST', postData);
            console.log('📋 INSPECOES-HISTORICO: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 INSPECOES-HISTORICO: Registros encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ INSPECOES-HISTORICO: Erro:', error.message);
            throw error;
        }
    }

    // Buscar protocolos
    async buscarProtocolos(fiscalId) {
        console.log('📋 PROTOCOLOS: Buscando protocolos para fiscal ID:', fiscalId);
        try {
            const postData = { fiscal_id: fiscalId };
            const data = await this.makeRequest('/api/protocolos', 'POST', postData);
            console.log('📋 PROTOCOLOS: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 PROTOCOLOS: Registros encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ PROTOCOLOS: Erro:', error.message);
            throw error;
        }
    }

    // Buscar afastamentos
    async buscarAfastamentos(fiscalId) {
        console.log('📋 AFASTAMENTOS: Buscando afastamentos para fiscal ID:', fiscalId);
        try {
            const postData = { fiscal_id: fiscalId };
            const data = await this.makeRequest('/api/afastamentos', 'POST', postData);
            console.log('📋 AFASTAMENTOS: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 AFASTAMENTOS: Registros encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ AFASTAMENTOS: Erro:', error.message);
            throw error;
        }
    }

    // Buscar denúncias
    async buscarDenuncias(fiscalId) {
        console.log('📋 DENUNCIAS: Buscando denúncias para fiscal ID:', fiscalId);
        try {
            const postData = { fiscal_id: fiscalId };
            const data = await this.makeRequest('/api/denuncias', 'POST', postData);
            console.log('📋 DENUNCIAS: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 DENUNCIAS: Registros encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ DENUNCIAS: Erro:', error.message);
            throw error;
        }
    }

    // Buscar outros profissionais
    async buscarOutrosProfissionais(fiscalId) {
        console.log('📋 OUTROS-PROFISSIONAIS: Buscando outros profissionais para fiscal ID:', fiscalId);
        try {
            const postData = { fiscal_id: fiscalId };
            const data = await this.makeRequest('/api/outros-profissionais', 'POST', postData);
            console.log('📋 OUTROS-PROFISSIONAIS: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 OUTROS-PROFISSIONAIS: Registros encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ OUTROS-PROFISSIONAIS: Erro:', error.message);
            throw error;
        }
    }

    // Buscar outros vínculos
    async buscarOutrosVinculos(fiscalId) {
        console.log('📋 OUTROS-VINCULOS: Buscando outros vínculos para fiscal ID:', fiscalId);
        try {
            const postData = { fiscal_id: fiscalId };
            const data = await this.makeRequest('/api/outros-vinculos', 'POST', postData);
            console.log('📋 OUTROS-VINCULOS: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 OUTROS-VINCULOS: Registros encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ OUTROS-VINCULOS: Erro:', error.message);
            throw error;
        }
    }

    // Buscar processos éticos
    async buscarProcessosEticos(fiscalId) {
        console.log('📋 PROCESSOS-ETICOS: Buscando processos éticos para fiscal ID:', fiscalId);
        try {
            const postData = { fiscal_id: fiscalId };
            const data = await this.makeRequest('/api/processos-eticos', 'POST', postData);
            console.log('📋 PROCESSOS-ETICOS: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 PROCESSOS-ETICOS: Registros encontrados:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ PROCESSOS-ETICOS: Erro:', error.message);
            throw error;
        }
    }

    // Buscar metas (empresas)
    async buscarMetas(fiscalId) {
        console.log('📋 METAS: Buscando metas para fiscal ID:', fiscalId);
        try {
            const data = await this.makeRequest('/api/metas');
            console.log('📋 METAS: Resposta da API CRF:', data.msg);
            if (data.msg === 'sucesso') {
                console.log('📋 METAS: Empresas encontradas:', data.data.length);
            }
            return data;
        } catch (error) {
            console.error('❌ METAS: Erro:', error.message);
            throw error;
        }
    }
}

module.exports = CrfApiService; 