// EXPO_BASE_URL define o caminho onde a versão web é publicada (ex.: /profissional quando fica junto dos outros apps).
// Sem a variável, o app roda na raiz (desenvolvimento local e builds nativos).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
})
