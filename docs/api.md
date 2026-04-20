# API

## Visão geral

O backend expõe uma API REST organizada em dois grandes grupos:

- `/api/usuarios/`
- `/api/riscos/`

O projeto utiliza **Token Authentication** com Django REST Framework. Algumas rotas são públicas, especialmente login, registro, recuperação de senha e listagem de setores.

## Rotas de usuários

### Autenticação e cadastro

- `POST /api/usuarios/login/`
  - autentica um usuário com `siape` e `senha`;
- `POST /api/usuarios/registro/`
  - cadastra um novo usuário;
- `GET /api/usuarios/setores/`
  - lista os setores disponíveis para seleção no cadastro;
- `GET /api/usuarios/me/`
  - retorna os dados do usuário autenticado;
- `PATCH /api/usuarios/me/`
  - atualiza e-mail, setores e senha.

### Recuperação de senha

- `POST /api/usuarios/recuperar-senha/enviar/`
- `POST /api/usuarios/recuperar-senha/validar/`
- `POST /api/usuarios/recuperar-senha/redefinir/`

### Gestão de equipe por setor

- `GET /api/usuarios/setores/{id}/membros/`
- `POST /api/usuarios/setores/{id}/adicionar_membro/`
- `POST /api/usuarios/setores/{id}/remover_membro/`

## Rotas de riscos

As rotas principais do módulo de riscos são:

- `GET|POST /api/riscos/desafios/`
- `GET|POST /api/riscos/objetivos/`
- `GET|POST /api/riscos/macroprocessos/`
- `GET|POST /api/riscos/planos/`
- `GET|POST /api/riscos/acoes/`
- `GET|POST /api/riscos/monitoramentos/`

## Observações importantes

- a listagem de setores é pública e não exige autenticação;
- as rotas de perfil e edição exigem token válido;
- a listagem de planos de risco possui filtros e paginação;
- a edição de riscos respeita o vínculo do usuário com o setor correspondente.
