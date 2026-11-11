# Tesourinha Beauty · Painel administrativo

Painel web para a equipe da Associação Tesourinha gerenciar:

- **Visão geral**: agendamentos do dia, movimento da semana, inscrições e candidaturas.
- **Agendamentos**: filtros por período e profissional, mudança de status.
- **Profissionais** e **Serviços**: cadastro, edição e visibilidade no app.
- **Cursos**: turmas, vagas preenchidas e lista de inscritos.
- **Vagas**: publicação de vagas e funil de candidaturas.
- **Usuários**: busca, filtro por perfil e exportação CSV.

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # typecheck + build de produção em dist/
```

No MVP os dados são de exemplo e ficam no `localStorage`. O catálogo vem de `../mobile/src/data` (alias `@shared`).
