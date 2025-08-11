// Configurações da API CRF
const CRF_API_CONFIG = {
    BASE_URL: 'https://api.crf.gov.br',
    ENDPOINTS: {
        CONFIG_TERMO: '/api/config-termo',
        RTS_HISTORICO: '/api/rts-historico',
        TIPOS_INSPECAO: '/api/tipos-inspecao',
        INSPECOES_HISTORICO: '/api/inspecoes-historico',
        PROTOCOLOS: '/api/protocolos',
        AFASTAMENTOS: '/api/afastamentos',
        DENUNCIAS: '/api/denuncias',
        OUTROS_PROFISSIONAIS: '/api/outros-profissionais',
        OUTROS_VINCULOS: '/api/outros-vinculos',
        PROCESSOS_ETICOS: '/api/processos-eticos',
        METAS: '/api/metas'
    }
};

// Configurações do servidor
const SERVER_CONFIG = {
    PORT: 8081,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    LOGIN_CREDENTIALS: {
        username: 'alex.berneira@crf.gov.br',
        password: 'FEM2025@'
    }
};

// Configurações de armazenamento
const STORAGE_KEYS = {
    SESSION_ID: 'sessionId',
    CONFIG_TERMO: 'config_termo',
    RTS_HISTORICO: 'rts_historico',
    TIPOS_INSPECAO: 'tipos_inspecao',
    INSPECOES_HISTORICO: 'inspecoes_historico',
    PROTOCOLOS: 'protocolos',
    AFASTAMENTOS: 'afastamentos',
    DENUNCIAS: 'denuncias',
    OUTROS_PROFISSIONAIS: 'outros_profissionais',
    OUTROS_VINCULOS: 'outros_vinculos',
    PROCESSOS_ETICOS: 'processos_eticos',
    EMPRESAS: 'empresas'
};

// Mapeamento de downloads
const DOWNLOAD_MAPPING = [
    { name: 'Configuracao do Termo', endpoint: '/api/config-termo', storageKey: 'config_termo' },
    { name: 'Historico de RTS', endpoint: '/api/rts-historico', storageKey: 'rts_historico' },
    { name: 'Tipos de Inspecao', endpoint: '/api/tipos-inspecao', storageKey: 'tipos_inspecao' },
    { name: 'Historico de Inspecoes', endpoint: '/api/inspecoes-historico', storageKey: 'inspecoes_historico' },
    { name: 'Protocolos', endpoint: '/api/protocolos', storageKey: 'protocolos' },
    { name: 'Afastamentos', endpoint: '/api/afastamentos', storageKey: 'afastamentos' },
    { name: 'Denuncias', endpoint: '/api/denuncias', storageKey: 'denuncias' },
    { name: 'Outros Profissionais', endpoint: '/api/outros-profissionais', storageKey: 'outros_profissionais' },
    { name: 'Outros Vinculos', endpoint: '/api/outros-vinculos', storageKey: 'outros_vinculos' },
    { name: 'Processos Eticos', endpoint: '/api/processos-eticos', storageKey: 'processos_eticos' },
    { name: 'Empresas (Metas)', endpoint: '/api/metas', storageKey: 'empresas' }
];

module.exports = {
    CRF_API_CONFIG,
    SERVER_CONFIG,
    STORAGE_KEYS,
    DOWNLOAD_MAPPING
}; 