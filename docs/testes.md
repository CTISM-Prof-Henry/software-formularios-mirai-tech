# Testes

## Visão geral

O projeto possui uma suíte de testes automatizados focada principalmente no backend. Para facilitar a avaliação e o entendimento da cobertura atual, os testes estão organizados nesta documentação por **tipo de teste**:

- **testes unitários**;
- **testes de componente**;
- **testes de integração**.

Essa divisão ajuda a responder com mais clareza:

- quais regras de negócio já são verificadas isoladamente;
- quais partes do sistema são testadas em nível de módulo ou endpoint;
- quais fluxos exercitam a integração entre camadas, banco e API.

## Ferramentas utilizadas

- **Pytest**: execução e organização da suíte;
- **Pytest-Django**: integração com o ambiente Django;
- **Pytest-Cov**: geração de cobertura;
- **Django REST Framework APIClient**: validação dos endpoints REST;
- **call_command** do Django: execução de comandos de management em testes de seed.

## Estrutura atual

Os testes estão concentrados nos apps `usuarios` e `riscos`:

- `src/usuarios/tests/`
- `src/riscos/tests/`

Arquivos atualmente presentes:

- `src/usuarios/tests/test_models.py`
- `src/usuarios/tests/test_views.py`
- `src/usuarios/tests/test_seed_usuarios_teste.py`
- `src/riscos/tests/test_models.py`
- `src/riscos/tests/test_views.py`
- `src/riscos/tests/test_seed_data.py`

## Testes unitários

Os testes unitários validam comportamentos isolados de classes, métodos e regras pequenas de domínio, com foco em uma unidade específica de código.

### Arquivos classificados como unitários

- `src/usuarios/tests/test_models.py`
- `src/riscos/tests/test_models.py`

### O que está coberto como teste unitário

#### `src/usuarios/tests/test_models.py`

- criação de `Setor`;
- criação de usuário comum;
- validação de erro ao criar usuário sem SIAPE;
- validação de erro ao criar superusuário com flags inconsistentes;
- criação válida de superusuário;
- comportamento básico de `__str__`, `is_active` e `is_staff`.

#### `src/riscos/tests/test_models.py`

- cálculo automático de `nivel_risco`;
- cálculo automático de `nivel_residual`;
- criação de `PlanoAcao`;
- criação de `Monitoramento`;
- comportamento básico das representações textuais dos modelos relacionados.

### Interpretação

Esses testes são os mais próximos da ideia clássica de unidade, porque exercitam principalmente:

- models;
- managers;
- regras de cálculo;
- validações específicas de criação.

## Testes de componente

Nesta documentação, estamos tratando como **testes de componente** aqueles que validam um módulo funcional do sistema em uma camada específica, normalmente um endpoint, view ou comando, sem necessariamente percorrer um fluxo completo de ponta a ponta.

### Arquivos classificados como testes de componente

- `src/usuarios/tests/test_views.py`
- `src/riscos/tests/test_views.py`
- `src/usuarios/tests/test_seed_usuarios_teste.py`
- `src/riscos/tests/test_seed_data.py`

### O que está coberto como teste de componente

#### `src/usuarios/tests/test_views.py`

- login;
- registro de novo usuário;
- leitura de perfil autenticado;
- atualização de perfil;
- envio, validação e redefinição de senha;
- listagem pública de setores;
- listagem de membros por setor;
- adição e remoção de membros da equipe;
- comportamento auxiliar do admin para exibição de setores.

#### `src/riscos/tests/test_views.py`

- leitura de riscos por gestores de setores diferentes;
- bloqueio de edição indevida;
- bloqueio de criação em setor não vinculado;
- verificação da permissão `PertenceAoSetorDoRisco`;
- paginação da listagem de planos;
- filtros por setor;
- busca textual;
- ordenação estável de objetivos e macroprocessos;
- exportação para Excel;
- exportação para PDF;
- dados consolidados da dashboard com filtros por setor e período.

#### `src/usuarios/tests/test_seed_usuarios_teste.py`

- execução do comando `seed_usuarios_teste`;
- criação de usuários em múltiplos setores;
- idempotência do comando;
- atualização de senha com `--reset-password`.

#### `src/riscos/tests/test_seed_data.py`

- presença dos desafios PDI iniciais;
- presença dos macroprocessos iniciais;
- presença dos objetivos PDI iniciais;
- relação esperada entre objetivo e desafio.

### Interpretação

Esses testes já passam por uma parte maior da aplicação do que os unitários. Em geral, eles exercitam:

- viewsets;
- serializers de entrada e saída;
- autenticação via APIClient;
- comandos de management;
- migrations e dados iniciais no banco.

## Testes de integração

Nesta documentação, estamos tratando como **testes de integração** aqueles que verificam a comunicação entre mais de uma camada do sistema, por exemplo:

- requisição HTTP -> view -> serializer -> model -> banco;
- comando de management -> model -> banco;
- regra de negócio + autenticação + permissão + persistência.

### Onde os testes de integração aparecem hoje

Atualmente, o projeto **não possui um diretório separado apenas para integração**. Em vez disso, parte dos testes de componente também cumpre papel de integração.

Os principais exemplos são:

- `src/usuarios/tests/test_views.py`
- `src/riscos/tests/test_views.py`
- `src/usuarios/tests/test_seed_usuarios_teste.py`
- `src/riscos/tests/test_seed_data.py`

### Exemplos claros de integração já existentes

#### Integração no módulo de usuários

- login autenticando usuário real no banco e retornando token;
- registro persistindo usuário e vínculo com setor;
- fluxo de recuperação de senha usando banco e regras temporais;
- gestão de equipe adicionando e removendo vínculos entre usuário e setor.

#### Integração no módulo de riscos

- criação e edição de riscos respeitando autenticação e vínculo com setor;
- paginação e filtros da API de riscos;
- dashboard calculando dados com base em riscos e planos de ação relacionados;
- exportações em PDF e Excel a partir de dados persistidos;
- leitura de objetivos e macroprocessos vindos do banco com ordenação estável.

#### Integração em seeds e comandos

- verificação dos dados PDI carregados via migration;
- verificação dos usuários de teste criados por comando de management.

## Resumo por classificação

### Testes unitários

- `src/usuarios/tests/test_models.py`
- `src/riscos/tests/test_models.py`

### Testes de componente

- `src/usuarios/tests/test_views.py`
- `src/riscos/tests/test_views.py`
- `src/usuarios/tests/test_seed_usuarios_teste.py`
- `src/riscos/tests/test_seed_data.py`

### Testes de integração

- parte dos testes de `test_views.py`;
- `test_seed_usuarios_teste.py`;
- `test_seed_data.py`.

Observação importante:

- hoje a suíte está mais madura no backend;
- a separação física entre componente e integração ainda não é rígida;
- a classificação nesta documentação é conceitual, para ajudar na leitura/avalicao do projeto.

## Como executar os testes

Com o ambiente virtual ativo e as dependências instaladas:

```bash
python -m pytest
```

Para cobertura:

```bash
python -m pytest --cov=src --cov-report=term-missing
```

## Automação no GitHub Actions

Os testes também são executados pela workflow:

```text
.github/workflows/tests.yml
```

Essa automação:

- executa em `push` para `main` e branches `feat/*`;
- executa em `pull_request`;
- sobe um PostgreSQL para testes;
- instala dependências;
- aplica migrations;
- executa `pytest`.

## Observações finais

- a documentação atual descreve a suíte automatizada do backend;
- ainda há espaço para ampliar a cobertura com testes de frontend;
- também é possível separar no futuro diretórios específicos para integração.
- manter esta página atualizada ajuda a mostrar com clareza o estágio real de testes do sistema.
