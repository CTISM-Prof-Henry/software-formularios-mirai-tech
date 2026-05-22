# API

## Visao geral

O backend expoe uma API REST organizada em dois grandes grupos:

- `/api/usuarios/`
- `/api/riscos/`

O projeto utiliza **Token Authentication** com Django REST Framework. Algumas rotas sao publicas, especialmente login, registro, recuperacao de senha e listagem de unidades.

Uma coleção Postman com todos os endpoints esta disponivel na raiz do repositorio:

```text
Gestao_Risco_UFSM.postman_collection.json
```

Importe-a diretamente no Postman para testar a API com exemplos prontos de corpo e headers.

---

## Rotas de usuarios

### Autenticacao e cadastro

- `POST /api/usuarios/login/`
  - autentica um usuario com `siape` e `senha`;
  - retorna o token de acesso.

- `POST /api/usuarios/registro/`
  - cadastra um novo usuario com `siape`, `nome`, `email`, `senha` e lista de `setores`.

- `GET /api/usuarios/setores/`
  - lista as unidades/departamentos disponiveis para selecao no cadastro;
  - endpoint publico, nao exige autenticacao.

- `GET /api/usuarios/me/`
  - retorna os dados do usuario autenticado (nome, siape, email, setores).

- `PATCH /api/usuarios/me/`
  - atualiza e-mail, unidades e senha do usuario autenticado.

Observacoes:

- a rota continua como `setores` por compatibilidade com o frontend e com integracoes ja existentes, mas o recurso retornado representa **unidades/departamentos da UFSM**;
- para administradores do sistema, existe tambem `GET /api/usuarios/setores/admin/`, com busca, filtros e paginacao.

#### Parametros de filtro — `GET /api/usuarios/setores/admin/`

| Parametro | Tipo   | Descricao                                           |
|-----------|--------|-----------------------------------------------------|
| `termo`   | string | Busca por nome, sigla ou label da unidade           |
| `centro`  | string | Filtra pelo campo `sigla_centro`                    |
| `tipo`    | string | Filtra pelo campo `tipo_unidade`                    |
| `page`    | int    | Numero da pagina (default: 1)                       |
| `page_size` | int  | Itens por pagina (default: 20)                      |

---

### Recuperacao de senha

- `POST /api/usuarios/recuperar-senha/enviar/`
  - envia o codigo de recuperacao para o siape informado.

- `POST /api/usuarios/recuperar-senha/validar/`
  - valida o codigo recebido.

- `POST /api/usuarios/recuperar-senha/redefinir/`
  - redefine a senha com o codigo validado.

---

### Gestao de equipe por unidade

- `GET /api/usuarios/setores/{id}/membros/`
  - lista os membros vinculados ao setor.

- `POST /api/usuarios/setores/{id}/adicionar_membro/`
  - adiciona um usuario ao setor pelo `siape`.

- `POST /api/usuarios/setores/{id}/remover_membro/`
  - remove um usuario do setor pelo `siape`.

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
  - lista os planos de risco com suporte a filtros, busca e paginacao.

- `POST /api/riscos/planos/`
  - cria um novo plano de risco.

- `GET /api/riscos/planos/{id}/`
  - retorna um plano especifico com todos os detalhes.

- `PATCH /api/riscos/planos/{id}/`
  - atualiza campos de um plano existente (apenas do setor do usuario).

- `DELETE /api/riscos/planos/{id}/`
  - remove um plano (apenas do setor do usuario).

#### Parametros de filtro — `GET /api/riscos/planos/`

| Parametro     | Tipo   | Descricao                                                 |
|---------------|--------|-----------------------------------------------------------|
| `search`      | string | Busca por nome do risco, descricao ou categoria           |
| `setor`       | int    | Filtra pelo ID da unidade/setor                           |
| `categoria`   | string | Filtra pela categoria do risco                            |
| `data_inicio` | date   | Filtra planos com data de inicio >= valor (formato ISO)   |
| `data_fim`    | date   | Filtra planos com data de fim <= valor (formato ISO)      |
| `ordenacao`   | string | Campo de ordenacao (ex: `-nivel_residual`, `nome_risco`)  |
| `page`        | int    | Numero da pagina (default: 1)                             |
| `page_size`   | int    | Itens por pagina (default: 10)                            |

---

### Dashboard gerencial

- `GET /api/riscos/planos/dashboard/`
  - retorna dados consolidados do sistema para exibicao na dashboard.

#### Parametros de filtro — `GET /api/riscos/planos/dashboard/`

| Parametro     | Tipo   | Descricao                                              |
|---------------|--------|--------------------------------------------------------|
| `setor`       | int    | Filtra dados pelo ID da unidade                        |
| `data_inicio` | date   | Filtra planos criados a partir dessa data              |
| `data_fim`    | date   | Filtra planos criados ate essa data                    |
| `search`      | string | Busca textual sobre os planos                          |

#### Estrutura da resposta

```json
{
  "total_planos": 42,
  "riscos_criticos": 7,
  "tratamentos_ativos": 18,
  "minhas_unidades": 2,
  "planos": [...]
}
```

---

### Mapa de riscos (analytics)

- `GET /api/riscos/planos/mapa-analytics/`
  - retorna dados analiticos para o mapa de riscos.

#### Parametros de filtro — `GET /api/riscos/planos/mapa-analytics/`

| Parametro   | Tipo   | Descricao                               |
|-------------|--------|-----------------------------------------|
| `setor`     | int    | Filtra pelo ID da unidade               |
| `categoria` | string | Filtra pela categoria do risco          |

#### Estrutura da resposta

```json
{
  "matriz": [...],
  "distribuicao_categorias": [...],
  "ranking_unidades": [...],
  "riscos_prioritarios": [...],
  "resumo_gerencial": {...}
}
```

---

### Estatisticas resumidas

- `GET /api/riscos/planos/estatisticas/`
  - retorna contagens rapidas de riscos por nivel para o cabecalho do sistema.

---

### Exportacoes

- `GET /api/riscos/planos/exportar-excel/`
  - exporta a lista filtrada de planos em formato Excel (`.xlsx`).
  - aceita os mesmos parametros de filtro da listagem.

- `GET /api/riscos/planos/{id}/exportar-excel/`
  - exporta o plano individual em formato Excel.

- `GET /api/riscos/planos/{id}/exportar-pdf/`
  - exporta o plano individual em formato PDF.

---

### Planos de acao e monitoramentos

- `GET|POST /api/riscos/acoes/`
  - lista e cria planos de acao vinculados a um risco.

- `GET|PATCH|DELETE /api/riscos/acoes/{id}/`
  - detalha, atualiza ou remove um plano de acao especifico.

- `GET|POST /api/riscos/monitoramentos/`
  - lista e cria registros de monitoramento vinculados a um risco.

- `GET|PATCH|DELETE /api/riscos/monitoramentos/{id}/`
  - detalha, atualiza ou remove um monitoramento especifico.

---

## Observacoes importantes

- a listagem de unidades (`/api/usuarios/setores/`) e publica e nao exige autenticacao;
- a listagem administrativa de unidades exige usuario com `is_superuser = true`;
- as rotas de perfil, planos, dashboard, mapa e exportacoes exigem token valido;
- a edicao de riscos respeita o vinculo do usuario com a unidade correspondente (permissao `PertenceAoSetorDoRisco`);
- os campos `nivel_risco` e `nivel_residual` sao calculados automaticamente pelo backend no `save()` do model.
