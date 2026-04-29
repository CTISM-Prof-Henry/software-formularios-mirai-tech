# Gestão de Risco UFSM - Mirai Tech

Sistema web para gestão e monitoramento de riscos institucionais da UFSM, com backend em Django REST Framework, frontend em React e banco de dados PostgreSQL executado via Docker.

## Sumário

* [Pré-requisitos](#pré-requisitos)
* [Instalação](#instalação)
* [Instruções de uso](#instruções-de-uso)
* [Contato](#contato)
* [Bibliografia](#bibliografia)

## Pré-requisitos

Para executar o projeto localmente, é necessário ter:

- Python 3.11 ou 3.12;
- Node.js 18 ou superior;
- Docker com suporte a Compose;
- Git;
- acesso à internet para instalar dependências.

O projeto pode ser executado tanto em **Windows 11** quanto em **Ubuntu/Linux**, com backend rodando localmente e PostgreSQL isolado em container.

| Configuração        | Valor                                     |
|---------------------|-------------------------------------------|
| Sistema operacional | Windows 11 ou Ubuntu 22.04+               |
| Processador         | Intel Core i5 / Ryzen 5 ou equivalente    |
| Memória RAM         | 8 GB ou mais                              |
| Python              | 3.11 ou 3.12                              |
| Node.js             | 18+ recomendado                           |
| Docker              | Docker Desktop ou Docker Engine + Compose |

## Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd gestao-risco-ufsm-main
```

### 2. Criar o ambiente virtual

```bash
python -m venv .venv
```

### 3. Ativar o ambiente virtual

No **Windows 11**:

```powershell
.\.venv\Scripts\Activate.ps1
```

No **Ubuntu/Linux**:

```bash
source .venv/bin/activate
```

### 4. Instalar dependências do backend

```bash
pip install -r requirements.txt
pip install "psycopg[binary]"
```

### 5. Criar o arquivo de ambiente

No **Windows 11**:

```powershell
Copy-Item .env.example .env
```

No **Ubuntu/Linux**:

```bash
cp .env.example .env
```

Use os valores abaixo no `.env` para execução local:

```env
DATABASE_NAME=gestao_risco_ufsm
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
DEBUG=True
```

### 6. Subir o banco de dados

Use preferencialmente:

```bash
docker compose up -d
```

Se sua instalação ainda usar o binário legado, também funciona:

```bash
docker-compose up -d
```

### 7. Aplicar migrations

```bash
python manage.py migrate
```

### 8. Criar usuários de teste para gestão de equipes (opcional)

```bash
python manage.py seed_usuarios_teste
```

Para redefinir a senha padrão dos usuários de teste:

```bash
python manage.py seed_usuarios_teste --reset-password
```

Senha padrão:

```text
Teste@12345
```

### 9. Instalar dependências do frontend

```bash
cd src/frontend
npm install
cd ../..
```

## Instruções de uso

Depois da instalação, utilize três terminais.

### Terminal 1 - backend

No **Windows 11**:

```powershell
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

No **Ubuntu/Linux**:

```bash
source .venv/bin/activate
python manage.py runserver
```

### Terminal 2 - frontend

```bash
cd src/frontend
npm run dev
```

### Terminal 3 - testes

No **Windows 11**:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pytest
```

No **Ubuntu/Linux**:

```bash
source .venv/bin/activate
python -m pytest
```

### Validação de qualidade

Lint do backend:

```bash
python -m ruff check .
```

Lint do frontend:

```bash
cd src/frontend
npm run lint
```

Build do frontend:

```bash
cd src/frontend
npm run build
```

## Fluxo esperado

1. O backend ficará disponível em `http://localhost:8000/`.
2. O frontend ficará disponível em `http://localhost:5173/`.
3. O banco PostgreSQL subirá pelo Docker em `localhost:5433`.
4. O cadastro de usuários consumirá os setores disponíveis pelo endpoint público `/api/usuarios/setores/`.
5. As principais rotas de autenticação e gestão de riscos ficarão expostas sob `/api/usuarios/` e `/api/riscos/`.

## Contato

O repositório foi originalmente desenvolvido por <br>
- [Enzo Miguel]()
- [Isaac Silva]()
- [Matheus Gabriel]()
- [Joloano]()
- [Pablo]()

## Bibliografia

* [Documentação Django](https://docs.djangoproject.com/)
* [Documentação Django REST Framework](https://www.django-rest-framework.org/)
* [Documentação React](https://react.dev/)
* [Documentação Vite](https://vite.dev/)
* [Documentação PostgreSQL](https://www.postgresql.org/docs/)
* [Documentação Docker Compose](https://docs.docker.com/compose/)
