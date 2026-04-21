CREATE TABLE Setor (
id SERIAL PRIMARY KEY,
nome VARCHAR(255) NOT NULL,
sigla VARCHAR(20) UNIQUE
);

CREATE TABLE Usuario (
id SERIAL PRIMARY KEY,
siape VARCHAR(20) UNIQUE,
email VARCHAR(50) UNIQUE,
senha VARCHAR(255) NOT NULL,
setor_id INTEGER,
FOREIGN KEY (setor_id) REFERENCES Setor(id)
);

CREATE TABLE Desafio_PDI (
id SERIAL PRIMARY KEY,
numero INTEGER UNIQUE,
descricao VARCHAR(255) NOT NULL
);

CREATE TABLE Macroprocesso (
id SERIAL PRIMARY KEY,
nome VARCHAR(255) UNIQUE
);

CREATE TABLE Objetivo_PDI (
id SERIAL PRIMARY KEY,
codigo VARCHAR(20) UNIQUE,
descricao TEXT NOT NULL,
desafio_id INTEGER,
FOREIGN KEY (desafio_id) REFERENCES Desafio_PDI(id)
);

CREATE TABLE Risco (
id SERIAL PRIMARY KEY,
setor_id INTEGER,
objetivo_id INTEGER,
macroprocesso_id INTEGER,
categoria VARCHAR(50) NOT NULL,
evento TEXT NOT NULL,
causa TEXT NOT NULL,
consequencia TEXT NOT NULL,
controles_atuais TEXT NOT NULL,
probabilidade INTEGER CHECK (probabilidade BETWEEN 1 AND 5),
impacto INTEGER CHECK (impacto BETWEEN 1 AND 5),
nivel_risco INTEGER,
prob_residual INTEGER CHECK (prob_residual BETWEEN 1 AND 5),
imp_residual INTEGER CHECK (imp_residual BETWEEN 1 AND 5),
nivel_residual INTEGER,
eficacia_controle VARCHAR(50) NOT NULL,
FOREIGN KEY (setor_id) REFERENCES Setor(id),
FOREIGN KEY (objetivo_id) REFERENCES Objetivo_PDI(id),
FOREIGN KEY (macroprocesso_id) REFERENCES Macroprocesso(id)
);

CREATE TABLE Plano_Acao (
id SERIAL PRIMARY KEY,
risco_id INTEGER,
tipo_resposta VARCHAR(50) NOT NULL,
descricao_acao TEXT NOT NULL,
responsavel VARCHAR(255) NOT NULL,
parceiros TEXT NOT NULL,
data_inicio DATE NOT NULL,
data_fim DATE NOT NULL,
status VARCHAR(50) NOT NULL,
observacoes TEXT NOT NULL,
FOREIGN KEY (risco_id) REFERENCES Risco(id)
);

CREATE TABLE Monitoramento (
id SERIAL PRIMARY KEY,
risco_id INTEGER,
data_verificacao DATE DEFAULT NOW(),
resultados TEXT NOT NULL,
acoes_futuras TEXT NOT NULL,
analise_critica TEXT NOT NULL,
FOREIGN KEY (risco_id) REFERENCES Risco(id)
);