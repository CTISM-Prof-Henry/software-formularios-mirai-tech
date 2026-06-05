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
- `pages/Cadastro` — registro de novo usuário (disponível apenas via convite/administrador)
- `pages/RecuperarSenha` — fluxo de redefinição de senha em três etapas

### Páginas autenticadas (gestores)

- `pages/Dashboard` — visão geral com estatísticas, filtros e listagem de planos
- `pages/PlanosRisco` — listagem paginada com busca avançada, filtros, ordenação por nível/prazo e exportação em lote
- `pages/NovoPlano` — formulário de criação de plano de risco
- `pages/EditarPlano` — edição de plano existente com botão de duplicação e exportação de relatório gerencial
- `pages/VisualizarPlano` — detalhe do plano com exportação PDF/Excel, seção de ações de tratamento (com barra de progresso por ação), seção de monitoramentos e histórico de alterações
- `pages/MapaRisco` — matriz de probabilidade × impacto e analytics; riscos identificados por índice sequencial (#1, #2...)
- `pages/GestaoEquipe` — gerenciamento de membros por unidade (título exibido: "Minha Equipe")
- `pages/Perfil` — edição de dados do usuário; campo de departamento/setor bloqueado para gestores comuns (somente leitura, com mensagem orientando a solicitar ao administrador)

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

### Bloqueio por ausência de setor

Quando um gestor é removido de todos os setores, um banner vermelho aparece fixo no topo da tela (componente `Sidebar`) informando que o acesso será bloqueado em N dias. Após 7 dias sem setor, o backend bloqueia o token e o sistema redireciona para `/login`. O campo `sem_equipe_desde` retornado pelo endpoint `/api/usuarios/me/` é usado para calcular o prazo exibido.

## Dashboard administrativo

Quando um superusuário acessa `/dashboard`, o sistema exibe um painel administrativo distinto do dashboard comum. Ele contém:

- boas-vindas com o nome do usuário;
- cards com estatísticas globais (gestores cadastrados, planos de risco, riscos críticos);
- atalhos para as áreas de gestão: usuários, unidades, planos e mapa de riscos.

## Funcionalidades de UX

### Listagem de planos (`PlanosRisco`)

- badges de prazo: destaque visual para ações com data de fim próxima ou vencida
- indicador de completude: pontos coloridos mostrando o percentual de conclusão das ações do plano
- pré-filtro por setor do usuário logado na carga inicial
- ordenação por nível de risco (crescente/decrescente) e por prazo (mais próximo/mais distante)
- busca expandida: pesquisa em evento, causa, consequência, macroprocesso, objetivo e responsável

### Detalhe do plano (`VisualizarPlano`)

- barra de progresso por ação de tratamento
- seção de monitoramentos com criação inline
- histórico de alterações do plano com data, hora e responsável

### Edição do plano (`EditarPlano`)

- botão "Duplicar plano" cria uma cópia completa (risco + ações de tratamento) e redireciona para o novo plano
- botão "Relatório Gerencial" exporta um PDF consolidado com distribuição por categoria, unidade e nível

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

| Arquivo                       | Função                                                        |
|-------------------------------|---------------------------------------------------------------|
| `utils/unidades.js`           | Formata labels de unidades organizacionais                    |
| `utils/categorias.js`         | Lista canônica de categorias de risco (espelho do backend)    |
| `utils/downloadFile.js`       | Dispara o download de arquivos Blob (PDF, Excel)              |
| `utils/getApiErrorMessage.js` | Traduz erros da API para mensagens amigáveis                  |
