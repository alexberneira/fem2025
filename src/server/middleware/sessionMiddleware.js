const crypto = require('crypto');
const { SERVER_CONFIG } = require('../../shared/constants');

// Armazenamento de sessões em memória
const sessions = new Map();

class SessionMiddleware {
    // Gerar ID de sessão único
    static generateSessionId() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Verificar se uma sessão é válida
    static verifySession(sessionId) {
        console.log('🔍 SESSION: Verificando sessão:', sessionId);
        console.log('🔍 SESSION: Sessões ativas:', sessions.size);
        
        if (!sessionId || !sessions.has(sessionId)) {
            console.log('❌ SESSION: Sessão inválida ou não encontrada');
            return false;
        }

        const session = sessions.get(sessionId);
        const now = Date.now();
        
        if (now - session.createdAt > SERVER_CONFIG.SESSION_TIMEOUT) {
            console.log('❌ SESSION: Sessão expirada');
            sessions.delete(sessionId);
            return false;
        }

        console.log('✅ SESSION: Sessão válida encontrada');
        return true;
    }

    // Criar nova sessão
    static createSession(userData) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            user: userData,
            createdAt: Date.now()
        };
        
        sessions.set(sessionId, session);
        console.log('✅ LOGIN: Sessão criada:', sessionId);
        console.log('✅ LOGIN: Usuário:', userData.name);
        console.log('✅ LOGIN: Total de sessões:', sessions.size);
        
        return sessionId;
    }

    // Obter dados da sessão
    static getSessionData(sessionId) {
        return sessions.get(sessionId);
    }

    // Remover sessão
    static removeSession(sessionId) {
        if (sessions.has(sessionId)) {
            sessions.delete(sessionId);
            console.log('🗑️ SESSION: Sessão removida:', sessionId);
        }
    }

    // Limpar sessões expiradas
    static cleanupExpiredSessions() {
        const now = Date.now();
        let removedCount = 0;
        
        for (const [sessionId, session] of sessions.entries()) {
            if (now - session.createdAt > SERVER_CONFIG.SESSION_TIMEOUT) {
                sessions.delete(sessionId);
                removedCount++;
            }
        }
        
        if (removedCount > 0) {
            console.log(`🧹 SESSION: ${removedCount} sessões expiradas removidas`);
        }
    }

    // Middleware para verificar autenticação
    static requireAuth(req, res, next) {
        const sessionId = req.headers.authorization;
        
        if (!this.verifySession(sessionId)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                msg: 'erro',
                error: 'Sessão inválida ou expirada',
                message: 'Sessão inválida ou expirada'
            }));
            return;
        }
        
        // Adicionar dados da sessão ao request
        req.session = this.getSessionData(sessionId);
        next();
    }

    // Middleware para páginas que requerem autenticação
    static requireAuthPage(req, res, next) {
        const sessionId = req.headers.authorization;
        
        if (!this.verifySession(sessionId)) {
            // Redirecionar para login se não autenticado
            res.writeHead(302, { 'Location': '/' });
            res.end();
            return;
        }
        
        req.session = this.getSessionData(sessionId);
        next();
    }
}

module.exports = SessionMiddleware; 