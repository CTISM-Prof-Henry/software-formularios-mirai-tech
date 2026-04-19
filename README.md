# Gestão de Risco UFSM - Mirai Tech

Sistema web para gestão e monitoramento de riscos institucionais da UFSM, com backend em Django REST Framework, frontend em React e banco de dados PostgreSQL executado via Docker.

## Sumário

* [Pré-requisitos](#pré-requisitos)
* [Instalação](#instalação)
* [Instruções de uso](#instruções-de-uso)
* [Contato](#contato)
* [Bibliografia](#bibliografia)

## Pré-requisitos

Para executar o projeto localmente, é necessário ter Python instalado para o backend, Node.js para o frontend e Docker para subir o banco PostgreSQL. O projeto foi desenvolvido e validado em ambiente Windows/Unix, com backend rodando localmente e banco isolado em container.

| Configuração        | Valor                              |
|---------------------|------------------------------------|
| Sistema operacional | Windows 10/11 64 bits              |
| Processador         | Intel Core i7 ou equivalente       |
| Memória RAM         | 16 GB                              |
| Necessita rede?     | Sim, para instalar dependências    |
| Python              | 3.11 ou 3.12                       |
| Node.js             | 18+ recomendado                    |
| Docker              | Docker Desktop com Compose ativo   |

## Instalação

Siga os passos abaixo para preparar o ambiente:

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd gestao-risco-ufsm-main

# 2. Criar e ativar ambiente virtual no Windows
python -m venv .venv
.\.venv\Scripts\activate

# 3. Instalar dependências do backend
pip install -r requirements.txt
pip install "psycopg[binary]"
pip install pytest pytest-django pytest-cov

# 4. Criar arquivo de ambiente
copy .env.example .env

# 5. Subir o banco de dados
docker-compose up -d

# 6. Aplicar migrations
python manage.py migrate

# 7. Instalar dependências do frontend
cd src/frontend
npm install
```

## Instruções de Uso

Depois de instalar as dependências, utilize o projeto da seguinte forma:

```bash
# Terminal 1 - backend
.\.venv\Scripts\activate
python manage.py runserver

# Terminal 2 - frontend
cd src/frontend
npm run dev

# Terminal 3 - testes
.\.venv\Scripts\activate
python -m pytest
```

Fluxo esperado:

1. O backend ficará disponível em `http://localhost:8000/`.
2. O frontend ficará disponível em `http://localhost:5173/`.
3. O banco PostgreSQL sobe pelo Docker em `localhost:5433`.
4. O cadastro de usuários consome os setores disponíveis pelo endpoint público `/api/usuarios/setores/`.
5. As principais rotas de autenticação e gestão de riscos ficam expostas sob `/api/usuarios/` e `/api/riscos/`.

## Contato

O repositório foi originalmente desenvolvido por <br>
- [Enzo Miguel]()
- [Isaac Silva]()
- [Matheus Gabriel]()
- [Joloano]()
- [Pablo]()

## Bibliografia

Adicione aqui entradas numa lista com a documentação pertinente:

* [Documentação Django](https://docs.djangoproject.com/)
* [Documentação Django REST Framework](https://www.django-rest-framework.org/)
* [Documentação React](https://react.dev/)
* [Documentação Vite](https://vite.dev/)
* [Documentação PostgreSQL](https://www.postgresql.org/docs/)
* [Documentação Docker Compose](https://docs.docker.com/compose/)
