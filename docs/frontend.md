# Frontend

## Visão geral

O frontend foi desenvolvido com **React 18** e **Vite**, consumindo a API do backend por meio do **Axios**.

## Estrutura principal

A aplicação frontend está localizada em:

```text
src/frontend/src/
```

### Páginas públicas

- `pages/Login` — autenticação por SIAPE e senha
- `pages/RecuperarSenha` — fluxo de redefinição de senha em três etapas

### Páginas autenticadas (gestores)

- `pages/Dashboard` — visão geral com estatísticas, filtros e listagem de planos
- `pages/PlanosRisco` — listagem paginada com busca avançada e exportação em lote
- `pages/NovoPlano` — formulário de criação de plano de risco
- `pages/EditarPlano` — edição de plano existente
- `pages/VisualizarPlano` — detalhe do plano com exportação PDF/Excel
- `pages/MapaRisco` — matriz de probabilidade × impacto e analytics
- `pages/GestaoEquipe` — gerenciamento de membros por unidade
- `pages/Perfil` — edição de dados do usuário

### Páginas exclusivas para superusuário

- `pages/Dashboard` (modo admin) — painel administrativo com atalhos e estatísticas globais
- `pages/GestaoUsuarios` — listagem, criação, desativação e reativação de gestores
- `pages/UnidadesAdmin` — consulta paginada da estrutura institucional da UFSM

## Controle de acesso

O acesso às rotas autenticadas é controlado pelo componente `ProtectedRoute`, que lê o estado do `AuthContext`. Se o usuário não estiver autenticado, é redirecionado para `/login`.

Páginas exclusivas para superusuário (como `GestaoUsuarios` e `UnidadesAdmin`) verificam `is_superuser` internamente e redirecionam para `/dashboard` se o perfil não for adequado.

### Cargo e permissões de equipe

O campo `cargo` do usuário (`gestor` ou `gestor_adm`) controla a visibilidade dos controles de equipe na página `GestaoEquipe`:

- **Gestor**: visualiza os membros da equipe, mas não vê o formulário de adição nem o botão de remoção.
- **Gestor Administrador**: pode adicionar e remover membros da equipe.
- **Superusuário**: acesso irrestrito.

## Dashboard administrativo

Quando um superusuário acessa `/dashboard`, o sistema exibe um painel administrativo distinto do dashboard comum. Ele contém:

- boas-vindas com o nome do usuário;
- cards com estatísticas globais (gestores cadastrados, planos de risco, riscos críticos);
- atalhos para as áreas de gestão: usuários, unidades, planos e mapa de riscos.

## Soft delete na interface

Registros desativados (riscos, planos de ação, monitoramentos, usuários) não aparecem nas listagens comuns. Na página `GestaoUsuarios`, usuários inativos são exibidos com badge "Inativo" e podem ser reativados pelo administrador.

## Comunicação com a API

O frontend utiliza um cliente Axios centralizado em:

```text
src/frontend/src/services/api.js
```

Esse cliente:

- usa `/api` como base;
- envia token automaticamente nas rotas protegidas via header `Authorization: Token <token>`;
- não envia `Authorization` nas rotas públicas (login, recuperação de senha e listagem de setores);
- redireciona para `/login` automaticamente em caso de resposta `401`.

## Contextos globais

| Contexto          | Responsabilidade                                                   |
|-------------------|--------------------------------------------------------------------|
| `AuthContext`     | Estado do usuário autenticado, `updateUser()` e `logout()`         |
| `ThemeContext`    | Tema claro/escuro, persiste em `localStorage`                      |
| `FeedbackContext` | Toast global de feedback (sucesso, erro, informação)               |

## Utilitários

| Arquivo                  | Função                                                        |
|--------------------------|---------------------------------------------------------------|
| `utils/unidades.js`      | Formata labels de unidades organizacionais                    |
| `utils/categorias.js`    | Lista canônica de categorias de risco (espelho do backend)    |
| `utils/downloadFile.js`  | Dispara o download de arquivos Blob (PDF, Excel)              |
| `utils/getApiErrorMessage.js` | Traduz erros da API para mensagens amigáveis            |
