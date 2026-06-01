# Testes

## Visao geral

O projeto possui uma base de testes automatizados focada principalmente no backend. Para deixar a organizacao mais clara, a suite agora esta separada por **tipo de teste**:

- **testes unitarios**
- **testes de componente**
- **testes de integracao**

Essa divisao facilita a leitura tecnica, a documentacao academica e a futura evolucao da pipeline.

## Ferramentas utilizadas

- **Pytest**: execucao e organizacao da suite
- **Pytest-Django**: integracao com o ambiente Django
- **Pytest-Cov**: geracao de cobertura
- **Django REST Framework APIClient**: validacao dos endpoints REST
- **call_command** do Django: execucao de comandos de management em testes de seed

## Estrutura atual

Os testes agora ficam centralizados na pasta raiz `tests/`:

```text
tests/
  unit/
    usuarios/
    riscos/
  component/
    usuarios/
    riscos/
  integration/
```

Arquivos atualmente presentes:

### Unitarios

- `tests/unit/usuarios/test_models.py`
- `tests/unit/usuarios/test_serializers.py`
- `tests/unit/usuarios/test_importacao_unidades.py`
- `tests/unit/riscos/test_models.py`
- `tests/unit/riscos/test_seed_data.py`
- `tests/unit/riscos/test_serializers.py`
- `tests/unit/riscos/test_exporters.py`

### Componentes

- `tests/component/usuarios/test_importar_unidades_ufsm.py`
- `tests/component/usuarios/test_normalizar_setores_legados.py`
- `tests/component/usuarios/test_seed_base_demo.py`
- `tests/component/usuarios/test_seed_usuarios_teste.py`
- `tests/component/usuarios/test_views.py`
- `tests/component/riscos/test_views.py`

### Integracao

- `tests/integration/test_dashboard_fluxo_risco.py`
- `tests/integration/test_mapa_fluxo_risco.py`
- `tests/integration/test_exportacoes_fluxo.py`
- `tests/integration/test_recuperacao_senha_fluxo.py`

## Fixtures compartilhadas

Para reduzir repeticao e facilitar a manutencao, a suite agora possui fixtures compartilhadas em:

- `tests/conftest.py`

As fixtures principais hoje sao:

- `api_client`
- `setor_oficial`
- `setor_secundario`
- `usuario_gestor`
- `usuario_superuser`
- `usuario_outro_setor`
- `desafio_padrao`
- `objetivo_padrao`
- `macroprocesso_padrao`
- `risco_basico`
- `risco_com_plano`
- `risco_com_monitoramento`

## Testes unitarios

Os testes unitarios validam comportamentos isolados de classes, metodos e regras pequenas de dominio.

### Arquivos classificados como unitarios

- `tests/unit/usuarios/test_models.py`
- `tests/unit/riscos/test_models.py`
- `tests/unit/riscos/test_seed_data.py`

### O que esta coberto como teste unitario

#### `tests/unit/usuarios/test_models.py`

- criacao de `Setor`
- geracao de `label_curto` e `label_completo`
- criacao de usuario comum
- validacao de erro ao criar usuario sem SIAPE
- validacao de erro ao criar superusuario com flags inconsistentes
- criacao valida de superusuario

#### `tests/unit/usuarios/test_serializers.py`

- criacao de usuario por serializer com vinculo de unidade
- atualizacao parcial de perfil
- validacao da senha atual
- validacao da confirmacao de senha
- aplicacao correta de nova senha

#### `tests/unit/usuarios/test_importacao_unidades.py`

- retorno do caminho padrao do csv oficial
- falha quando o arquivo nao existe
- falha quando faltam campos obrigatorios
- ignorar linhas incompletas
- atualizacao de unidade oficial ja existente

#### `tests/unit/riscos/test_models.py`

- calculo automatico de `nivel_risco`
- calculo automatico de `nivel_residual`
- criacao de `PlanoAcao`
- criacao de `Monitoramento`
- representacoes textuais basicas dos modelos relacionados

#### `tests/unit/riscos/test_seed_data.py`

- presenca dos desafios PDI iniciais
- presenca dos macroprocessos iniciais
- presenca dos objetivos PDI iniciais
- relacao esperada entre objetivo e desafio

#### `tests/unit/riscos/test_serializers.py`

- serializacao dos detalhes relacionados do risco
- criacao de risco com payload valido
- rejeicao de categoria invalida
- rejeicao de campo obrigatorio ausente

#### `tests/unit/riscos/test_exporters.py`

- comportamento dos helpers internos de exportacao
- exportacao da lista em Excel
- exportacao do plano individual em Excel
- exportacao do plano individual em PDF

## Testes de componente

Nesta documentacao, estamos tratando como **testes de componente** aqueles que validam um modulo funcional do sistema em uma camada especifica, normalmente um endpoint, view ou comando.

### Arquivos classificados como testes de componente

- `tests/component/usuarios/test_importar_unidades_ufsm.py`
- `tests/component/usuarios/test_normalizar_setores_legados.py`
- `tests/component/usuarios/test_seed_base_demo.py`
- `tests/component/usuarios/test_seed_usuarios_teste.py`
- `tests/component/usuarios/test_views.py`
- `tests/component/riscos/test_views.py`

### O que esta coberto como teste de componente

#### `tests/component/usuarios/test_importar_unidades_ufsm.py`

- execucao do comando `importar_unidades_ufsm`
- importacao de unidades oficiais com os metadados da UFSM
- geracao correta de labels curto e completo
- idempotencia da importacao
- desativacao opcional de setores legados

#### `tests/component/usuarios/test_normalizar_setores_legados.py`

- localizacao da unidade oficial equivalente para um setor legado
- remapeamento de vinculos antigos de usuario para unidade oficial
- remapeamento de riscos antigos para unidades oficiais equivalentes

#### `tests/component/usuarios/test_seed_base_demo.py`

- execucao do comando `seed_base_demo`
- criacao de usuarios comuns adicionais para demonstracao
- criacao de riscos, planos de acao e monitoramentos de exemplo
- idempotencia da base demo
- garantia de que o seed nao cria novos superusuarios

#### `tests/component/usuarios/test_seed_usuarios_teste.py`

- execucao do comando `seed_usuarios_teste`
- criacao de usuarios em multiplos setores
- idempotencia do comando
- atualizacao de senha com `--reset-password`

#### `tests/component/usuarios/test_views.py`

- login
- registro de novo usuario
- leitura de perfil autenticado
- atualizacao de perfil
- envio, validacao e redefinicao de senha
- listagem publica de setores
- listagem administrativa de unidades da UFSM exclusiva para superusuario
- listagem de membros por setor
- adicao e remocao de membros da equipe

#### `tests/component/riscos/test_views.py`

- leitura de riscos por gestores de setores diferentes
- bloqueio de edicao indevida
- bloqueio de criacao em setor nao vinculado
- verificacao da permissao `PertenceAoSetorDoRisco`
- paginacao da listagem de planos
- filtros por setor
- busca textual
- ordenacao estavel de objetivos e macroprocessos
- exportacao para Excel
- exportacao para PDF
- dados consolidados da dashboard com filtros por setor e periodo
- dados analiticos da dashboard e do mapa de riscos

## Testes de integracao

Os testes de integracao verificam a comunicacao entre mais de uma camada do sistema, por exemplo:

- requisicao HTTP -> view -> serializer -> model -> banco
- comando de management -> model -> banco
- regra de negocio + autenticacao + permissao + persistencia

### Arquivos atuais de integracao

Hoje a pasta de integracao ja possui arquivos reais:

- `tests/integration/test_dashboard_fluxo_risco.py`
- `tests/integration/test_mapa_fluxo_risco.py`
- `tests/integration/test_exportacoes_fluxo.py`
- `tests/integration/test_recuperacao_senha_fluxo.py`
- `tests/integration/test_gerencial_fluxo.py`

### O que estes testes cobrem

- criacao de risco e reflexo na dashboard
- criacao de risco e reflexo no mapa de riscos
- exportacao de plano individual em PDF e Excel
- fluxo completo de recuperacao de senha
- fluxo gerencial cruzando dashboard e mapa de riscos com filtros por setor e periodo

### Relacao com os testes de componente

Mesmo com a nova pasta de integracao, parte dos testes de componente ainda cobre integracao de fato, especialmente:

- `tests/component/usuarios/test_views.py`
- `tests/component/usuarios/test_importar_unidades_ufsm.py`
- `tests/component/usuarios/test_normalizar_setores_legados.py`
- `tests/component/usuarios/test_seed_base_demo.py`
- `tests/component/usuarios/test_seed_usuarios_teste.py`
- `tests/component/riscos/test_views.py`

## Como executar os testes

Com o ambiente virtual ativo e as dependencias instaladas:

```bash
python -m pytest
```

Para cobertura:

```bash
python -m pytest --cov=src --cov-report=term-missing
```

Como a suite agora esta centralizada em `tests/`, o `pytest` usa essa pasta como ponto principal de descoberta.

## Automacao no GitHub Actions

Os testes tambem sao executados pela workflow:

```text
.github/workflows/tests.yml
```

Essa automacao:

- executa em `push`
- executa em `pull_request`
- sobe um PostgreSQL para testes
- instala dependencias
- aplica migrations
- executa `pytest`

## Observacoes finais

- a documentacao atual descreve a suite automatizada do backend
- devemos ampliar a cobertura com testes de frontend
- a estrutura fisica agora possui testes reais em `tests/integration/` e esta pronta para crescer por fluxo
