"""
Seed de apresentação do SIGR-UFSM.

Limpa usuários e planos existentes e recria dados realistas para demonstração:
- 1 administrador (conta do apresentador)
- 9 gestores (mix de gestor e gestor_adm, setores variados)
- 6 planos de risco cobrindo as 5 categorias e diferentes níveis de risco
"""

from datetime import date

from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token

from src.riscos.models import Macroprocesso, Monitoramento, ObjetivoPDI, PlanoAcao, Risco
from src.usuarios.importacao_unidades import importar_unidades_csv
from src.usuarios.models import Setor, Usuario

ADMIN = {
    "siape": "202512603",
    "nome": "Administrador SIGR",
    "email": "admin.sigr@ufsm.br",
    "senha": "12345678",
    "is_superuser": True,
    "equipe": True,
    "cargo": "gestor_adm",
}

GESTORES = [
    {
        "siape": "1847293",
        "nome": "Maria Cláudia Fonseca",
        "email": "maria.fonseca@ufsm.br",
        "cargo": "gestor_adm",
        "setores": [("CCR", "Centro de Ciências Rurais")],
    },
    {
        "siape": "2356184",
        "nome": "João Paulo Silveira",
        "email": "joao.silveira@ufsm.br",
        "cargo": "gestor_adm",
        "setores": [("CT", "Departamento de Computação Aplicada")],
    },
    {
        "siape": "3074512",
        "nome": "Ana Beatriz Rodrigues",
        "email": "ana.rodrigues@ufsm.br",
        "cargo": "gestor",
        "setores": [("CCNE", "Centro de Ciências Naturais e Exatas")],
    },
    {
        "siape": "4198627",
        "nome": "Carlos Eduardo Nunes",
        "email": "carlos.nunes@ufsm.br",
        "cargo": "gestor",
        "setores": [("CCSH", "Centro de Ciências Sociais e Humanas")],
    },
    {
        "siape": "5263049",
        "nome": "Fernanda Lima Costa",
        "email": "fernanda.costa@ufsm.br",
        "cargo": "gestor",
        "setores": [("CE", "Centro de Educação")],
    },
    {
        "siape": "6381720",
        "nome": "Rafael Andrade Souza",
        "email": "rafael.souza@ufsm.br",
        "cargo": "gestor",
        "setores": [
            ("CT", "Departamento de Engenharia de Produção e Sistemas"),
        ],
    },
    {
        "siape": "7492053",
        "nome": "Juliana Pereira Martins",
        "email": "juliana.martins@ufsm.br",
        "cargo": "gestor",
        "setores": [
            ("PM", "Campus da Universidade Federal de Santa Maria em Palmeira das Missões"),
        ],
    },
    {
        "siape": "8517364",
        "nome": "Marcelo Santos Alves",
        "email": "marcelo.alves@ufsm.br",
        "cargo": "gestor",
        "setores": [("POLI", "Colégio Politécnico")],
    },
    {
        "siape": "9630481",
        "nome": "Vanessa Oliveira Cruz",
        "email": "vanessa.cruz@ufsm.br",
        "cargo": "gestor",
        "setores": [("CAL", "Centro de Artes e Letras")],
    },
]

PLANOS = [
    # 1 — Operacional · Extremo (nivel_residual = 4×5 = 20)
    {
        "setor": ("CT", "Departamento de Computação Aplicada"),
        "objetivo": "AI-D5-03",
        "macroprocesso": "Tecnologia da Informação",
        "categoria": "Operacional",
        "evento": (
            "Indisponibilidade prolongada dos sistemas acadêmicos críticos "
            "(SIE, portal do aluno, e-mail institucional)."
        ),
        "causa": (
            "Infraestrutura de TI envelhecida, ausência de redundância e "
            "baixo tempo de resposta para incidentes fora do horário comercial."
        ),
        "consequencia": (
            "Paralisia de matrículas, emissão de documentos e comunicação "
            "institucional, com impacto direto nos estudantes e servidores."
        ),
        "controles_atuais": (
            "Backups diários em servidor local, monitoramento reativo e equipe "
            "de suporte disponível apenas em horário comercial."
        ),
        "eficacia_controle": "Fraco",
        "probabilidade": 5,
        "impacto": 5,
        "prob_residual": 4,
        "imp_residual": 5,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": (
                "Implementar solução de alta disponibilidade com failover automático, "
                "formalizar plantão 24h para incidentes críticos e contratar serviço "
                "de backup em nuvem com RTO de 4h."
            ),
            "responsavel": "João Paulo Silveira",
            "parceiros": "CPD UFSM, Diretoria de TI",
            "data_inicio": date(2026, 3, 1),
            "data_fim": date(2026, 8, 31),
            "status": "Em andamento",
            "observacoes": "Risco prioritário para o semestre. Aprovação orçamentária obtida.",
        },
        "monitoramento": {
            "resultados": (
                "Mapeamento dos sistemas críticos concluído. Proposta técnica de "
                "redundância encaminhada para aprovação da Reitoria."
            ),
            "acoes_futuras": (
                "Contratar serviço de colocation, finalizar testes de failover "
                "e treinar equipe para o novo protocolo de incidentes."
            ),
            "analise_critica": (
                "Risco permanece extremo até a implantação da redundância. "
                "Prazo de conclusão estimado para julho/2026."
            ),
        },
    },

    # 2 — Estratégico · Alto (nivel_residual = 3×4 = 12)
    {
        "setor": ("CCNE", "Centro de Ciências Naturais e Exatas"),
        "objetivo": "PR-D2-03",
        "macroprocesso": "Ensino",
        "categoria": "Estratégico",
        "evento": (
            "Defasagem curricular dos cursos de graduação frente às novas "
            "demandas científicas, tecnológicas e do mercado de trabalho."
        ),
        "causa": (
            "Ciclos de revisão curricular longos, baixa integração entre "
            "departamentos e pouca escuta ativa de egressos e empregadores."
        ),
        "consequencia": (
            "Perda de atratividade dos cursos, queda nos indicadores de "
            "empregabilidade dos egressos e avaliação negativa em rankings."
        ),
        "controles_atuais": (
            "Revisões pontuais por NDE a cada 3 anos e avaliações do INEP "
            "que indicam lacunas, porém sem plano estruturado de resposta."
        ),
        "eficacia_controle": "Fraco",
        "probabilidade": 4,
        "impacto": 5,
        "prob_residual": 3,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": (
                "Instituir comitê permanente de atualização curricular com "
                "representantes docentes, discentes e egressos; realizar workshop "
                "anual de alinhamento com o mercado."
            ),
            "responsavel": "Ana Beatriz Rodrigues",
            "parceiros": "NDEs, Coordenações de Curso, Pró-Reitoria de Graduação",
            "data_inicio": date(2026, 5, 1),
            "data_fim": date(2026, 11, 30),
            "status": "Não iniciada",
            "observacoes": "Depende de aprovação em assembleia departamental prevista para maio.",
        },
    },

    # 3 — Financeiro · Alto (nivel_residual = 3×4 = 12)
    {
        "setor": ("PM", "Campus da Universidade Federal de Santa Maria em Palmeira das Missões"),
        "objetivo": "SF-D5-03",
        "macroprocesso": "Orçamento e Finanças",
        "categoria": "Financeiro",
        "evento": (
            "Contingenciamento orçamentário imprevisto comprometendo atividades "
            "fins do campus de Palmeira das Missões."
        ),
        "causa": (
            "Dependência quase exclusiva do orçamento federal com baixa "
            "captação de recursos externos e reserva de contingência inexistente."
        ),
        "consequencia": (
            "Paralisação de projetos de pesquisa, extensão e manutenção "
            "predial, com reflexo no atendimento à comunidade local."
        ),
        "controles_atuais": (
            "Revisão trimestral das dotações orçamentárias e priorização "
            "reativa conforme demanda dos departamentos."
        ),
        "eficacia_controle": "Fraco",
        "probabilidade": 4,
        "impacto": 4,
        "prob_residual": 3,
        "imp_residual": 4,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": (
                "Elaborar plano de captação de recursos via projetos externos "
                "(FINEP, CNPq, parcerias municipais) e constituir fundo de reserva "
                "com 5% do orçamento anual."
            ),
            "responsavel": "Juliana Pereira Martins",
            "parceiros": "Pró-Reitoria de Planejamento, Prefeitura Municipal",
            "data_inicio": date(2026, 4, 15),
            "data_fim": date(2026, 12, 15),
            "status": "Em andamento",
            "observacoes": "",
        },
        "monitoramento": {
            "resultados": (
                "Levantamento de editais de fomento externo realizado. "
                "Três projetos submetidos ao CNPq em março/2026."
            ),
            "acoes_futuras": (
                "Aguardar resultado dos projetos submetidos e articular "
                "convênio com prefeitura para contrapartida em extensão."
            ),
            "analise_critica": (
                "Ações em andamento dentro do prazo. Risco de não aprovação "
                "dos projetos mantém nível alto até confirmação de recursos."
            ),
        },
    },

    # 4 — Integridade · Moderado (nivel_residual = 2×3 = 6)
    {
        "setor": ("CCSH", "Centro de Ciências Sociais e Humanas"),
        "objetivo": "AS-D5-01",
        "macroprocesso": "Pessoas",
        "categoria": "Integridade",
        "evento": (
            "Conflito de interesses não declarado em bancas de avaliação, "
            "processos seletivos e pareceres de pesquisa."
        ),
        "causa": (
            "Ausência de política formal de declaração de conflito de interesses "
            "e baixa cultura de transparência nos processos colegiados."
        ),
        "consequencia": (
            "Questionamento da imparcialidade institucional, risco de "
            "judicialização e danos à reputação do centro."
        ),
        "controles_atuais": (
            "Declaração voluntária em alguns colegiados e normas gerais da "
            "legislação federal, sem protocolo interno estruturado."
        ),
        "eficacia_controle": "Satisfatório",
        "probabilidade": 3,
        "impacto": 4,
        "prob_residual": 2,
        "imp_residual": 3,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": (
                "Aprovar resolução interna de conflito de interesses, "
                "implantar formulário digital de declaração obrigatória e "
                "capacitar servidores sobre ética pública."
            ),
            "responsavel": "Carlos Eduardo Nunes",
            "parceiros": "Secretaria do CCSH, Ouvidoria UFSM",
            "data_inicio": date(2026, 4, 1),
            "data_fim": date(2026, 9, 30),
            "status": "Em andamento",
            "observacoes": "Minuta da resolução em análise pela procuradoria jurídica.",
        },
    },

    # 5 — Imagem · Moderado (nivel_residual = 2×2 = 4)
    {
        "setor": ("CE", "Centro de Educação"),
        "objetivo": "PR-D5-03",
        "macroprocesso": "Comunicação Institucional",
        "categoria": "Imagem",
        "evento": (
            "Gestão inadequada da comunicação em situações de crise "
            "envolvendo denúncias ou episódios de repercussão pública."
        ),
        "causa": (
            "Ausência de protocolo formal de gestão de crise, fluxo de "
            "comunicação descentralizado e sem porta-voz definido."
        ),
        "consequencia": (
            "Amplificação negativa nas redes sociais, perda de confiança "
            "da comunidade e dificuldade de resposta institucional tempestiva."
        ),
        "controles_atuais": (
            "Comunicação reativamente coordenada pela direção e "
            "assessoria de comunicação central, sem protocolo específico."
        ),
        "eficacia_controle": "Inexistente",
        "probabilidade": 3,
        "impacto": 3,
        "prob_residual": 2,
        "imp_residual": 2,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": (
                "Elaborar protocolo de gestão de crise comunicacional, "
                "designar porta-voz e realizar simulado de crise com a equipe."
            ),
            "responsavel": "Fernanda Lima Costa",
            "parceiros": "Assessoria de Comunicação UFSM, Diretoria CE",
            "data_inicio": date(2026, 6, 1),
            "data_fim": date(2026, 10, 31),
            "status": "Não iniciada",
            "observacoes": "",
        },
    },

    # 6 — Operacional · Baixo (nivel_residual = 1×2 = 2)
    {
        "setor": ("POLI", "Colégio Politécnico"),
        "objetivo": "PR-D5-01",
        "macroprocesso": "Compras, Suprimentos e Patrimônio",
        "categoria": "Operacional",
        "evento": (
            "Atrasos recorrentes nos processos de compra de insumos e "
            "materiais didáticos para os cursos técnicos."
        ),
        "causa": (
            "Planejamento de compras realizado tardiamente, especificações "
            "técnicas imprecisas e alto índice de impugnação de licitações."
        ),
        "consequencia": (
            "Paralisação pontual de atividades práticas e retrabalho "
            "administrativo com impacto na experiência do aluno."
        ),
        "controles_atuais": (
            "Almoxarifado com estoque mínimo e compras emergenciais via "
            "dispensa de licitação quando necessário."
        ),
        "eficacia_controle": "Forte",
        "probabilidade": 2,
        "impacto": 2,
        "prob_residual": 1,
        "imp_residual": 2,
        "plano": {
            "tipo_resposta": "Mitigar",
            "descricao_acao": (
                "Antecipar o planejamento de compras para o primeiro trimestre "
                "e padronizar especificações técnicas por área, reduzindo "
                "impugnações e agilizando licitações."
            ),
            "responsavel": "Marcelo Santos Alves",
            "parceiros": "Setor de Compras UFSM, Coordenações de Curso",
            "data_inicio": date(2026, 2, 1),
            "data_fim": date(2026, 5, 31),
            "status": "Concluída",
            "observacoes": (
                "Planejamento 2026 antecipado com sucesso. Redução de 40% no "
                "tempo médio de processos licitatórios em relação ao ano anterior."
            ),
        },
    },
]


def _obter_setor(sigla_centro, nome):
    try:
        return Setor.objects.get(sigla_centro=sigla_centro, nome=nome, fonte_oficial=True)
    except Setor.DoesNotExist:
        # Fallback sem filtro de fonte_oficial para ambientes de teste
        return Setor.objects.get(sigla_centro=sigla_centro, nome=nome)


class Command(BaseCommand):
    help = (
        "Limpa usuários e planos existentes e popula o banco com dados "
        "realistas para apresentação do SIGR-UFSM."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--senha-gestores",
            default="Sigr@2025",
            help="Senha aplicada a todos os gestores (exceto o admin).",
        )

    def handle(self, *args, **options):
        senha_gestores = options["senha_gestores"]

        self.stdout.write("→ Importando unidades oficiais da UFSM...")
        importar_unidades_csv(Setor, desativar_legado=True)

        # ── Limpeza ──────────────────────────────────────────────────────────
        self.stdout.write("→ Removendo planos de risco existentes...")
        Risco.all_objects.all().delete()

        self.stdout.write("→ Removendo usuários existentes...")
        Usuario.objects.all().delete()

        # ── Admin ─────────────────────────────────────────────────────────────
        self.stdout.write("→ Criando administrador...")
        admin = Usuario.objects.create_superuser(
            siape=ADMIN["siape"],
            password=ADMIN["senha"],
            nome=ADMIN["nome"],
            email=ADMIN["email"],
        )
        admin.cargo = ADMIN["cargo"]
        admin.save(update_fields=["cargo"])
        Token.objects.get_or_create(user=admin)

        # ── Gestores ──────────────────────────────────────────────────────────
        self.stdout.write("→ Criando gestores...")
        usuarios_por_setor = {}

        for dados in GESTORES:
            usuario = Usuario.objects.create_user(
                siape=dados["siape"],
                password=senha_gestores,
                nome=dados["nome"],
                email=dados["email"],
            )
            usuario.cargo = dados["cargo"]
            usuario.equipe = False
            usuario.save(update_fields=["cargo", "equipe"])

            setores = [_obter_setor(sigla, nome) for sigla, nome in dados["setores"]]
            usuario.setores.set(setores)
            Token.objects.get_or_create(user=usuario)

            for setor in setores:
                usuarios_por_setor.setdefault((setor.sigla_centro, setor.nome), usuario)

        # ── Planos de risco ───────────────────────────────────────────────────
        self.stdout.write("→ Criando planos de risco...")
        for dados in PLANOS:
            sigla, nome_setor = dados["setor"]
            setor = _obter_setor(sigla, nome_setor)
            objetivo = ObjetivoPDI.objects.get(codigo=dados["objetivo"])
            macroprocesso = Macroprocesso.objects.get(nome=dados["macroprocesso"])

            risco = Risco.objects.create(
                setor=setor,
                objetivo=objetivo,
                macroprocesso=macroprocesso,
                categoria=dados["categoria"],
                evento=dados["evento"],
                causa=dados["causa"],
                consequencia=dados["consequencia"],
                controles_atuais=dados["controles_atuais"],
                eficacia_controle=dados["eficacia_controle"],
                probabilidade=dados["probabilidade"],
                impacto=dados["impacto"],
                prob_residual=dados["prob_residual"],
                imp_residual=dados["imp_residual"],
            )

            PlanoAcao.objects.create(risco=risco, **dados["plano"])

            if "monitoramento" in dados:
                Monitoramento.objects.create(risco=risco, **dados["monitoramento"])

        # ── Resumo ────────────────────────────────────────────────────────────
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("✔  Seed de apresentação concluído!"))
        self.stdout.write("")
        self.stdout.write(f"  Admin   → SIAPE {ADMIN['siape']} | senha {ADMIN['senha']}")
        self.stdout.write(f"  Gestores → {len(GESTORES)} usuários | senha padrão: {senha_gestores}")
        self.stdout.write(f"  Planos  → {len(PLANOS)} planos de risco criados")
        self.stdout.write("")
        self.stdout.write("  Usuários criados:")
        for dados in GESTORES:
            cargo_label = "Gestor Adm" if dados["cargo"] == "gestor_adm" else "Gestor    "
            setores_str = ", ".join(f"{s[0]}" for s in dados["setores"])
            self.stdout.write(f"    {cargo_label} | SIAPE {dados['siape']} | {dados['nome']} | {setores_str}")
