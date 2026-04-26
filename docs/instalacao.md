# Instalação

Esta página descreve a instalação do projeto em **Windows 11** e em sistemas **Unix**, como **Ubuntu**.

## Pré-requisitos

Antes de executar o projeto, tenha instalado:

- Python 3.11 ou 3.12;
- Node.js 18 ou superior;
- Docker com suporte a Compose;
- Git.

## 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd gestao-risco-ufsm-main
```

## 2. Criar o ambiente virtual

```bash
python -m venv .venv
```

## 3. Ativar o ambiente virtual

No **Windows 11**:

```powershell
.\.venv\Scripts\Activate.ps1
```

No **Ubuntu/Linux**:

```bash
source .venv/bin/activate
```

## 4. Instalar dependências do backend

```bash
pip install -r requirements.txt
pip install "psycopg[binary]"
```

## 5. Variáveis de ambiente

Crie um arquivo `.env` a partir do modelo.

No **Windows 11**:

```powershell
Copy-Item .env.example .env
```

No **Ubuntu/Linux**:

```bash
cp .env.example .env
```

Use os valores locais abaixo:

```env
DATABASE_NAME=gestao_risco_ufsm
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
DEBUG=True
```

## 6. Banco de dados

Suba o PostgreSQL com Docker Compose:

```bash
docker compose up -d
```

Se sua instalação ainda estiver no formato antigo:

```bash
docker-compose up -d
```

Depois, aplique as migrations:

```bash
python manage.py migrate
```

## 7. Usuários de teste opcionais

Para popular usuários vinculados a múltiplos setores:

```bash
python manage.py seed_usuarios_teste
```

Para redefinir a senha desses usuários:

```bash
python manage.py seed_usuarios_teste --reset-password
```

Senha padrão:

```text
Teste@12345
```

## 8. Frontend

Instale as dependências do frontend:

```bash
cd src/frontend
npm install
cd ../..
```

## 9. Execução local

Inicie o backend:

```bash
python manage.py runserver
```

Inicie o frontend em outro terminal:

```bash
cd src/frontend
npm run dev
```

## 10. Validação

Execute os testes automatizados:

```bash
python -m pytest
```

Valide a documentação:

```bash
python -m mkdocs build
```
