# API

## Visao geral

O backend expoe uma API REST organizada em dois grandes grupos:

- `/api/usuarios/`
- `/api/riscos/`

O projeto utiliza **Token Authentication** com Django REST Framework. Rotas publicas sao apenas login, recuperacao de senha e listagem simples de unidades. Todas as demais exigem token valido no header `Authorization: Token <token>`.

Uma coleção Postman com todos os endpoints esta disponivel na raiz do repositorio:

```text
Gestao_Risco_UFSM.postman_collection.json
```

Importe-a diretamente no Postman para testar a API com exemplos prontos de corpo e headers.

---

## Rotas de usuarios

### Autenticacao

- `POST /api/usuarios/login/`
  - autentica um usuario com `siape` e `senha`;
  - retorna o token de acesso e os dados do usuario.

- `GET /api/usuarios/me/`
  - retorna os dados do usuario autenticado (nome, siape, email, setores, cargo, ativo).

- `PATCH /api/usuarios/me/`
  - atualiza e-mail, unidades e senha do usuario autenticado.

---

### Cadastro de gestores (restrito a superusuario)

- `POST /api/usuarios/registro/`
  - cria um novo gestor no sistema;
  - **requer autenticacao e perfil superusuario**;
  - payload: `siape`, `nome`, `email`, `senha`, `id_setores`, `cargo`;
  - campo `cargo`: `"gestor"` (padrao) ou `"gestor_adm"`;
  - retorna os dados do usuario criado (sem token).

---

### Gestao administrativa de usuarios (superusuario only)

- `GET /api/usuarios/gestores/`
  - lista todos os usuarios cadastrados (ativos e inativos);
  - suporta busca por `search` (nome, SIAPE ou e-mail) e paginacao.

- `DELETE /api/usuarios/gestores/{id}/`
  - **soft delete**: desativa o usuario (ativo=False) sem remover do banco;
  - nao e permitido desativar superusuarios ou a propria conta.

- `POST /api/usuarios/gestores/{id}/reativar/`
  - reativa um usuario previamente desativado.

---

### Unidades e equipe

- `GET /api/usuarios/setores/`
  - lista as unidades/departamentos disponiveis;
  - endpoint publico, nao exige autenticacao.

- `GET /api/usuarios/setores/admin/`
  - listagem administrativa completa com busca, filtros e paginacao;
  - requer superusuario.

#### Parametros de filtro — `GET /api/usuarios/setores/admin/`

| Parametro   | Tipo   | Descricao                                 |
|-------------|--------|-------------------------------------------|
| `search`    | string | Busca por nome, sigla ou label da unidade |
| `centro`    | string | Filtra pelo campo `sigla_centro`          |
| `tipo`      | string | Filtra pelo campo `tipo_unidade`          |
| `page`      | int    | Numero da pagina (default: 1)             |
| `page_size` | int    | Itens por pagina (default: 20)            |

- `GET /api/usuarios/setores/{id}/membros/`
  - lista os membros vinculados ao setor.

- `POST /api/usuarios/setores/{id}/adicionar_membro/`
  - adiciona um usuario ao setor pelo `siape`;
  - **requer cargo `gestor_adm` ou superusuario**.

- `POST /api/usuarios/setores/{id}/remover_membro/`
  - remove um usuario do setor;
  - **requer cargo `gestor_adm` ou superusuario**.

---

### Recuperacao de senha

- `POST /api/usuarios/recuperar-senha/enviar/`
  - envia o codigo de recuperacao para o e-mail informado.

- `POST /api/usuarios/recuperar-senha/validar/`
  - valida o codigo recebido (expira em 1 minuto).

- `POST /api/usuarios/recuperar-senha/redefinir/`
  - redefine a senha com o codigo validado.

---

## Rotas de riscos

### Estrutura estrategica (PDI)

- `GET /api/riscos/desafios/`
  - lista os desafios do PDI.

- `GET /api/riscos/objetivos/`
  - lista os objetivos do PDI; filtrados por desafio no frontend.

- `GET /api/riscos/macroprocessos/`
  - lista os macroprocessos vinculaveis a um risco.

---

### Planos de risco (CRUD principal)

- `GET /api/riscos/planos/`
  - lista os planos de risco ativos com suporte a filtros, busca e paginacao;
  - superusuarios podem incluir registros desativados com `?incluir_inativos=true`.

- `POST /api/riscos/planos/`
  - cria um novo plano de risco (apenas para setores do usuario).

- `GET /api/riscos/planos/{id}/`
  - retorna um plano especifico com todos os detalhes.

- `PATCH /api/riscos/planos/{id}/`
  - atualiza campos de um plano existente (apenas do setor do usuario).

- `DELETE /api/riscos/planos/{id}/`
  - **soft delete**: desativa o plano (ativo=False) e propaga a desativacao para PlanoAcao e Monitoramento vinculados;
  - o registro permanece no banco e pode ser consultado por superusuarios.

#### Parametros de filtro — `GET /api/riscos/planos/`

| Parametro          | Tipo    | Descricao                                               |
|--------------------|---------|---------------------------------------------------------|
| `search`           | string  | Busca por evento, causa ou consequencia                 |
| `setor`            | int     | Filtra pelo ID da unidade/setor                         |
| `categoria`        | string  | Filtra pela categoria do risco                          |
| `data_inicio`      | date    | Filtra planos com data de inicio >= valor (ISO)         |
| `data_fim`         | date    | Filtra planos com data de fim <= valor (ISO)            |
| `ordenacao`        | string  | `asc` ou `desc` (padrao: `desc`)                        |
| `page`             | int     | Numero da pagina                                        |
| `incluir_inativos` | boolean | `true` para incluir desativados (somente superusuario)  |

---

### Dashboard gerencial

- `GET /api/riscos/planos/dashboard/`
  - retorna dados consolidados do sistema para exibicao na dashboard.

#### Parametros de filtro — `GET /api/riscos/planos/dashboard/`

| Parametro     | Tipo   | Descricao                          |
|---------------|--------|------------------------------------|
| `setor`       | int    | Filtra dados pelo ID da unidade    |
| `data_inicio` | date   | Filtra planos a partir dessa data  |
| `data_fim`    | date   | Filtra planos ate essa data        |
| `search`      | string | Busca textual sobre os planos      |

---

### Mapa de riscos (analytics)

- `GET /api/riscos/planos/mapa-analytics/`
  - retorna dados analiticos para o mapa de riscos.

#### Parametros de filtro — `GET /api/riscos/planos/mapa-analytics/`

| Parametro   | Tipo   | Descricao                      |
|-------------|--------|--------------------------------|
| `setor`     | int    | Filtra pelo ID da unidade      |
| `categoria` | string | Filtra pela categoria do risco |

---

### Estatisticas resumidas

- `GET /api/riscos/planos/estatisticas/`
  - retorna contagens rapidas de riscos por nivel.

---

### Exportacoes

- `GET /api/riscos/planos/exportar-excel/`
  - exporta a lista filtrada de planos em formato Excel (`.xlsx`).

- `GET /api/riscos/planos/{id}/exportar-excel/`
  - exporta o plano individual em formato Excel.

- `GET /api/riscos/planos/{id}/exportar-pdf/`
  - exporta o plano individual em formato PDF.

---

### Planos de acao e monitoramentos

- `GET|POST /api/riscos/acoes/`
  - lista e cria planos de acao vinculados a um risco.

- `GET|PATCH|DELETE /api/riscos/acoes/{id}/`
  - detalha, atualiza ou desativa (soft delete) um plano de acao.

- `GET|POST /api/riscos/monitoramentos/`
  - lista e cria registros de monitoramento.

- `GET|PATCH|DELETE /api/riscos/monitoramentos/{id}/`
  - detalha, atualiza ou desativa (soft delete) um monitoramento.

---

## Observacoes importantes

- a listagem de unidades (`/api/usuarios/setores/`) e publica e nao exige autenticacao;
- o cadastro de novos usuarios (`/api/usuarios/registro/`) exige superusuario — nao ha auto-cadastro publico;
- adicionar e remover membros de equipe exige `cargo = gestor_adm` ou superusuario;
- operacoes `DELETE` nos recursos de riscos sao **soft delete**: os dados permanecem no banco marcados como `ativo=False`;
- campos `nivel_risco` e `nivel_residual` sao calculados automaticamente pelo backend no `save()` do model;
- a edicao de riscos respeita o vinculo do usuario com a unidade correspondente (permissao `PertenceAoSetorDoRisco`).
