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
pip install "psycopg[binary]"  # Garante o driver moderno do Postgres
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

# Criar usuarios de teste para validar a gestao de equipes (opcional)
python manage.py seed_usuarios_teste

# Criar um administrador (opcional)
python manage.py createsuperuser
```

#### Usuarios de teste para Gestao de Equipes

Para testar gestores vinculados a multiplos setores, execute:

```bash
python manage.py seed_usuarios_teste
```

O comando e idempotente, ou seja, pode ser executado mais de uma vez sem duplicar usuarios. Caso queira redefinir a senha dos usuarios de teste, use:

```bash
python manage.py seed_usuarios_teste --reset-password
```

Senha padrao dos usuarios criados: **Teste@12345**

Usuarios criados:
*   `2030001` - Ana Paula Multissetorial (`CAL`, `CCS`, `CT`)
*   `2030002` - Bruno Gestor Centros (`CAL`, `CCR`)
*   `2030003` - Carla Gestora Pesquisa (`CCS`, `CCNE`, `CCSH`)
*   `2030004` - Diego Gestor Ensino (`CE`, `CEFD`)
*   `2030005` - Elisa Gestora Tecnologia (`CT`, `CTISM`, `Politecnico`)

### 5. Rodar o Servidor Backend
```bash
python manage.py runserver
```
O servidor estará disponível em: **http://localhost:8000/**

### 6. Rodar o Frontend (React)
Em um novo terminal:
```bash
cd src/frontend
npm install
npm run dev
```
O frontend estará disponível em: **http://localhost:5173/**

### 7. Endpoints Principais (API)
...

#### Usuários
*   **Login**: `POST /api/usuarios/login/` (Requer `siape` e `senha`)
*   **Registro**: `POST /api/usuarios/registro/` (Requer `siape`, `senha`, `nome`, `email`, `id_setores`)
*   **Setores**: `GET/POST /api/usuarios/setores/`
*   **Atualizar Perfil**: `PATCH /api/usuarios/me/`
*   **Recuperação de Senha**: `POST /api/usuarios/recuperar-senha/enviar/`, `validar/` e `redefinir/`

#### Gestão de Riscos
*   **Desafios/Objetivos/Processos**: `/api/riscos/desafios/`, `/api/riscos/objetivos/`, `/api/riscos/macroprocessos/`
*   **Planos de Risco**: `/api/riscos/planos/`
*   **Ações de Tratamento**: `/api/riscos/acoes/`
*   **Monitoramento**: `/api/riscos/monitoramentos/`

### 7. Validação
Para validar as funcionalidades e verificar a cobertura de código, execute:
```bash
python -m pytest
```
O comando acima executará todos os testes unitários e de integração, gerando um relatório de cobertura no terminal.
