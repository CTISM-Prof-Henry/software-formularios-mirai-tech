# Banco de dados

## Tecnologia utilizada

O sistema utiliza **PostgreSQL 16**, executado localmente por meio do Docker Compose.

## Configuração local

O container do banco é definido em `docker-compose.yml` com:

- banco: `gestao_risco_ufsm`;
- usuário: `postgres`;
- senha: `postgres`;
- porta externa: `5433`;
- porta interna do container: `5432`.

## Conexão usada pelo Django

O backend espera as seguintes variáveis no `.env`:

```env
DATABASE_NAME=gestao_risco_ufsm
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
```

## Estrutura principal

As entidades mais relevantes do sistema incluem:

- `setores`
  - armazena os setores disponíveis para vínculo de usuários e riscos;
- `usuarios`
  - modelo customizado de autenticação com SIAPE;
- `usuario_setores`
  - tabela de relacionamento entre usuários e setores;
- `codigos_recuperacao`
  - armazena os códigos temporários de recuperação de senha;
- tabelas do módulo `riscos`
  - armazenam desafios, objetivos, macroprocessos, planos, ações e monitoramentos.

## Dados iniciais

O projeto possui uma migration de carga inicial para setores. Após executar `python manage.py migrate`, o sistema já cria setores básicos da UFSM para uso no cadastro e no vínculo de usuários.
