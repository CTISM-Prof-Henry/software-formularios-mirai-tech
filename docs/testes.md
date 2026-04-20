# Testes

## Visão geral

O projeto possui uma suíte de testes automatizados focada principalmente no backend, cobrindo regras de negócio, autenticação, permissões e comportamentos esperados da API REST.

Atualmente, os testes estão organizados por domínio da aplicação:

- `src/usuarios/tests/`: cobre autenticação, perfil, recuperação de senha e gestão de membros por setor;
- `src/riscos/tests/`: cobre regras dos modelos de risco, paginação, filtros e permissões de acesso.

## Ferramentas utilizadas

- **Pytest**: execução e organização dos testes;
- **Pytest-Django**: integração com o ambiente Django;
- **Pytest-Cov**: apoio para análise de cobertura;
- **Django REST Framework APIClient**: validação dos endpoints da API.

## Estrutura atual dos testes

### Testes do módulo de usuários

Arquivos principais:

- `src/usuarios/tests/test_models.py`
- `src/usuarios/tests/test_views.py`

Cobertura atual:

- criação de setores e usuários;
- regras de criação de usuário comum e superusuário;
- autenticação por login;
- registro de novos usuários;
- leitura e atualização do perfil autenticado;
- fluxo de recuperação de senha;
- listagem, adição e remoção de membros por setor;
- comportamento auxiliar do admin para exibição de setores.

### Testes do módulo de riscos

Arquivos principais:

- `src/riscos/tests/test_models.py`
- `src/riscos/tests/test_views.py`

Cobertura atual:

- cálculo automático do nível de risco e do risco residual;
- criação de entidades relacionadas ao domínio de riscos;
- permissões de leitura e edição por setor;
- bloqueio de criação ou alteração indevida em setores de outros gestores;
- paginação da listagem de planos;
- filtros por setor;
- busca textual nos riscos cadastrados.

## Como executar os testes

Com o ambiente virtual ativo e as dependências instaladas, execute:

```bash
python -m pytest
```

Para gerar um relatório simples de cobertura, utilize:

```bash
python -m pytest --cov=src --cov-report=term-missing
```

## Automação no GitHub Actions

Os testes automatizados também podem ser executados no GitHub Actions por meio da workflow `.github/workflows/tests.yml`.

Essa automação:

- executa em `push` para `main` e branches `feat/*`;
- executa em `pull_request`;
- sobe um serviço PostgreSQL para os testes;
- instala as dependências do projeto;
- aplica as migrations antes da execução;
- roda a suíte com `pytest`.

## Observações

- a documentação atual descreve os testes automatizados do backend;
- ainda é possível expandir a suíte com testes de integração mais amplos e testes de frontend;
- manter esta página atualizada ajuda a dar visibilidade sobre o que já está validado no sistema.
