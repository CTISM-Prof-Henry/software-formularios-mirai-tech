from datetime import date

from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token

from src.riscos.models import Macroprocesso, Monitoramento, ObjetivoPDI, PlanoAcao, Risco
from src.usuarios.importacao_unidades import importar_unidades_csv
from src.usuarios.models import Setor, Usuario
from src.usuarios.normalizacao_legado import (
    normalizar_riscos_legados,
    normalizar_vinculos_legados,
)

USUARIOS_DEMO = [
    {
        "siape": "2030001",
        "nome": "Ana Paula Multissetorial",
        "email": "ana.multissetorial@teste.ufsm.br",
        "setores": [
            ("CT", "Departamento de Computação Aplicada"),
            ("PM", "Departamento de Administração - PM"),
            ("CTISM", "Núcleo Pedagógico do CTISM"),
        ],
        "equipe": True,
    },
    {
        "siape": "2030002",
        "nome": "Bruno Gestor Centros",
        "email": "bruno.centros@teste.ufsm.br",
        "setores": [
            ("CT", "Departamento de Engenharia Mecânica"),
            ("PM", "Departamento de Ciências Econômicas - PM"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030003",
        "nome": "Carla Gestora Pesquisa",
        "email": "carla.pesquisa@teste.ufsm.br",
        "setores": [
            ("CT", "Departamento de Eletrônica e Computação"),
            ("PM", "Departamento de Ciências da Saúde - PM"),
            ("CT", "Departamento de Engenharia Sanitária e Ambiental"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030004",
        "nome": "Diego Gestor Ensino",
        "email": "diego.ensino@teste.ufsm.br",
        "setores": [
            ("CT", "Departamento de Engenharia de Produção e Sistemas"),
            ("PM", "Departamento de Alimentos e Nutrição - PM"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030005",
        "nome": "Elisa Gestora Tecnologia",
        "email": "elisa.tecnologia@teste.ufsm.br",
        "setores": [
            ("CT", "Departamento de Linguagens e Sistemas de Computação"),
            ("CT", "Departamento de Transportes"),
            ("PM", "Departamento de Zootecnia e Ciências Biológicas - PM"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030006",
        "nome": "Felipe Gestor Ambiental",
        "email": "felipe.ambiental@teste.ufsm.br",
        "setores": [
            ("CT", "Departamento de Engenharia Sanitária e Ambiental"),
            ("POLI", "Curso Superior de Tecnologia em Gestão Ambiental"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030007",
        "nome": "Gabriela Gestora Extensão",
        "email": "gabriela.extensao@teste.ufsm.br",
        "setores": [
            ("CAL", "Centro de Artes e Letras"),
            ("CE", "Centro de Educação"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030008",
        "nome": "Henrique Gestor Acadêmico",
        "email": "henrique.academico@teste.ufsm.br",
        "setores": [
            ("CCNE", "Centro de Ciências Naturais e Exatas"),
            ("CEFD", "Centro de Educação Física e Desportos"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030009",
        "nome": "Isabela Gestora Pessoas",
        "email": "isabela.pessoas@teste.ufsm.br",
        "setores": [
            ("CCSH", "Centro de Ciências Sociais e Humanas"),
            ("CCR", "Centro de Ciências Rurais"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030010",
        "nome": "João Gestor TI",
        "email": "joao.ti@teste.ufsm.br",
        "setores": [
            ("CT", "Departamento de Computação Aplicada"),
            ("CTISM", "Colégio Técnico Industrial de Santa Maria"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030011",
        "nome": "Karen Gestora Politécnico",
        "email": "karen.poli@teste.ufsm.br",
        "setores": [
            ("POLI", "Colégio Politécnico"),
            ("POLI", "Departamento de Ensino"),
        ],
        "equipe": False,
    },
    {
        "siape": "2030012",
        "nome": "Lucas Gestor Palmeira",
        "email": "lucas.pm@teste.ufsm.br",
        "setores": [
            ("PM", "Campus da Universidade Federal de Santa Maria em Palmeira das Missões"),
            ("PM", "Departamento de Administração - PM"),
        ],
        "equipe": False,
    },
]


RISCOS_DEMO = [
    {
        "setor": ("CT", "Departamento de Computação Aplicada"),
        "objetivo": "AI-D5-03",
        "macroprocesso": "Tecnologia da Informação",
        "categoria": "Operacional",
        "evento": "Interrupção de serviços críticos de sistemas acadêmicos.",
        "causa": "Falhas de infraestrutura, baixa redundância e atraso em manutenção preventiva.",
        "consequencia": "Indisponibilidade de serviços essenciais e atraso em rotinas institucionais.",
        "controles_atuais": "Backups periódicos, monitoramento básico e equipe de suporte em horário comercial.",
        "eficacia_controle": "Fraco",
        "probabilidade": 5,
        "impacto": 5,
        "prob_residual": 4,
        "imp_residual": 5,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Implementar alta disponibilidade, revisar monitoramento e formalizar plantão para incidentes.",
            "responsavel": "João Gestor TI",
            "parceiros": "Equipe de infraestrutura, CPD",
            "data_inicio": date(2026, 4, 1),
            "data_fim": date(2026, 8, 31),
            "status": "Em andamento",
            "observacoes": "Risco prioritário para o semestre.",
        },
        "monitoramento": {
            "resultados": "Ambiente crítico mapeado e cronograma técnico aprovado.",
            "acoes_futuras": "Contratar recurso de contingência e finalizar testes de failover.",
            "analise_critica": "Risco permanece alto até conclusão da redundância.",
        },
    },
    {
        "setor": ("CT", "Departamento de Engenharia Mecânica"),
        "objetivo": "AI-D2-03",
        "macroprocesso": "Infraestrutura dos Campi",
        "categoria": "Operacional",
        "evento": "Paralisação parcial de laboratórios por falha em equipamentos compartilhados.",
        "causa": "Uso intensivo sem plano formal de reposição e manutenção.",
        "consequencia": "Prejuízo em aulas práticas, pesquisa e extensão.",
        "controles_atuais": "Manutenção corretiva sob demanda e registro manual de ocorrências.",
        "eficacia_controle": "Satisfatório",
        "probabilidade": 4,
        "impacto": 4,
        "prob_residual": 3,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Criar plano de manutenção preventiva e priorização de reposição de ativos críticos.",
            "responsavel": "Bruno Gestor Centros",
            "parceiros": "Direção do CT, patrimônio",
            "data_inicio": date(2026, 4, 10),
            "data_fim": date(2026, 10, 15),
            "status": "Em andamento",
            "observacoes": "",
        },
    },
    {
        "setor": ("CCNE", "Centro de Ciências Naturais e Exatas"),
        "objetivo": "PR-D2-03",
        "macroprocesso": "Ensino",
        "categoria": "Estratégico",
        "evento": "Defasagem curricular frente às novas demandas científicas e tecnológicas.",
        "causa": "Baixa frequência de revisão curricular integrada entre cursos.",
        "consequencia": "Perda de aderência às necessidades dos estudantes e do mercado.",
        "controles_atuais": "Revisões pontuais por colegiado e avaliações institucionais periódicas.",
        "eficacia_controle": "Fraco",
        "probabilidade": 3,
        "impacto": 5,
        "prob_residual": 3,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Instituir agenda anual de revisão curricular e mapear lacunas por curso.",
            "responsavel": "Henrique Gestor Acadêmico",
            "parceiros": "Coordenações e NDEs",
            "data_inicio": date(2026, 5, 1),
            "data_fim": date(2026, 11, 30),
            "status": "Não iniciada",
            "observacoes": "Depende de aprovação em colegiado.",
        },
    },
    {
        "setor": ("POLI", "Colégio Politécnico"),
        "objetivo": "AS-D2-01",
        "macroprocesso": "Ensino",
        "categoria": "Operacional",
        "evento": "Aumento da evasão em cursos técnicos com menor acompanhamento pedagógico.",
        "causa": "Acompanhamento fragmentado de frequência e baixo acionamento precoce.",
        "consequencia": "Queda na permanência estudantil e impacto em indicadores institucionais.",
        "controles_atuais": "Contato eventual com estudantes e registro acadêmico tradicional.",
        "eficacia_controle": "Fraco",
        "probabilidade": 4,
        "impacto": 4,
        "prob_residual": 3,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Criar rotina de acompanhamento preventivo de frequência e risco de evasão.",
            "responsavel": "Karen Gestora Politécnico",
            "parceiros": "Coordenações de curso, apoio pedagógico",
            "data_inicio": date(2026, 4, 20),
            "data_fim": date(2026, 9, 30),
            "status": "Em andamento",
            "observacoes": "",
        },
        "monitoramento": {
            "resultados": "Definidos critérios iniciais de alerta para frequência e rendimento.",
            "acoes_futuras": "Integrar acompanhamento com coordenações dos cursos técnicos.",
            "analise_critica": "A ação tem boa aceitação, mas precisa de rotina consolidada.",
        },
    },
    {
        "setor": ("PM", "Campus da Universidade Federal de Santa Maria em Palmeira das Missões"),
        "objetivo": "PR-D6-02",
        "macroprocesso": "Relações Institucionais",
        "categoria": "Imagem",
        "evento": "Baixa articulação com atores locais em ações de extensão e cooperação.",
        "causa": "Comunicação reativa e ausência de agenda permanente de relacionamento.",
        "consequencia": "Menor visibilidade institucional e redução de parcerias estratégicas.",
        "controles_atuais": "Ações pontuais de divulgação e eventos isolados.",
        "eficacia_controle": "Inexistente",
        "probabilidade": 3,
        "impacto": 4,
        "prob_residual": 3,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Estruturar calendário de relacionamento institucional com entidades locais.",
            "responsavel": "Lucas Gestor Palmeira",
            "parceiros": "Direção do campus, comunicação",
            "data_inicio": date(2026, 5, 5),
            "data_fim": date(2026, 12, 15),
            "status": "Não iniciada",
            "observacoes": "",
        },
    },
    {
        "setor": ("CTISM", "Colégio Técnico Industrial de Santa Maria"),
        "objetivo": "AI-D5-03",
        "macroprocesso": "Tecnologia da Informação",
        "categoria": "Operacional",
        "evento": "Interrupção de conectividade em laboratórios com alta dependência de rede.",
        "causa": "Infraestrutura de rede saturada e renovação parcial de equipamentos.",
        "consequencia": "Comprometimento de aulas práticas e de serviços digitais de apoio.",
        "controles_atuais": "Monitoramento básico de rede e atendimento corretivo.",
        "eficacia_controle": "Fraco",
        "probabilidade": 4,
        "impacto": 4,
        "prob_residual": 3,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Revisar topologia de rede e ampliar capacidade dos pontos críticos.",
            "responsavel": "João Gestor TI",
            "parceiros": "Equipe de redes e direção do CTISM",
            "data_inicio": date(2026, 4, 15),
            "data_fim": date(2026, 7, 31),
            "status": "Em andamento",
            "observacoes": "",
        },
    },
    {
        "setor": ("CCR", "Centro de Ciências Rurais"),
        "objetivo": "AS-D6-02",
        "macroprocesso": "Extensão",
        "categoria": "Estratégico",
        "evento": "Baixa escalabilidade de serviços de apoio à comunidade rural.",
        "causa": "Capacidade operacional limitada e priorização sem critérios unificados.",
        "consequencia": "Redução do alcance social de ações institucionais.",
        "controles_atuais": "Planejamento anual e atendimento sob demanda.",
        "eficacia_controle": "Satisfatório",
        "probabilidade": 3,
        "impacto": 4,
        "prob_residual": 2,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Criar critérios de priorização e ampliar integração entre projetos de extensão.",
            "responsavel": "Isabela Gestora Pessoas",
            "parceiros": "Coordenadores de projetos, direção CCR",
            "data_inicio": date(2026, 6, 1),
            "data_fim": date(2026, 11, 15),
            "status": "Não iniciada",
            "observacoes": "",
        },
    },
    {
        "setor": ("CAL", "Centro de Artes e Letras"),
        "objetivo": "PR-D5-03",
        "macroprocesso": "Comunicação Institucional",
        "categoria": "Imagem",
        "evento": "Ruído de comunicação em eventos acadêmicos e culturais de grande alcance.",
        "causa": "Fluxo descentralizado de divulgação e baixa padronização institucional.",
        "consequencia": "Informações inconsistentes ao público e menor alcance das ações.",
        "controles_atuais": "Divulgação por equipes locais e revisão eventual pela comunicação.",
        "eficacia_controle": "Fraco",
        "probabilidade": 3,
        "impacto": 3,
        "prob_residual": 2,
        "imp_residual": 3,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Criar fluxo padrão de divulgação para eventos e calendário compartilhado.",
            "responsavel": "Gabriela Gestora Extensão",
            "parceiros": "Comunicação institucional e coordenações",
            "data_inicio": date(2026, 5, 10),
            "data_fim": date(2026, 8, 30),
            "status": "Concluída",
            "observacoes": "Fluxo piloto já validado em dois eventos.",
        },
    },
    {
        "setor": ("CE", "Centro de Educação"),
        "objetivo": "PR-D2-04",
        "macroprocesso": "Planejamento Pedagógico",
        "categoria": "Operacional",
        "evento": "Atraso em estratégias de permanência e apoio ao estudante.",
        "causa": "Dependência de iniciativas isoladas e ausência de monitoramento consolidado.",
        "consequencia": "Impacto na permanência e conclusão em prazo adequado.",
        "controles_atuais": "Projetos de apoio e acompanhamento por curso.",
        "eficacia_controle": "Satisfatório",
        "probabilidade": 3,
        "impacto": 4,
        "prob_residual": 2,
        "imp_residual": 3,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Integrar indicadores de permanência e protocolos de encaminhamento por curso.",
            "responsavel": "Gabriela Gestora Extensão",
            "parceiros": "Coordenações e assistência estudantil",
            "data_inicio": date(2026, 4, 25),
            "data_fim": date(2026, 10, 31),
            "status": "Em andamento",
            "observacoes": "",
        },
    },
    {
        "setor": ("CEFD", "Centro de Educação Física e Desportos"),
        "objetivo": "AI-D5-01",
        "macroprocesso": "Infraestrutura dos Campi",
        "categoria": "Operacional",
        "evento": "Indisponibilidade de espaços esportivos por manutenção emergencial.",
        "causa": "Uso contínuo e manutenção preventiva insuficiente.",
        "consequencia": "Prejuízo a aulas, projetos esportivos e eventos.",
        "controles_atuais": "Inspeções visuais e correções conforme demanda.",
        "eficacia_controle": "Fraco",
        "probabilidade": 4,
        "impacto": 3,
        "prob_residual": 3,
        "imp_residual": 3,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Programar calendário anual de manutenção e reserva técnica de espaços.",
            "responsavel": "Henrique Gestor Acadêmico",
            "parceiros": "Infraestrutura e direção do CEFD",
            "data_inicio": date(2026, 6, 10),
            "data_fim": date(2026, 12, 20),
            "status": "Não iniciada",
            "observacoes": "",
        },
    },
    {
        "setor": ("CCSH", "Centro de Ciências Sociais e Humanas"),
        "objetivo": "AS-D5-01",
        "macroprocesso": "Pessoas",
        "categoria": "Integridade",
        "evento": "Falhas de governança em fluxos administrativos descentralizados.",
        "causa": "Baixa padronização documental e dependência de conhecimento tácito.",
        "consequencia": "Risco de inconsistência processual e retrabalho.",
        "controles_atuais": "Conferência manual e orientações por setor.",
        "eficacia_controle": "Fraco",
        "probabilidade": 3,
        "impacto": 4,
        "prob_residual": 2,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Documentar fluxos críticos e implantar checklists mínimos de governança.",
            "responsavel": "Isabela Gestora Pessoas",
            "parceiros": "Secretarias e direção do CCSH",
            "data_inicio": date(2026, 5, 12),
            "data_fim": date(2026, 9, 25),
            "status": "Em andamento",
            "observacoes": "",
        },
    },
    {
        "setor": ("PM", "Departamento de Administração - PM"),
        "objetivo": "PR-D5-01",
        "macroprocesso": "Orçamento e Finanças",
        "categoria": "Financeiro",
        "evento": "Baixa previsibilidade financeira em demandas acadêmicas emergenciais.",
        "causa": "Planejamento orçamentário com pouca granularidade de risco.",
        "consequencia": "Atraso na execução de ações estratégicas do campus.",
        "controles_atuais": "Revisão periódica das dotações e priorização reativa.",
        "eficacia_controle": "Fraco",
        "probabilidade": 3,
        "impacto": 5,
        "prob_residual": 3,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": "Criar reserva para eventos críticos e matriz de priorização orçamentária.",
            "responsavel": "Lucas Gestor Palmeira",
            "parceiros": "Coordenação administrativa do campus",
            "data_inicio": date(2026, 5, 3),
            "data_fim": date(2026, 10, 20),
            "status": "Em andamento",
            "observacoes": "",
        },
    },
]


def obter_setor(sigla_centro, nome):
    return Setor.objects.get(
        sigla_centro=sigla_centro,
        nome=nome,
        fonte_oficial=True,
        ativo=True,
    )


class Command(BaseCommand):
    help = (
        "Cria uma base de demonstracao com usuarios comuns, riscos, planos de acao "
        "e monitoramentos para testar o sistema sem criar novos administradores."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default="Teste@12345",
            help="Senha aplicada aos usuarios de demonstracao.",
        )

    def handle(self, *args, **options):
        password = options["password"]

        importar_unidades_csv(Setor, desativar_legado=True)
        normalizar_vinculos_legados(Usuario, Setor)
        normalizar_riscos_legados(Setor)

        usuarios_criados = 0
        usuarios_atualizados = 0
        riscos_criados = 0
        riscos_atualizados = 0
        planos_criados = 0
        planos_atualizados = 0
        monitoramentos_criados = 0

        for dados_usuario in USUARIOS_DEMO:
            setores = [obter_setor(sigla, nome) for sigla, nome in dados_usuario["setores"]]
            usuario, criado = Usuario.objects.get_or_create(
                siape=dados_usuario["siape"],
                defaults={
                    "nome": dados_usuario["nome"],
                    "email": dados_usuario["email"],
                    "equipe": dados_usuario["equipe"],
                },
            )

            usuario.nome = dados_usuario["nome"]
            usuario.email = dados_usuario["email"]
            usuario.equipe = dados_usuario["equipe"]
            usuario.ativo = True
            usuario.is_superuser = False
            usuario.set_password(password)
            usuario.save()
            usuario.setores.set(setores)
            Token.objects.get_or_create(user=usuario)

            if criado:
                usuarios_criados += 1
            else:
                usuarios_atualizados += 1

        for dados_risco in RISCOS_DEMO:
            setor = obter_setor(*dados_risco["setor"])
            objetivo = ObjetivoPDI.objects.get(codigo=dados_risco["objetivo"])
            macro = Macroprocesso.objects.get(nome=dados_risco["macroprocesso"])

            risco, criado = Risco.objects.update_or_create(
                setor=setor,
                objetivo=objetivo,
                macroprocesso=macro,
                evento=dados_risco["evento"],
                defaults={
                    "categoria": dados_risco["categoria"],
                    "causa": dados_risco["causa"],
                    "consequencia": dados_risco["consequencia"],
                    "controles_atuais": dados_risco["controles_atuais"],
                    "eficacia_controle": dados_risco["eficacia_controle"],
                    "probabilidade": dados_risco["probabilidade"],
                    "impacto": dados_risco["impacto"],
                    "prob_residual": dados_risco["prob_residual"],
                    "imp_residual": dados_risco["imp_residual"],
                },
            )

            if criado:
                riscos_criados += 1
            else:
                riscos_atualizados += 1

            plano, plano_criado = PlanoAcao.objects.update_or_create(
                risco=risco,
                defaults=dados_risco["plano"],
            )
            if plano_criado:
                planos_criados += 1
            else:
                planos_atualizados += 1

            dados_monitoramento = dados_risco.get("monitoramento")
            if dados_monitoramento and not risco.monitoramentos.exists():
                Monitoramento.objects.create(risco=risco, **dados_monitoramento)
                monitoramentos_criados += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Base demo pronta. "
                f"Usuarios: {usuarios_criados} criados, {usuarios_atualizados} atualizados. "
                f"Riscos: {riscos_criados} criados, {riscos_atualizados} atualizados. "
                f"Planos: {planos_criados} criados, {planos_atualizados} atualizados. "
                f"Monitoramentos criados: {monitoramentos_criados}. "
                f"Senha padrao: {password}"
            )
        )
