# Esquema de Banco de Dados: Gestao-risco-ufsm-eng-soft-1

---

## 1. Tabela: Setor
Armazena as unidades administrativas da UFSM.

| Campo | Tipo          | Restrição    | Descrição                                     |
|------|--------------|-------------|----------------------------------------------|
| id   | SERIAL       | PRIMARY KEY | Identificador único do setor                 |
| nome | VARCHAR(255) | NOT NULL    | Nome completo da unidade ou departamento     |
| sigla| VARCHAR(20)  | UNIQUE      | Sigla da unidade (ex: CT, CCS, CPD)          |

---

## 2. Tabela: Usuario
Armazena os dados dos gestores e controla permissões.

| Campo     | Tipo          | Restrição    | Descrição                                     |
|----------|--------------|-------------|----------------------------------------------|
| id        | SERIAL       | PRIMARY KEY | Identificador do usuário                     |
| siape     | VARCHAR(20)  | UNIQUE      | Matrícula funcional (login)                  |
| email     | VARCHAR(50)  | UNIQUE      | Email do gestor                              |
| senha     | VARCHAR(255) | NOT NULL    | Hash da senha                                |
| setor_id  | INTEGER      | FOREIGN KEY | Referência ao setor do usuário               |

---

## 3. Tabela: Desafio_PDI
Categorias estratégicas do Plano de Desenvolvimento Institucional.

| Campo     | Tipo          | Restrição    | Descrição                                     |
|----------|--------------|-------------|----------------------------------------------|
| id        | SERIAL       | PRIMARY KEY | Identificador do desafio                     |
| numero    | INTEGER      | UNIQUE      | Número do desafio (1 a 7)                    |
| descricao | VARCHAR(255) | NOT NULL    | Nome do desafio                              |

---

## 4. Tabela: Macroprocesso
Processos onde os riscos são identificados.

| Campo | Tipo          | Restrição    | Descrição                                     |
|------|--------------|-------------|----------------------------------------------|
| id   | SERIAL       | PRIMARY KEY | Identificador do macroprocesso               |
| nome | VARCHAR(255) | UNIQUE      | Nome do processo                             |

---

## 5. Tabela: Objetivo_PDI
Objetivos vinculados aos desafios estratégicos.

| Campo       | Tipo          | Restrição    | Descrição                                     |
|------------|--------------|-------------|----------------------------------------------|
| id          | SERIAL       | PRIMARY KEY | Identificador do objetivo                    |
| codigo      | VARCHAR(20)  | UNIQUE      | Código do objetivo (ex: PR-D1-02)            |
| descricao   | TEXT         | NOT NULL    | Descrição do objetivo                        |
| desafio_id  | INTEGER      | FOREIGN KEY | Referência ao desafio                        |

---

## 6. Tabela: Risco
Tabela central de identificação e avaliação.

| Campo              | Tipo          | Restrição     | Descrição                                     |
|-------------------|--------------|--------------|---------------------------------------------------------------------------------|
| id                | SERIAL       | PRIMARY KEY  | Identificador do risco                                                          |
| setor_id          | INTEGER      | FOREIGN KEY  | Unidade responsável                                                             |
| objetivo_id       | INTEGER      | FOREIGN KEY  | Objetivo impactado                                                              |
| macroprocesso_id  | INTEGER      | FOREIGN KEY  | Processo relacionado                                                            |
| categoria         | VARCHAR(50)  | NOT NULL     | Tipo do risco (Operacional, Imagem, etc.)                                       |
| evento            | TEXT         | NOT NULL     | Descrição do risco                                                              |
| causa             | TEXT         | NOT NULL     | Origem do risco                                                                 |
| consequencia      | TEXT         | NOT NULL     | Impactos potenciais                                                             |
| controles_atuais  | TEXT         | NOT NULL     | Para saber o que já é feito hoje para mitigar o risco.                          |
| probabilidade     | INTEGER      | CHECK (1-5)  | Frequência (1 a 5)                                                              |
| impacto           | INTEGER      | CHECK (1-5)  | Gravidade (1 a 5)                                                               |
| nivel_risco       | INTEGER      | CALCULATED   | Probabilidade × Impacto                                                         |
| prob_residual     | INTEGER      | CHECK (1-5)  | Probabilidade após os controles                                                 |
| imp_residual      | INTEGER      | CHECK (1-5)  | Impacto após os controles                                                       |
| nivel_residual    | INTEGER      | CALCULATED   | Nível do risco após tratamento/controlo                                         |
| eficacia_controle | VARCHAR(50)  | NOT NULL     | Avaliação dos controles                                                         |

---

## 7. Tabela: Plano_Acao
Ações de tratamento (5W2H).

| Campo           | Tipo          | Restrição    | Descrição                                     |
|----------------|--------------|-------------|----------------------------------------------|
| id             | SERIAL       | PRIMARY KEY | Identificador da ação                        |
| risco_id       | INTEGER      | FOREIGN KEY | Risco relacionado                            |
| tipo_resposta  | VARCHAR(50)  | NOT NULL    | Estratégia (Mitigar, Transferir, etc.)       |
| descricao_acao | TEXT         | NOT NULL    | Descrição da ação (What)                     |
| responsavel    | VARCHAR(255) | NOT NULL    | Responsável (Who)                            |
| parceiros      | TEXT         | NOT NULL    | Unidades ou órgãos parceiros na execução     |
| data_inicio    | DATE         | NOT NULL    | Início previsto                              |
| data_fim       | DATE         | NOT NULL    | Prazo final                                  |
| status         | VARCHAR(50)  | NOT NULL    | Status (Não iniciado, Em andamento, etc.)    |
| observacoes    | TEXT         | NOT NULL    | Notas adicionais sobre a execução            |

---

## 8. Tabela: Monitoramento
Acompanhamento contínuo dos riscos.

| Campo             | Tipo    | Restrição      | Descrição                                     |
|------------------|--------|---------------|----------------------------------------------|
| id               | SERIAL | PRIMARY KEY   | Identificador do monitoramento               |
| risco_id         | INTEGER| FOREIGN KEY   | Risco monitorado                             |
| data_verificacao | DATE   | DEFAULT NOW() | Data da verificação                          |
| resultados       | TEXT   | NOT NULL      | Resultado da análise                         |
| acoes_futuras    | TEXT   | NOT NULL      | Ações para aperfeiçoar o tratamento no futuro|
| analise_critica  | TEXT   | NOT NULL      | Sugestões de melhoria                        |

---