# Tesourinha Beauty

**Beleza que transforma vidas.** App de serviços de beleza ligado à Associação Tesourinha: agendamento com profissionais, cursos gratuitos de qualificação, vagas de emprego e perfil do usuário. Inclui um app separado para os profissionais e um painel administrativo web.

| Pasta | O que é | Stack |
| --- | --- | --- |
| [`apps/mobile`](apps/mobile) | App do cliente (Android e iOS) | Expo (React Native) + TypeScript + Expo Router |
| [`apps/pro`](apps/pro) | **Tesourinha Pro**: app do profissional (agenda, serviços, horários, ganhos) | Expo (React Native) + TypeScript + Expo Router |
| [`apps/admin`](apps/admin) | Painel administrativo (web) | React + Vite + TypeScript |
| [`supabase`](supabase) | Banco, login e regras de acesso | Supabase (Postgres + Auth + Storage) |

O catálogo de exemplo (serviços, profissionais, cursos e vagas) fica em `apps/mobile/src/data/catalog.ts` e é compartilhado com o painel e com o app do profissional. O app do profissional também copia o design system do app do cliente (ver [`apps/pro/README.md`](apps/pro/README.md)).

## Rodando o app

```bash
cd apps/mobile
npm install
npx expo start          # abra no Expo Go (Android/iOS) ou pressione "w" para a web
```

Para publicar nas lojas use o EAS: `npx eas-cli@latest build --platform all`.

## Rodando o app do profissional

```bash
cd apps/pro
npm install
npm start               # "Já sou profissional" + qualquer e-mail/senha = conta demo com agenda
```

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
1. Criar o projeto no Supabase e aplicar `supabase/migrations/0001_init.sql` e `0002_profissional.sql`.
2. Trocar o `AppProvider` (mobile), o `ProProvider` (pro) e o `StoreProvider` (admin) por chamadas ao Supabase. Com isso, o agendamento feito pelo cliente aparece na agenda do profissional.
3. No painel, fila de aprovação dos cadastros de profissionais (campo `professionals.status`).
4. Login com Apple/Google, notificações (novo agendamento para o profissional, lembrete para o cliente) e fotos reais via Storage.
5. Pagamento no app (Pix / cartão) e avaliações após o atendimento.

## Publicar no Vercel (demo)

O repositório já tem `vercel.json` nas três pastas. No Vercel, importe o repositório **uma vez para cada app**, mudando só o *Root Directory*:

| Projeto no Vercel | Root Directory | O que publica |
| --- | --- | --- |
| `tesourinha-app` | `apps/mobile` | versão web do app do cliente (centralizada com largura de celular) |
| `tesourinha-pro` | `apps/pro` | versão web do app do profissional |
| `tesourinha-admin` | `apps/admin` | painel administrativo |

As demais configurações são lidas do `vercel.json`. Cada PR ganha um link de preview automático.
