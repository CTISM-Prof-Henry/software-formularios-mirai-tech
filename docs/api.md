# API

## Visao geral

O backend expoe uma API REST organizada em dois grandes grupos:

- `/api/usuarios/`
- `/api/riscos/`

O projeto utiliza **Token Authentication** com Django REST Framework. Algumas rotas sao publicas, especialmente login, registro, recuperacao de senha e listagem de unidades.

## Rotas de usuarios

### Autenticacao e cadastro

- `POST /api/usuarios/login/`
  - autentica um usuario com `siape` e `senha`;
- `POST /api/usuarios/registro/`
  - cadastra um novo usuario;
- `GET /api/usuarios/setores/`
  - lista as unidades/departamentos disponiveis para selecao no cadastro;
- `GET /api/usuarios/me/`
  - retorna os dados do usuario autenticado;
- `PATCH /api/usuarios/me/`
  - atualiza e-mail, unidades e senha.

Observacoes:

- a rota continua como `setores` por compatibilidade com o frontend e com integracoes ja existentes, mas o recurso retornado representa **unidades/departamentos da UFSM**;
- para administradores do sistema, existe tambem `GET /api/usuarios/setores/admin/`, com busca, filtros e paginacao.

### Recuperacao de senha

- `POST /api/usuarios/recuperar-senha/enviar/`
- `POST /api/usuarios/recuperar-senha/validar/`
- `POST /api/usuarios/recuperar-senha/redefinir/`

### Gestao de equipe por unidade

- `GET /api/usuarios/setores/{id}/membros/`
- `POST /api/usuarios/setores/{id}/adicionar_membro/`
- `POST /api/usuarios/setores/{id}/remover_membro/`

## Rotas de riscos

As rotas principais do modulo de riscos sao:

- `GET|POST /api/riscos/desafios/`
- `GET|POST /api/riscos/objetivos/`
- `GET|POST /api/riscos/macroprocessos/`
- `GET|POST /api/riscos/planos/`
- `GET|POST /api/riscos/acoes/`
- `GET|POST /api/riscos/monitoramentos/`

## Observacoes importantes

- a listagem de unidades (`/api/usuarios/setores/`) e publica e nao exige autenticacao;
- a listagem administrativa de unidades exige usuario com `is_superuser = true`;
- as rotas de perfil e edicao exigem token valido;
- a listagem de planos de risco possui filtros e paginacao;
- a edicao de riscos respeita o vinculo do usuario com a unidade correspondente.
