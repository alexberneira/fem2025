# 📊 Documentação da Tela Dashboard

## 🎯 Visão Geral
A tela do Dashboard é a interface principal do sistema CRF App, responsável por gerenciar o download, armazenamento local e visualização de dados das empresas e outras entidades do sistema CRF.

## 🌐 Endpoints Utilizados

### 1. **API de Empresas** - `/api/empresas`
- **Método:** POST
- **Parâmetros:** `iduser` (ID do usuário logado)
- **Endpoint Real:** `https://farmasis.crfrs.org.br/ws/fem/meta-lista.php`
- **Função:** Baixa a lista de empresas associadas ao usuário
- **Resposta Esperada:** 
  ```json
  {
    "msg": "sucesso",
    "0": {"idempresa": "517798", "nome": "...", "idmeta": "...", ...},
    "1": {"idempresa": "...", "nome": "...", "idmeta": "...", ...}
  }
  ```

### 2. **API de Sincronização** - `/api/sincronizar`
- **Método:** POST
- **Função:** Sincroniza dados locais com o servidor
- **Resposta:** `{"success": true/false}`

### 3. **APIs de Dados Complementares**
O dashboard também baixa dados de outras APIs para armazenamento local:

- **Configuração de Termos:** `/api/config-termo` → `/campostv-json.php`
- **Histórico de RTs:** `/api/rts-historico` → `/rts-hist-json.php`
- **Tipos de Inspeção:** `/api/tipos-inspecao` → `/tipos-inspecao-json.php`
- **Histórico de Inspeções:** `/api/inspecoes-historico` → `/inspecoes-hist-json.php`
- **Protocolos:** `/api/protocolos` → `/protocolos-json.php`
- **Afastamentos:** `/api/afastamentos` → `/afastamentos-json.php`
- **Histórico de RTs:** `/api/historico-rts` → `/historico-rts-json.php`
- **Denúncias:** `/api/denuncias` → `/denuncias-json.php`
- **Outros Profissionais:** `/api/outros-profissionais` → `/outros-profissionais-json.php`
- **Outros Vínculos:** `/api/outros-vinculos` → `/outros-vinculos-json.php`
- **Processos Éticos:** `/api/processos-eticos` → `/processos-eticos-json.php`

## 💾 Tabelas Locais (localStorage)

### 1. **Tabela Principal: `empresas`**
```javascript
localStorage.setItem('empresas', JSON.stringify(empresas));
localStorage.setItem('empresas_timestamp', Date.now().toString());
```

**Estrutura de Dados:**
```json
[
  {
    "idempresa": "517798",
    "nome": "Nome da Empresa",
    "idmeta": "1306902",
    "cidade": "Nome da Cidade",
    "status": "Ativo",
    "latitude": "-30.123456",
    "longitude": "-51.123456",
    "realizado": false,
    "razao": "Razão Social",
    "inscrpj": "557851",
    "datageracaocr": "2025-07-23"
  }
]
```

**Campos Principais:**
- `idempresa`: Identificador único da empresa
- `nome`: Nome da empresa
- `idmeta`: Número da meta associada
- `cidade`: Cidade da empresa
- `status`: Status atual da empresa
- `latitude/longitude`: Coordenadas geográficas
- `realizado`: Flag para controle de inspeção (padrão: false)
- `inscrpj`: Inscrição estadual
- `datageracaocr`: Data de geração do CR

### 2. **Tabelas de Dados Complementares**
Cada tipo de dado é armazenado com timestamp para controle de sincronização:

```javascript
// Configuração de Termos
localStorage.setItem('config_termo', JSON.stringify(configData));
localStorage.setItem('config_termo_timestamp', Date.now().toString());

// Histórico de RTs
localStorage.setItem('rts_historico', JSON.stringify(rtsData));
localStorage.setItem('rts_historico_timestamp', Date.now().toString());

// Tipos de Inspeção
localStorage.setItem('tipos_inspecao', JSON.stringify(tiposData));
localStorage.setItem('tipos_inspecao_timestamp', Date.now().toString());

// Histórico de Inspeções
localStorage.setItem('inspecoes_historico', JSON.stringify(inspecoesData));
localStorage.setItem('inspecoes_historico_timestamp', Date.now().toString());

// Protocolos
localStorage.setItem('protocolos', JSON.stringify(protocolosData));
localStorage.setItem('protocolos_timestamp', Date.now().toString());

// Afastamentos
localStorage.setItem('afastamentos', JSON.stringify(afastamentosData));
localStorage.setItem('afastamentos_timestamp', Date.now().toString());

// Histórico de RTs
localStorage.setItem('historico_rts', JSON.stringify(historicoRtsData));
localStorage.setItem('historico_rts_timestamp', Date.now().toString());

// Denúncias
localStorage.setItem('denuncias', JSON.stringify(denunciasData));
localStorage.setItem('denuncias_timestamp', Date.now().toString());

// Outros Profissionais
localStorage.setItem('outros_profissionais', JSON.stringify(profissionaisData));
localStorage.setItem('outros_profissionais_timestamp', Date.now().toString());

// Outros Vínculos
localStorage.setItem('outros_vinculos', JSON.stringify(vinculosData));
localStorage.setItem('outros_vinculos_timestamp', Date.now().toString());

// Processos Éticos
localStorage.setItem('processos_eticos', JSON.stringify(processosData));
localStorage.setItem('processos_eticos_timestamp', Date.now().toString());
```

## 🔄 Funcionalidades Principais

### 1. **Download de Empresas**
- Baixa lista de empresas do usuário logado
- Armazena no localStorage com timestamp
- Adiciona campo `realizado: false` para controle de inspeção

### 2. **Listagem de Empresas Locais**
- Exibe empresas armazenadas localmente
- Mostra informações formatadas: ID, Meta, Cidade, Status, Inspeção, Coordenadas
- Inclui timestamp de quando os dados foram baixados

### 3. **Visualização de Empresas Locais**
- Interface HTML para visualização das empresas
- Grid responsivo com informações detalhadas
- Indicadores visuais para status de inspeção

### 4. **Sincronização de Dados**
- Sincroniza todos os dados locais com o servidor
- Atualiza timestamps de sincronização

## 📱 Interface do Usuário

### **Seções Principais:**
1. **Header:** Logo, nome do usuário e botão de logout
2. **Seção de Boas-vindas:** Título e subtítulo com gradiente
3. **Botões de Ação:**
   - 📥 **BAIXAR EMPRESAS:** Download da lista de empresas
   - 📋 **LISTAR EMPRESAS:** Exibe lista formatada no console
   - 👁️ **VISUALIZAR EMPRESAS LOCAIS:** Interface HTML das empresas
   - 🔄 **SINCRONIZAR DADOS:** Sincronização com servidor

### **Estilo Visual:**
- Design responsivo com grid CSS
- Cores corporativas (azul #007AFF, verde #5abaa3, azul escuro #26397f)
- Sombras e bordas arredondadas
- Ícones para melhor UX

## 🔧 Controle de Estado

### **Flags de Controle:**
- `realizado`: Controla se a inspeção foi realizada
- `timestamp`: Controle de sincronização e cache
- `iduser`: Identificação do usuário logado

### **Validações:**
- Verifica se localStorage está vazio
- Valida formato de resposta da API
- Trata erros de conexão e formato de dados

## 📊 Estrutura de Dados da API

### **Formato de Resposta da API de Empresas:**
```json
{
  "msg": "sucesso",
  "0": {
    "idempresa": "517798",
    "nome": "Nome da Empresa",
    "idmeta": "1306902",
    "cidade": "Nome da Cidade",
    "status": "Ativo",
    "latitude": "-30.123456",
    "longitude": "-51.123456",
    "razao": "Razão Social",
    "inscrpj": "557851",
    "datageracaocr": "2025-07-23"
  },
  "1": {
    // ... próxima empresa
  }
}
```

## 🚀 Fluxo de Funcionamento

1. **Login do Usuário:** Sistema identifica o usuário pelo localStorage
2. **Download Inicial:** Usuário clica em "BAIXAR EMPRESAS"
3. **Chamada API:** Sistema faz POST para `/api/empresas` com `iduser`
4. **Processamento:** Dados são formatados e campo `realizado` é adicionado
5. **Armazenamento:** Dados são salvos no localStorage com timestamp
6. **Visualização:** Usuário pode listar ou visualizar empresas locais
7. **Sincronização:** Sistema sincroniza dados complementares quando necessário

## 🔒 Segurança e Validação

- **CORS:** Configurado para permitir requisições cross-origin
- **Validação de Dados:** Verifica formato de resposta da API
- **Tratamento de Erros:** Captura e exibe erros de forma amigável
- **Logs:** Sistema de logging detalhado para debugging

## 📝 Notas Técnicas

- **localStorage:** Banco de dados local do navegador
- **Timestamp:** Controle de sincronização e cache
- **Fallback:** Sistema de fallback para campos opcionais
- **Responsividade:** Interface adaptável a diferentes tamanhos de tela
- **Performance:** Dados são baixados uma vez e armazenados localmente

