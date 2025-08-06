module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/'],
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
        android: null,
      },
    },
  },
  // Configurações de porta
  metro: {
    port: 8081,
  },
}; 