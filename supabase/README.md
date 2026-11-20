# Supabase · banco de dados e login

Este é o passo a passo para criar o banco do Tesourinha Beauty. Leva uns 10 minutos e não precisa instalar nada.

## 1. Criar o projeto

1. Entre em [supabase.com](https://supabase.com), faça login (pode ser com o GitHub) e clique em **New project**.
2. Dê o nome `tesourinha-beauty`, escolha uma senha forte para o banco (guarde-a) e a região **South America (São Paulo)**.
3. Espere uns 2 minutos até o projeto ficar pronto.

## 2. Criar as tabelas e os dados de demonstração

1. No menu da esquerda, abra **SQL Editor** e clique em **New query**.
2. Abra o arquivo [`setup-completo.sql`](setup-completo.sql) deste repositório, copie **tudo**, cole no editor e clique em **Run**.
3. Deve aparecer "Success". Em **Table Editor** você verá as tabelas `services`, `professionals`, `courses`, `jobs` etc., já com dados.

> Rode uma única vez em um projeto novo. Se mudar o catálogo de exemplo, rode `node supabase/scripts/generate-seed.mjs` para regenerar os arquivos.

## 3. Facilitar os testes (login sem confirmar e-mail)

Em **Authentication > Sign In / Providers > Email**, desligue **Confirm email**. Assim o cadastro entra direto, sem esperar o e-mail. Ligue de novo antes de abrir o app ao público.

## 4. Pegar as chaves do projeto

Em **Project Settings > API** copie:

- **Project URL**, algo como `https://abcdxyz.supabase.co`
- **Project API keys > `anon` `public`**, a chave pública

Essas duas são seguras para ficar no app (quem protege os dados são as regras de acesso do banco). **Nunca** use nem compartilhe a chave `service_role`.

## 5. Ligar o app

Crie o arquivo `apps/mobile/.env` (ele não vai para o GitHub):

```
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

Sem essas variáveis o app continua funcionando em **modo demonstração**, com dados locais.

Para o Vercel, cadastre as mesmas duas variáveis em **Settings > Environment Variables** do projeto e faça um novo deploy.

## 6. Criar o primeiro administrador

1. Crie uma conta normalmente (no app ou pelo painel).
2. No **SQL Editor**, rode, trocando o e-mail:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'seu@email.com');
```

## Como o banco protege os dados

- Cada pessoa só enxerga os próprios agendamentos, favoritos, inscrições, candidaturas e currículo.
- O catálogo (serviços, profissionais aprovados, cursos publicados e vagas abertas) é público.
- Só administradores gerenciam o catálogo e mudam o papel das pessoas.
- O banco impede dois agendamentos no mesmo horário com o mesmo profissional.

## Arquivos

| Arquivo | O que faz |
| --- | --- |
| `migrations/0001_init.sql` | Tabelas, regras de acesso (RLS) e categorias |
| `migrations/0002_profissional.sql` | Cadastro e agenda do profissional |
| `migrations/0003_catalogo.sql` | Ajustes para o app ler o catálogo, nota automática |
| `migrations/0004_seed_demo.sql` | Dados de demonstração (gerado) |
| `setup-completo.sql` | Todos os anteriores em um arquivo só (gerado) |
