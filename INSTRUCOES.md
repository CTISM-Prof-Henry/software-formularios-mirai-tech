# Instruções para Rodar o Backend (Gestão de Risco UFSM)

Siga estes passos para configurar e executar o servidor localmente no Windows.

### 1. Pré-requisitos
*   Python 3.11 ou 3.12 (Estável)
*   Docker Desktop (para o Banco de Dados)

### 2. Configuração Inicial
```bash
# Ativar o ambiente virtual (Git Bash)
source venv/Scripts/activate

# Instalar dependências
pip install -r requirements.txt
pip install "psycopg[binary]"  # driver postgres
```

### 3. Banco de Dados
Certifique-se de que o Docker está rodando e inicie o container:
```bash
docker-compose up -d
```

### 4. Preparar o Django
```bash
# Gerar e aplicar tabelas no banco
python manage.py makemigrations
python manage.py migrate

# Criar um administrador (opcional)
python manage.py createsuperuser
```

### 5. Rodar o Servidor
```bash
python manage.py runserver
```
O servidor estará disponível em: **http://localhost:8000/**
