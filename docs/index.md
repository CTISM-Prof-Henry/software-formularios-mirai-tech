# Home

## Gestão de Risco UFSM

O **Gestão de Risco UFSM** é um sistema web para cadastro, acompanhamento e monitoramento de riscos institucionais da Universidade Federal de Santa Maria. A solução foi construída com **Django** no backend, **React/Vite** no frontend e **PostgreSQL** como banco de dados, com apoio do Docker para execução local.

## Objetivo da documentação

Esta documentação centraliza as principais informações do projeto para apoiar:

- instalação e execução local do ambiente;
- entendimento da arquitetura geral da aplicação;
- consulta rápida dos endpoints e regras principais da API;
- compreensão da estrutura de dados e das entidades do sistema;
- visualização dos fluxos de interface e protótipos;
- mapeamento dos testes automatizados já existentes.

## Estrutura da documentação

As páginas do MkDocs foram organizadas para facilitar a navegação entre áreas técnicas e funcionais do projeto:

- **Home**: visão geral do sistema e do conteúdo disponível;
- **Instalação**: preparação do ambiente e passos para executar o projeto;
- **Arquitetura**: organização do projeto, fluxo Django/DRF, camadas e integração com o frontend;
- **API**: rotas principais, autenticação e módulos expostos pelo backend;
- **Banco de dados**: visão das entidades e relacionamento das informações;
- **Frontend**: organização da aplicação cliente e estrutura das telas;
- **Design e protótipo**: referência visual das principais interfaces do sistema;
- **Testes**: visão dos testes automatizados implementados no backend;
- **Exemplos e casos de uso**: cenários de uso e fluxos funcionais.

## Tecnologias principais

- **Backend**: Django 5, Django REST Framework e autenticação por token;
- **Frontend**: React 18, React Router DOM, Axios e Vite;
- **Banco de dados**: PostgreSQL 16;
- **Infraestrutura local**: Docker e Docker Compose;
- **Sistemas suportados para execução local**: Windows 11 e Ubuntu/Linux;
- **Testes**: Pytest, Pytest-Django e Pytest-Cov.
