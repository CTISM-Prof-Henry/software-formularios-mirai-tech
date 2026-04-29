import pytest
from src.riscos.models import DesafioPDI, ObjetivoPDI, Macroprocesso, Risco, PlanoAcao, Monitoramento
from src.usuarios.models import Setor

@pytest.fixture
def infra_pdi(db):
    desafio = DesafioPDI.objects.create(numero=999, descricao="Desafio Teste")
    objetivo = ObjetivoPDI.objects.create(codigo="OBJ-TESTE-999", descricao="Objetivo Teste", desafio=desafio)
    macro = Macroprocesso.objects.create(nome="Processo Teste Exclusivo")
    setor = Setor.objects.create(nome="Setor Teste", sigla="ST")
    return {"desafio": desafio, "objetivo": objetivo, "macro": macro, "setor": setor}

@pytest.mark.django_db
class TestRiscoModel:
    def test_calculo_nivel_risco(self, infra_pdi):
        risco = Risco.objects.create(
            setor=infra_pdi['setor'],
            objetivo=infra_pdi['objetivo'],
            macroprocesso=infra_pdi['macro'],
            categoria="Operacional",
            evento="Evento X",
            causa="Causa Y",
            consequencia="Consequência Z",
            controles_atuais="Controle A",
            eficacia_controle="Médio",
            probabilidade=4,
            impacto=5,
            prob_residual=2,
            imp_residual=3
        )
        # 4 * 5 = 20 (Nível de Risco)
        assert risco.nivel_risco == 20
        # 2 * 3 = 6 (Nível Residual)
        assert risco.nivel_residual == 6
        assert str(risco) == f"Risco {risco.id} - ST - Setor Teste"
        assert str(infra_pdi['desafio']) == "999 - Desafio Teste"
        assert str(infra_pdi['macro']) == "Processo Teste Exclusivo"
        assert str(infra_pdi['objetivo']) == "OBJ-TESTE-999 - Objetivo Teste"

@pytest.mark.django_db
class TestPlanoAcaoModel:
    def test_criar_plano_acao(self, infra_pdi):
        risco = Risco.objects.create(
            setor=infra_pdi['setor'],
            objetivo=infra_pdi['objetivo'],
            macroprocesso=infra_pdi['macro'],
            categoria="Operacional",
            evento="E", causa="C", consequencia="C", controles_atuais="C", eficacia_controle="Médio",
            probabilidade=1, impacto=1, prob_residual=1, imp_residual=1
        )
        plano = PlanoAcao.objects.create(
            risco=risco,
            tipo_resposta="Mitigar",
            descricao_acao="Ação X",
            responsavel="Gestor",
            parceiros="P",
            data_inicio="2024-01-01",
            data_fim="2024-12-31",
            status="Não iniciada",
            observacoes="Obs"
        )
        assert plano.risco == risco
        assert str(plano.risco.id) in str(plano.risco)

@pytest.mark.django_db
class TestMonitoramentoModel:
    def test_criar_monitoramento(self, infra_pdi):
        risco = Risco.objects.create(
            setor=infra_pdi['setor'],
            objetivo=infra_pdi['objetivo'],
            macroprocesso=infra_pdi['macro'],
            categoria="Operacional",
            evento="E", causa="C", consequencia="C", controles_atuais="C", eficacia_controle="Médio",
            probabilidade=1, impacto=1, prob_residual=1, imp_residual=1
        )
        monitor = Monitoramento.objects.create(
            risco=risco,
            resultados="R",
            acoes_futuras="AF",
            analise_critica="AC"
        )
        assert monitor.risco == risco
        assert str(monitor.risco.id) in str(monitor.risco)
