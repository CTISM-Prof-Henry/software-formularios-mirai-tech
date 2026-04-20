# Instalação

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Python 3.11 ou 3.12;
- Node.js 18 ou superior;
- Docker Desktop;
- Git.

## Backend

Crie e ative um ambiente virtual:

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

Instale as dependências do backend:

```bash
pip install -r requirements.txt
pip install "psycopg[binary]"
pip install pytest pytest-django pytest-cov
```

## Variáveis de ambiente

Crie um arquivo `.env` a partir do modelo:

```bash
copy .env.example .env
```

Use os valores compatíveis com a execução local:

```env
DATABASE_NAME=gestao_risco_ufsm
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
```

## Banco de dados

Suba o PostgreSQL com Docker Compose:

```bash
docker-compose up -d
```

Execute as migrations:

```bash
python manage.py migrate
```

## Frontend

Instale as dependências do frontend:

```bash
cd src/frontend
npm install
```

## Execução local

Inicie o backend:

```bash
python manage.py runserver
```

Inicie o frontend em outro terminal:

```bash
cd src/frontend
npm run dev
```

## Validação

Execute os testes automatizados:

```bash
python -m pytest
```
