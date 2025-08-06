# FEM App - React Native

## 📱 Aplicativo iOS com testes no navegador

### 🚀 **Como executar:**

#### **Desenvolvimento Web (Testes no Navegador):**
```bash
npm run web
```
Depois acesse: `http://localhost:8081`

#### **Desenvolvimento iOS:**
```bash
npm start
npx react-native run-ios
```

### 📋 **Funcionalidades implementadas:**

- ✅ **Tela de login** moderna e responsiva
- ✅ **Validação de campos** obrigatórios
- ✅ **Estado de loading** com feedback visual
- ✅ **Design limpo** e profissional
- ✅ **Navegação configurada** com React Navigation
- ✅ **TypeScript** configurado

### 🧪 **Como testar:**

1. Execute `npm run web`
2. Acesse `http://localhost:8081`
3. Digite email e senha
4. Clique em "Entrar"
5. Veja o feedback de loading

### 📁 **Estrutura do projeto:**

```
├── src/
│   ├── screens/
│   │   └── LoginScreen.tsx    # Tela de login
│   └── types/
│       └── navigation.ts      # Tipos para navegação
├── server.js                  # Servidor para testes web
├── App.tsx                    # App principal
└── metro.config.js            # Configuração Metro
```

### 🔧 **Tecnologias:**

- **React Native 0.80.2**
- **React Navigation 6**
- **TypeScript**
- **Metro Bundler** (porta 8081)

### 🎯 **Próximos passos:**

1. **Implementar autenticação real**
2. **Adicionar mais telas**
3. **Implementar navegação entre telas**
4. **Configurar para produção iOS**

---

**Status:** ✅ Funcionando e pronto para desenvolvimento!
