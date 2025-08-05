# Documentação do Projeto FEM - App de Fiscalização

## 📁 Estrutura do Projeto

```
FEM2025/
├── 📁 ios/                    # Configurações nativas iOS
├── 📁 android/                # Configurações nativas Android
├── 📁 node_modules/           # Dependências instaladas
├── 📁 __tests__/              # Testes automatizados
├── 📁 .bundle/                # Cache do Metro bundler
├── 📄 App.tsx                 # Componente principal do app
├── 📄 index.js                # Entry point do React Native
├── 📄 package.json            # Configurações e dependências
├── 📄 package-lock.json       # Versões exatas das dependências
├── 📄 metro.config.js         # Configuração do Metro bundler
├── 📄 babel.config.js         # Configuração do Babel
├── 📄 tsconfig.json           # Configuração do TypeScript
├── 📄 app.json                # Configurações do app
├── 📄 .eslintrc.js            # Regras de linting
├── 📄 .prettierrc.js          # Formatação de código
├── 📄 .gitignore              # Arquivos ignorados pelo Git
├── 📄 .watchmanconfig         # Configuração do Watchman
├── 📄 jest.config.js          # Configuração de testes
└── 📄 README.md               # Documentação do projeto
```

## 📄 Arquivos Principais

### **App.tsx** - Componente Principal
```typescript
// Arquivo principal do aplicativo
// Contém a estrutura básica do app
// Usa TypeScript para tipagem
```

**Função:** Componente raiz do aplicativo que renderiza a interface principal.

### **index.js** - Entry Point
```javascript
// Ponto de entrada do React Native
// Registra o componente App no AppRegistry
```

**Função:** Arquivo que inicializa o aplicativo React Native.

### **package.json** - Configurações do Projeto
```json
{
  "name": "FEMApp",
  "version": "0.0.1",
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

**Função:** Define dependências, scripts e metadados do projeto.

## ⚙️ Arquivos de Configuração

### **metro.config.js** - Metro Bundler
```javascript
// Configuração do Metro bundler
// Responsável por empacotar o código JavaScript
// Gerencia assets (imagens, fontes, etc.)
```

**Função:** Configura como o Metro bundler processa e empacota o código.

### **babel.config.js** - Babel
```javascript
// Configuração do Babel
// Transpila JavaScript moderno para compatível
// Processa JSX e TypeScript
```

**Função:** Configura a transpilação de código moderno para versões compatíveis.

### **tsconfig.json** - TypeScript
```json
{
  "extends": "@react-native/typescript-config/tsconfig.json"
}
```

**Função:** Define regras de tipagem e compilação do TypeScript.

### **app.json** - Configurações do App
```json
{
  "name": "FEMApp",
  "displayName": "FEMApp"
}
```

**Função:** Metadados do aplicativo (nome, versão, etc.).

## 📁 Pastas Nativas

### **📁 ios/** - Configurações iOS
```
ios/
├── FEMApp.xcodeproj/          # Projeto Xcode
├── FEMApp.xcworkspace/        # Workspace Xcode
├── FEMApp/                    # Código nativo iOS
│   ├── AppDelegate.mm         # Delegate principal
│   ├── Info.plist             # Configurações do app
│   └── LaunchScreen.storyboard # Tela de carregamento
└── Podfile                    # Dependências CocoaPods
```

**Função:** Contém todo o código nativo iOS, configurações do Xcode e dependências.

### **📁 android/** - Configurações Android
```
android/
├── app/                       # Módulo principal Android
│   ├── src/                   # Código fonte Android
│   ├── build.gradle           # Configuração do módulo
│   └── proguard-rules.pro     # Regras de ofuscação
├── gradle/                    # Configurações Gradle
├── build.gradle               # Configuração do projeto
└── settings.gradle            # Configuração de módulos
```

**Função:** Contém todo o código nativo Android, configurações do Gradle e dependências.

## 🛠️ Arquivos de Desenvolvimento

### **.eslintrc.js** - Linting
```javascript
// Regras de qualidade de código
// Identifica problemas e inconsistências
// Mantém padrão de código
```

**Função:** Define regras para manter qualidade e consistência do código.

### **.prettierrc.js** - Formatação
```javascript
// Configuração de formatação automática
// Mantém estilo consistente
// Integra com ESLint
```

**Função:** Configura formatação automática do código.

### **.gitignore** - Controle de Versão
```gitignore
# Ignora arquivos desnecessários
node_modules/
build/
*.log
```

**Função:** Define quais arquivos o Git deve ignorar.

### **jest.config.js** - Testes
```javascript
// Configuração do Jest
// Framework de testes
// Testes unitários e de integração
```

**Função:** Configura o ambiente de testes automatizados.

## 📦 Dependências Principais

### **Runtime**
- **react@19.1.0** - Biblioteca principal do React
- **react-native@0.80.2** - Framework React Native
- **@react-native/new-app-screen@0.80.2** - Tela padrão

### **Desenvolvimento**
- **typescript@5.0.4** - Suporte a TypeScript
- **@babel/core@7.28.0** - Transpilação de código
- **eslint@8.57.1** - Análise de código
- **prettier@2.8.8** - Formatação de código
- **jest@29.7.0** - Framework de testes

### **Ferramentas**
- **@react-native-community/cli@19.1.1** - CLI do React Native
- **metro@0.82.5** - Bundler JavaScript
- **@react-native/metro-config@0.80.2** - Configuração Metro

## 🚀 Scripts Disponíveis

```bash
npm start          # Inicia o Metro bundler
npm run ios        # Executa no simulador iOS (macOS)
npm run android    # Executa no emulador Android
npm test           # Executa testes
npm run lint       # Verifica qualidade do código
```

## 🔧 Fluxo de Desenvolvimento

1. **Metro Bundler** (`npm start`)
   - Empacota código JavaScript
   - Hot reload para desenvolvimento
   - Servidor na porta 8081

2. **Compilação Nativa**
   - iOS: Xcode compila código nativo
   - Android: Gradle compila código nativo

3. **Bridge React Native**
   - Comunicação entre JavaScript e nativo
   - APIs nativas (câmera, GPS, etc.)

## 📱 Funcionalidades Futuras (FEM App)

### **Funcionalidades Planejadas**
- ✅ **Sincronização offline** - WatermelonDB
- ✅ **Câmera** - Fotos de fiscalização
- ✅ **GPS** - Geolocalização
- ✅ **Assinatura digital** - Relatórios
- ✅ **Navegação** - React Navigation
- ✅ **API REST** - Comunicação com servidor

### **Estrutura de Pastas Futura**
```
src/
├── components/     # Componentes reutilizáveis
├── screens/        # Telas do aplicativo
├── navigation/     # Configuração de navegação
├── services/       # Serviços (API, sincronização)
├── models/         # Modelos de dados
├── utils/          # Funções utilitárias
└── assets/         # Imagens, fontes, etc.
```

## 🎯 Status Atual

- ✅ **Projeto criado** com React Native 0.80.2
- ✅ **TypeScript configurado** para tipagem
- ✅ **Metro bundler funcionando** na porta 8081
- ✅ **Estrutura nativa** iOS e Android pronta
- ✅ **Configurações de qualidade** (ESLint, Prettier)
- ✅ **Ambiente de testes** configurado

**Próximo passo:** Implementar funcionalidades específicas do app de fiscalização. 