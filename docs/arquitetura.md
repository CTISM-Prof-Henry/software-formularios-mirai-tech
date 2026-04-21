# Arquitetura do projeto

Esta página explica como o projeto **Gestão de Risco UFSM** está organizado e como as partes do sistema conversam entre si. A ideia é servir como um mapa para quem precisa entender, manter ou evoluir a aplicação.

## Visão geral

O sistema usa uma arquitetura web separada em três partes principais:

- **Frontend React/Vite**: interface usada pelos gestores para login, dashboard, planos de risco, mapa de riscos, perfil e gestão de equipe.
- **Backend Django REST Framework**: API responsável por autenticação, regras de negócio, permissões, exportações, seeds e persistência.
- **Banco PostgreSQL**: armazena usuários, setores, dados do PDI, riscos, planos de ação e monitoramentos.

```mermaid
flowchart TD
    usuario["Usuário no navegador"]
    frontend["Frontend React/Vite"]
    axios["Cliente Axios<br/>src/frontend/src/services/api.js"]
    api["API Django REST Framework<br/>/api/"]
    apps["Apps Django<br/>usuarios e riscos"]
    orm["Django ORM"]
    banco["PostgreSQL"]
    exportacoes["Exportações<br/>PDF e Excel"]
    seeds["Seeds e comandos<br/>management/commands"]

    usuario --> frontend
    frontend --> axios
    axios --> api
    api --> apps
    apps --> orm
    orm --> banco
    api --> exportacoes
    apps --> seeds
```

## Organização de pastas

```text
src/
|-- gestao_risco/
|   |-- settings.py
|   |-- urls.py
|   |-- asgi.py
|   `-- wsgi.py
|-- usuarios/
|   |-- models.py
|   |-- serializers.py
|   |-- views.py
|   |-- urls.py
|   |-- management/commands/
|   |-- migrations/
|   `-- tests/
|-- riscos/
|   |-- models.py
|   |-- serializers.py
|   |-- views.py
|   |-- urls.py
|   |-- exporters.py
|   |-- migrations/
|   `-- tests/
`-- frontend/
    `-- src/
        |-- pages/
        |-- components/
        |-- services/
        `-- utils/
```

## Arquitetura Django

O Django organiza o backend em um projeto principal e apps menores:

- **Projeto principal `gestao_risco`**: concentra configurações globais, banco, autenticação, apps instalados e rotas raiz.
- **App `usuarios`**: concentra usuário customizado, setores, autenticação, perfil, recuperação de senha e gestão de equipe.
- **App `riscos`**: concentra PDI, macroprocessos, riscos, planos de ação, monitoramentos, dashboard e exportações.

### Fluxo de uma requisição

Quando o frontend chama uma rota da API, o fluxo principal é:

```mermaid
sequenceDiagram
    participant UI as "React"
    participant Axios as "Axios"
    participant URL as "urls.py"
    participant View as "View / ViewSet"
    participant Serializer as "Serializer"
    participant Model as "Model / ORM"
    participant DB as "PostgreSQL"

    UI->>Axios: chama /api/riscos/planos/
    Axios->>URL: envia token no Authorization
    URL->>View: roteia para o ViewSet
    View->>Model: consulta ou altera dados
    Model->>DB: executa SQL via ORM
    DB-->>Model: retorna registros
    Model-->>Serializer: objetos Django
    Serializer-->>View: JSON validado/formatado
    View-->>Axios: resposta HTTP
    Axios-->>UI: dados para renderizar a tela
```

## Responsabilidade de cada camada

### Models

Os arquivos `models.py` definem as entidades do sistema e as relações com o banco.

No app `usuarios`, os principais models são:

- `Setor`: representa uma unidade administrativa.
- `Usuario`: usuário customizado autenticado por SIAPE e vinculado a múltiplos setores.
- `CodigoRecuperacao`: código temporário usado no fluxo de recuperação de senha.

No app `riscos`, os principais models são:

- `DesafioPDI`, `ObjetivoPDI` e `Macroprocesso`: estrutura estratégica usada para classificar riscos.
- `Risco`: registro principal do plano de risco.
- `PlanoAcao`: tratamento do risco, seguindo a lógica de ação/resposta.
- `Monitoramento`: acompanhamento contínuo de um risco.

### Serializers

Os `serializers.py` traduzem dados entre objetos Django e JSON. Eles também validam payloads recebidos pela API.

Exemplos:

- `UsuarioSerializer` retorna usuário com seus setores.
- `RegistroUsuarioSerializer` recebe senha e lista de setores no cadastro.
- `RiscoSerializer` retorna o risco com detalhes do setor, objetivo e macroprocesso.
- `PlanoAcaoSerializer` serializa as ações de tratamento.

### Views e ViewSets

Os `views.py` recebem requisições HTTP e aplicam as regras da API.

No app `usuarios`, existem endpoints para:

- login;
- registro;
- perfil autenticado;
- recuperação de senha;
- membros de setor;
- adicionar ou remover membros da equipe.

No app `riscos`, existem endpoints para:

- CRUD de riscos;
- listagem de desafios, objetivos e macroprocessos;
- dashboard consolidada;
- estatísticas;
- exportação em PDF e Excel;
- planos de ação e monitoramentos.

### URLs e routers

As rotas raiz ficam em:

```text
src/gestao_risco/urls.py
```

Elas separam a API em dois grupos:

```text
/api/usuarios/
/api/riscos/
```

Cada app possui seu próprio `urls.py`. No app `riscos`, o `DefaultRouter` do Django REST Framework gera rotas REST para `desafios`, `macroprocessos`, `objetivos`, `planos`, `acoes` e `monitoramentos`.

## Autenticação e permissões

O sistema usa **Token Authentication** do Django REST Framework.

O fluxo é:

1. O usuário faz login enviando `siape` e `senha`.
2. O backend retorna um token.
3. O frontend salva o token em `localStorage`.
4. O cliente Axios adiciona `Authorization: Token <token>` nas rotas protegidas.
5. Se a API retornar `401`, o frontend limpa a sessão local e redireciona para login.

Algumas rotas são públicas:

- login;
- cadastro;
- recuperação de senha;
- listagem simples de setores para cadastro.

Rotas internas, como membros de equipe, planos e dashboard, exigem token.

## Regras de domínio importantes

### Usuários e setores

Um usuário pode estar vinculado a vários setores. Esse vínculo é usado para:

- controlar quais setores aparecem para o gestor;
- validar criação e edição de riscos;
- gerenciar membros por setor;
- alimentar filtros no frontend.

### Riscos e cálculo de nível

O model `Risco` calcula automaticamente:

- `nivel_risco = probabilidade * impacto`;
- `nivel_residual = prob_residual * imp_residual`.

Isso acontece no método `save()` do model, então o cálculo é centralizado no backend.

### PDI e desafios

Cada `ObjetivoPDI` pertence a um `DesafioPDI`. No frontend, a criação e edição de planos respeitam essa relação, filtrando objetivos conforme o desafio selecionado.

### Planos de ação

O `PlanoAcao` representa o tratamento do risco. Ele também é usado em filtros por período e na exibição de datas na dashboard.

## Arquitetura do frontend

O frontend é organizado por páginas, componentes e serviços:

- `pages/`: telas completas da aplicação.
- `components/`: componentes reutilizáveis, como a sidebar.
- `services/api.js`: cliente Axios centralizado para chamadas HTTP.
- `utils/`: funções utilitárias, como download de arquivos.

```mermaid
flowchart TD
    App["App.jsx\nRotas React"] --> Pages["pages/"]
    App --> Sidebar["components/Sidebar"]
    Pages --> Api["services/api.js"]
    Api --> Backend["Django API"]

    Pages --> Dashboard["Dashboard"]
    Pages --> Planos["Planos de Risco"]
    Pages --> NovoPlano["Novo/Editar Plano"]
    Pages --> Mapa["Mapa de Riscos"]
    Pages --> Equipe["Gestão de Equipe"]
```

## Integração frontend e backend

O frontend chama a API usando caminhos iniciados por `/api`. Durante o desenvolvimento, o Vite encaminha essas chamadas para o Django:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Proxy:    /api -> http://localhost:8000
```

Essa configuração está em:

```text
src/frontend/vite.config.js
```

## Dados iniciais e comandos de apoio

O projeto possui seeds por migration para dados estruturais:

- setores iniciais;
- desafios do PDI;
- objetivos do PDI;
- macroprocessos.

Também existe comando de apoio para ambiente local:

```bash
python manage.py seed_usuarios_teste
```

Ele cria usuários de teste vinculados a múltiplos setores para validar a gestão de equipes.

## Testes automatizados

Os testes ficam dentro dos próprios apps:

```text
src/usuarios/tests/
src/riscos/tests/
```

Eles cobrem:

- models;
- serializers indiretamente via API;
- endpoints;
- permissões;
- seeds;
- dashboard;
- exportações;
- gestão de equipe.

O comando principal é:

```bash
python -m pytest
```

## Como pensar em uma nova funcionalidade

Ao implementar uma nova funcionalidade, normalmente o caminho é:

1. Criar ou ajustar models, se houver nova estrutura de dados.
2. Criar migration quando o banco mudar.
3. Criar ou ajustar serializers.
4. Criar endpoint em views/viewsets.
5. Registrar rota no `urls.py`, se necessário.
6. Consumir a API no frontend usando `services/api.js`.
7. Atualizar ou criar tela/componente.
8. Criar testes automatizados.
9. Atualizar documentação quando a mudança alterar arquitetura, fluxo ou uso.

Esse fluxo mantém o projeto previsível e ajuda a evitar regras duplicadas entre frontend e backend.
