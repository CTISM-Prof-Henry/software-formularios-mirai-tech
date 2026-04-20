# Frontend

## Visão geral

O frontend foi desenvolvido com **React 18** e **Vite**, consumindo a API do backend por meio do **Axios**.

## Estrutura principal

A aplicação frontend está localizada em:

```text
src/frontend/src/
```

As principais áreas do frontend incluem:

- `pages/Login`
- `pages/Cadastro`
- `pages/RecuperarSenha`
- `pages/Dashboard`
- `pages/Perfil`
- `pages/NovoPlano`
- `pages/EditarPlano`
- `pages/VisualizarPlano`
- `pages/PlanosRisco`
- `pages/GestaoEquipe`

## Comportamento atual

Entre os comportamentos implementados no frontend, destacam-se:

- autenticação por token;
- cadastro de usuários com seleção de múltiplos setores;
- busca e rolagem no seletor de setores do cadastro;
- dashboard com visão geral do sistema;
- criação, edição e visualização de planos de risco;
- recuperação de senha em múltiplas etapas.

## Comunicação com a API

O frontend utiliza um cliente Axios centralizado em:

```text
src/frontend/src/services/api.js
```

Esse cliente:

- usa `/api` como base;
- envia token automaticamente nas rotas protegidas;
- não envia `Authorization` em rotas públicas como login, registro, setores e recuperação de senha.
