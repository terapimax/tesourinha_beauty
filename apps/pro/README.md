# Tesourinha Pro

App do **profissional** do Tesourinha Beauty: quem atende os clientes do app gerencia aqui a agenda, os serviços, os horários e os ganhos.

```bash
npm install
npm start          # Expo Go (Android/iOS) ou "w" para a web
npm run typecheck
```

## Telas

| Aba / tela | O que faz |
| --- | --- |
| Boas-vindas, cadastro e login | Cadastro do profissional (especialidade, áreas, bairro, ex-aluno da Associação) |
| Cadastro em análise | Aguarda aprovação da Associação. Na demo há o botão "Simular aprovação" |
| **Hoje** | Cliente atual ou próximo, atalhos, atendimentos a finalizar e agenda do dia |
| **Agenda** | Faixa de dias, atendimentos por dia, horários livres, bloquear ou liberar um dia, novo encaixe |
| Atendimento | Dados do cliente, WhatsApp e ligação, histórico, concluir, "não veio" e cancelar |
| Novo encaixe | Lança um cliente que marcou fora do app, só em horários livres |
| **Serviços** | Liga e desliga os serviços do catálogo, com preço e duração próprios |
| **Ganhos** | Semana ou mês, gráfico, ticket médio, faltas e total por serviço |
| **Perfil** | Prévia do perfil público, horários e folgas, avaliações e dados pessoais |

## Demonstração

Qualquer e-mail e senha em **"Já sou profissional"** entram na conta da Ana Paula (do catálogo), com agenda gerada em torno da data de hoje. **"Quero atender pelo app"** mostra o fluxo de um profissional novo, que começa sem serviços e sem agenda.

Os dados ficam salvos no aparelho (AsyncStorage) em `src/store/pro-store.tsx`. Para ligar ao Supabase, troque as funções desse arquivo por chamadas ao banco. As tabelas e permissões estão em `supabase/migrations/0002_profissional.sql`.

## Código compartilhado com o app do cliente

O design system (`src/theme`, `src/components/ui|screen|logo|calendar.tsx`), os utilitários (`src/lib`) e o catálogo (`src/data`) são **copiados de `apps/mobile`** por `scripts/sync-shared.mjs`. A cópia roda antes de `npm start`, de `npm run typecheck` e do build no Vercel. Faça as alterações sempre no `apps/mobile`.

O código próprio deste app fica em `src/pro`, `src/store`, `src/components/pro.tsx` e `src/app`.
