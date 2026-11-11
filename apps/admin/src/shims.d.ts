// O catálogo compartilhado referencia o tipo de ícones do app mobile.
// No painel web basta tratá-lo como string.
declare module '@expo/vector-icons' {
  export const Ionicons: { glyphMap: Record<string, number> }
}
