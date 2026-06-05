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

## 4. Banco de dados

Com o Docker em execução, suba o PostgreSQL:

```bash
docker compose up -d
```

## 5. Preparar o Django

```bash
python manage.py makemigrations
python manage.py migrate
```

Opcionalmente, popule o sistema com dados realistas prontos para demonstração:

```bash
python manage.py seed_apresentacao
```

Esse comando limpa o banco e cria 1 administrador, 9 gestores e 6 planos de risco cobrindo todas as categorias e níveis de risco.

Acesso do administrador:

```text
SIAPE: 202512603
Senha: 12345678
```

Senha padrão dos gestores:

```text
Sigr@2025
```

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
- **Unidades/Departamentos**: `GET /api/usuarios/setores/`  
  A rota continua com o nome `setores` por compatibilidade, mas retorna as unidades reais da UFSM.
- **Atualizar perfil**: `PATCH /api/usuarios/me/`
- **Recuperação de senha**: `POST /api/usuarios/recuperar-senha/enviar/`, `validar/` e `redefinir/`

### Gestão de riscos

- **Desafios, objetivos e macroprocessos**: `/api/riscos/desafios/`, `/api/riscos/objetivos/`, `/api/riscos/macroprocessos/`
- **Planos de risco**: `/api/riscos/planos/` — rotas de detalhe usam `{uuid}` (ex: `/api/riscos/planos/{uuid}/`)
- **Duplicar plano**: `POST /api/riscos/planos/{uuid}/duplicar/`
- **Histórico de alterações**: `GET /api/riscos/planos/{uuid}/historico/`
- **Relatório gerencial**: `GET /api/riscos/planos/exportar-relatorio/`
- **Ações de tratamento**: `/api/riscos/acoes/` — aceita filtro `?risco=<uuid>`
- **Monitoramento**: `/api/riscos/monitoramentos/` — aceita filtro `?risco=<uuid>`

## 9. Validação

Para executar os testes automatizados:

```bash
python -m pytest
```

Para validar o linter do backend:

```bash
python -m ruff check .
```

Para validar o linter do frontend:

```bash
cd src/frontend
npm run lint
```

Para validar o build do frontend:

```bash
cd src/frontend
npm run build
```

Para validar a documentação:

```bash
python -m mkdocs build
```
