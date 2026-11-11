# Tesourinha Beauty

**Beleza que transforma vidas.** App de serviços de beleza ligado à Associação Tesourinha: agendamento com profissionais, cursos gratuitos de qualificação, vagas de emprego e perfil do usuário. Inclui painel administrativo web.

| Pasta | O que é | Stack |
| --- | --- | --- |
| [`apps/mobile`](apps/mobile) | App Android e iOS | Expo (React Native) + TypeScript + Expo Router |
| [`apps/admin`](apps/admin) | Painel administrativo (web) | React + Vite + TypeScript |
| [`supabase`](supabase) | Banco, login e regras de acesso | Supabase (Postgres + Auth + Storage) |

O catálogo de exemplo (serviços, profissionais, cursos e vagas) fica em `apps/mobile/src/data/catalog.ts` e é compartilhado com o painel.

## Rodando o app

```bash
cd apps/mobile
npm install
npx expo start          # abra no Expo Go (Android/iOS) ou pressione "w" para a web
```

Para publicar nas lojas use o EAS: `npx eas-cli@latest build --platform all`.

## Rodando o painel

```bash
cd apps/admin
npm install
npm run dev             # http://localhost:5173  (qualquer senha com 4+ caracteres no MVP)
```

## Design

- Paleta: laranja Tesourinha `#FF6A13`, preto `#0B0B0C` e branco, com cinzas do iOS.
- Tipografia do sistema (SF Pro no iOS, Roboto no Android), escala do Human Interface Guidelines.
- Cabeçalho escuro com "folha" clara arredondada, cartões com sombra suave, toques com vibração leve, barra de abas translúcida no iOS.
- Tokens em `apps/mobile/src/theme/index.ts` e `apps/admin/src/index.css`.

## Estado do MVP

O app e o painel funcionam com dados de exemplo salvos no próprio dispositivo/navegador, para validar a experiência antes de ligar o backend.

Próximos passos:
1. Criar o projeto no Supabase e aplicar `supabase/migrations/0001_init.sql`.
2. Trocar o `AppProvider` (mobile) e o `StoreProvider` (admin) por chamadas ao Supabase.
3. Login com Apple/Google, notificações de lembrete (Expo Notifications) e fotos reais via Storage.
4. Pagamento no app (Pix / cartão) e avaliações após o atendimento.
