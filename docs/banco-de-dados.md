# Banco de dados

## Diagrama de classes (UML) - Mermaid

Utilizando a ferramenta Mermaid para representar as principais classes persistidas no banco de dados e seus relacionamentos.

```mermaid
classDiagram
    class Setor {
        +id: Integer
        +nome: String
        +sigla: String
    }

    class GerenciadorUsuario {
        <<service>>
        +createUser(siape: String, password: String): Usuario
        +createSuperuser(siape: String, password: String): Usuario
        +validarSiape(): void
        +definirPermissoesSuperusuario(): void
    }

    class Usuario {
        +id: Integer
        +siape: String
        +nome: String
        +email: String
        +password: String
        +ativo: Boolean
        +equipe: Boolean
        +lastLogin: DateTime
        +isSuperuser: Boolean
        +isStaff(): Boolean
        +isActive(): Boolean
    }

    class UsuarioSetor {
        +id: Integer
    }

    class CodigoRecuperacao {
        +id: Integer
        +email: String
        +codigo: String
        +criadoEm: DateTime
        +gerarCodigo(): String
        +validarExpiracao(): Boolean
    }

    class DesafioPDI {
        +id: Integer
        +numero: Integer
        +descricao: String
    }

    class ObjetivoPDI {
        +id: Integer
        +codigo: String
        +descricao: String
    }

    class Macroprocesso {
        +id: Integer
        +nome: String
    }

    class Risco {
        +id: Integer
        +categoria: CategoriaRisco
        +evento: String
        +causa: String
        +consequencia: String
        +controlesAtuais: String
        +eficaciaControle: EficaciaControle
        +probabilidade: Integer
        +impacto: Integer
        +nivelRisco: Integer
        +probResidual: Integer
        +impResidual: Integer
        +nivelResidual: Integer
        +calcularNivelRisco(): Integer
        +calcularNivelResidual(): Integer
    }

    class PlanoAcao {
        +id: Integer
        +tipoResposta: TipoResposta
        +descricaoAcao: String
        +responsavel: String
        +parceiros: String
        +dataInicio: Date
        +dataFim: Date
        +status: StatusPlanoAcao
        +observacoes: String
        +atualizarStatus(): void
    }

    class Monitoramento {
        +id: Integer
        +dataVerificacao: Date
        +resultados: String
        +acoesFuturas: String
        +analiseCritica: String
        +registrarAnalise(): void
    }

    class CategoriaRisco {
        <<enumeration>>
        Operacional
        Estrategico
        Integridade
        Imagem
        Financeiro
    }

    class EficaciaControle {
        <<enumeration>>
        Inexistente
        Fraco
        Satisfatorio
        Forte
    }

    class TipoResposta {
        <<enumeration>>
        Mitigar
        Evitar
        Transferir
        Aceitar
    }

    class StatusPlanoAcao {
        <<enumeration>>
        NaoIniciada
        EmAndamento
        Concluida
        Atrasada
    }

    GerenciadorUsuario ..> Usuario : cria e gerencia
    Usuario "1" --> "0..*" UsuarioSetor : associa
    Setor "1" --> "0..*" UsuarioSetor : associa
    Usuario "1" --> "0..*" CodigoRecuperacao : solicita
    DesafioPDI "1" --> "0..*" ObjetivoPDI : organiza
    Setor "1" --> "0..*" Risco : possui
    ObjetivoPDI "1" --> "0..*" Risco : referencia
    Macroprocesso "1" --> "0..*" Risco : classifica
    Risco "1" --> "0..*" PlanoAcao : gera
    Risco "1" --> "0..*" Monitoramento : recebe
    Risco --> CategoriaRisco : categoria
    Risco --> EficaciaControle : eficaciaControle
    PlanoAcao --> TipoResposta : tipoResposta
    PlanoAcao --> StatusPlanoAcao : status

    note for GerenciadorUsuario "Serviço de suporte à criação de usuários no Django."
    note for Usuario "Modelo customizado baseado em SIAPE no lugar de username."
    note for UsuarioSetor "Representa a associação muitos-para-muitos entre usuário e setor."
    note for CodigoRecuperacao "Usado no fluxo de envio, validação e redefinição de senha; o e-mail é mantido como dado operacional."
    note for Risco "A classe concentra as regras de cálculo do nível de risco e do nível residual."
    note for PlanoAcao "Representa o tratamento do risco em formato 5W2H."
    note for Monitoramento "Mantém o histórico de acompanhamento e análise do risco."
```

## Diagrama entidade relacionamento (ER) (Padrão ISO/Min-max) - Dbdiagram.io

Utilizando a sintaxe do Dbdiagram.io para representar a estrutura relacional do banco com base nas tabelas atuais do projeto.

![Modelo ER](images/model-banco/modelo-er.png)

## Tecnologia utilizada

O sistema utiliza **PostgreSQL 16**, executado localmente por meio do Docker Compose.

## Configuração local

O container do banco é definido em `docker-compose.yml` com:

- banco: `gestao_risco_ufsm`;
- usuário: `postgres`;
- senha: `postgres`;
- porta externa: `5433`;
- porta interna do container: `5432`.

## Conexão usada pelo Django

O backend espera as seguintes variáveis no `.env`:

```env
DATABASE_NAME=gestao_risco_ufsm
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
```

## Estrutura principal

As entidades mais relevantes do sistema incluem:

- `setores`
  - armazena as unidades administrativas vinculadas a usuários e riscos;
- `usuarios`
  - representa os gestores autenticados no sistema;
- `usuario_setores`
  - tabela intermediária para o relacionamento muitos-para-muitos entre gestores e setores;
- `codigos_recuperacao`
  - registra códigos temporários usados no fluxo de recuperação de senha;
- `desafios_pdi`, `objetivos_pdi` e `macroprocessos`
  - representam a estrutura estratégica utilizada como referência para os riscos;
- `riscos`
  - armazena os registros centrais do sistema e os níveis calculados;
- `planos_acao`
  - guarda as ações de tratamento associadas a cada risco;
- `monitoramentos`
  - mantém o histórico de acompanhamento dos riscos.
