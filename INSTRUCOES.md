# Instruções para Rodar o Projeto (Gestão de Risco UFSM)

Este guia resume a execução do projeto em **Windows 11** e em sistemas **Unix**, como **Ubuntu**.

## 1. Pré-requisitos

- Python 3.11 ou 3.12;
- Node.js 18 ou superior;
- Docker com suporte a Compose;
- Git.

## 2. Configuração inicial

Crie o ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual.

No **Windows 11**:

```powershell
.\.venv\Scripts\Activate.ps1
```

No **Ubuntu/Linux**:

```bash
source .venv/bin/activate
```

Instale as dependências do backend:

```bash
pip install -r requirements.txt
pip install "psycopg[binary]"
```

## 3. Variáveis de ambiente

Crie o `.env` a partir do exemplo.

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

## 4. Banco de dados

Com o Docker em execução, suba o PostgreSQL:

```bash
docker compose up -d
```

Se sua instalação ainda usar o comando legado:

```bash
docker-compose up -d
```

## 5. Preparar o Django

```bash
python manage.py migrate
```

Opcionalmente, crie usuários de teste para validar a gestão de equipes:

```bash
python manage.py seed_usuarios_teste
```

Para redefinir a senha dos usuários de teste:

```bash
python manage.py seed_usuarios_teste --reset-password
```

Senha padrão dos usuários criados:

```text
Teste@12345
```

Usuários criados:

- `2030001` - Ana Paula Multissetorial (`CT - Departamento de Computação Aplicada`, `PM - Departamento de Administração - PM`, `CTISM - Núcleo Pedagógico do CTISM`)
- `2030002` - Bruno Gestor Centros (`CT - Departamento de Engenharia Mecânica`, `PM - Departamento de Ciências Econômicas - PM`)
- `2030003` - Carla Gestora Pesquisa (`CT - Departamento de Eletrônica e Computação`, `PM - Departamento de Ciências da Saúde - PM`, `CT - Departamento de Engenharia Sanitária e Ambiental`)
- `2030004` - Diego Gestor Ensino (`CT - Departamento de Engenharia de Produção e Sistemas`, `PM - Departamento de Alimentos e Nutrição - PM`)
- `2030005` - Elisa Gestora Tecnologia (`CT - Departamento de Linguagens e Sistemas de Computação`, `CT - Departamento de Transportes`, `PM - Departamento de Zootecnia e Ciências Biológicas - PM`)

Se quiser popular o sistema com uma base mais completa para demonstração, incluindo
mais usuários comuns, planos de risco, ações de tratamento e alguns monitoramentos:

```bash
python manage.py seed_base_demo
```

Esse comando:

- reutiliza/importa as unidades oficiais da UFSM;
- cria apenas usuários comuns de demonstração;
- não cria novos superusuários;
- popula riscos e planos de ação adicionais para dashboard, mapa de riscos e exportações.

Se necessário, também é possível criar um superusuário:

```bash
python manage.py createsuperuser
```

## 6. Rodar o backend

```bash
python manage.py runserver
```

O backend ficará disponível em:

```text
http://localhost:8000/
```

## 7. Rodar o frontend

Em outro terminal:

```bash
cd src/frontend
npm install
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:5173/
```

## 8. Endpoints principais

### Usuários

- **Login**: `POST /api/usuarios/login/`
- **Registro**: `POST /api/usuarios/registro/`
- **Setores**: `GET /api/usuarios/setores/`
- **Atualizar perfil**: `PATCH /api/usuarios/me/`
- **Recuperação de senha**: `POST /api/usuarios/recuperar-senha/enviar/`, `validar/` e `redefinir/`

### Gestão de riscos

- **Desafios, objetivos e macroprocessos**: `/api/riscos/desafios/`, `/api/riscos/objetivos/`, `/api/riscos/macroprocessos/`
- **Planos de risco**: `/api/riscos/planos/`
- **Ações de tratamento**: `/api/riscos/acoes/`
- **Monitoramento**: `/api/riscos/monitoramentos/`

## 9. Validação

Para executar os testes automatizados:

```bash
python -m pytest
```

Para validar a documentação:

```bash
python -m mkdocs build
```
