# Tesourinha Beauty · App (Android e iOS)

Feito com Expo SDK 58, Expo Router e TypeScript.

```bash
npm install
npx expo start        # Expo Go, emulador ou web
npm run typecheck
```

## Estrutura

- `src/app/` – telas (rotas do Expo Router)
  - `welcome`, `auth` – boas-vindas, cadastro e login
  - `(tabs)/` – Início, Buscar, Agenda, Favoritos, Perfil
  - `services`, `professionals`, `professional/[id]`, `book/[id]`, `booking-success`
  - `courses/`, `jobs/`, `resume`, `association`, `account`, `my/[kind]`, `settings`, `help`
- `src/components/` – design system (`ui.tsx`, `screen.tsx`, `cards.tsx`, `calendar.tsx`, `logo.tsx`)
- `src/theme/` – cores, tipografia, espaçamentos e sombras
- `src/data/` – tipos e catálogo de exemplo (compartilhado com o painel)
- `src/store/` – estado do app persistido com AsyncStorage (será trocado pelo Supabase)
