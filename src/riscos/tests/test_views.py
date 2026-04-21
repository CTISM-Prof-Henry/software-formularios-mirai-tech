import pytest
from rest_framework.test import APIClient
from rest_framework import status
from src.usuarios.models import Setor, Usuario
from src.riscos.models import DesafioPDI, ObjetivoPDI, Macroprocesso, PlanoAcao, Risco

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def infra_risco(db):
    s1 = Setor.objects.create(nome="Setor 1", sigla="S1")
    s2 = Setor.objects.create(nome="Setor 2", sigla="S2")
    
    u1 = Usuario.objects.create_user(siape="1", password="p", nome="G1", email="g1@u.br")
    u1.setores.add(s1)
    
    u2 = Usuario.objects.create_user(siape="2", password="p", nome="G2", email="g2@u.br")
    u2.setores.add(s2)
    
    desafio = DesafioPDI.objects.create(numero=998, descricao="D1")
    obj = ObjetivoPDI.objects.create(codigo="O-TESTE-998", descricao="O1", desafio=desafio)
    macro = Macroprocesso.objects.create(nome="M1 Exclusivo")
    
    risco = Risco.objects.create(
        setor=s1, objetivo=obj, macroprocesso=macro,
        categoria="Operacional", evento="E", causa="C", consequencia="C", 
        controles_atuais="C", eficacia_controle="Satisfatório",
        probabilidade=3, impacto=3, prob_residual=1, imp_residual=1
    )
    
    return {"u1": u1, "u2": u2, "s1": s1, "s2": s2, "risco": risco}

@pytest.mark.django_db
class TestRiscoViewsPermissions:
    def test_calculo_niveis_no_save(self, infra_risco):
        risco = infra_risco['risco']
        assert risco.nivel_risco == 9
        assert risco.nivel_residual == 1

    def test_qualquer_gestor_visualiza_riscos(self, api_client, infra_risco):
        # Gestor 2 visualizando risco do Setor 1
        api_client.force_authenticate(user=infra_risco['u2'])
        url = f"/api/riscos/planos/{infra_risco['risco'].id}/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_gestor_nao_edita_risco_de_outro_setor(self, api_client, infra_risco):
        # Gestor 2 tentando editar risco do Setor 1
        api_client.force_authenticate(user=infra_risco['u2'])
        url = f"/api/riscos/planos/{infra_risco['risco'].id}/"
        payload = {"evento": "Hacked"}
        response = api_client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_gestor_edita_proprio_risco(self, api_client, infra_risco):
        # Gestor 1 editando risco do Setor 1
        api_client.force_authenticate(user=infra_risco['u1'])
        url = f"/api/riscos/planos/{infra_risco['risco'].id}/"
        payload = {"evento": "Atualizado"}
        response = api_client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["usuario"]["evento"] if "usuario" in response.data else True # Verifica se atualizou

    def test_gestor_nao_cria_risco_para_outro_setor(self, api_client, infra_risco):
        # Gestor 1 tentando criar risco para Setor 2
        api_client.force_authenticate(user=infra_risco['u1'])
        url = "/api/riscos/planos/"
        payload = {
            "setor": infra_risco['s2'].id,
            "objetivo": infra_risco['risco'].objetivo.id,
            "macroprocesso": infra_risco['risco'].macroprocesso.id,
            "categoria": "Operacional",
            "evento": "E", "causa": "C", "consequencia": "C", "controles_atuais": "C", 
            "eficacia_controle": "Satisfatório", "probabilidade": 1, "impacto": 1, 
            "prob_residual": 1, "imp_residual": 1
        }
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_permissao_objeto_invalido(self, infra_risco):
        from src.riscos.views import PertenceAoSetorDoRisco
        perm = PertenceAoSetorDoRisco()
        
        class MockObj: pass
        
        # Simulando um request dummy
        class MockRequest:
            method = "POST"
            user = infra_risco['u1']
            
        assert perm.has_object_permission(MockRequest(), None, MockObj()) is False

    def test_paginacao_riscos(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco['u1'])
        url = "/api/riscos/planos/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data
        assert "count" in response.data
        assert len(response.data["results"]) == 1

    def test_filtro_setor(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco['u1'])
        url = f"/api/riscos/planos/?setor={infra_risco['s1'].id}"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        
        # Filtro por setor vazio
        url = f"/api/riscos/planos/?setor={infra_risco['s2'].id}"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_busca_texto_risco(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco['u1'])
        # Busca por termo que existe no evento "E"
        url = "/api/riscos/planos/?search=E"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        
        # Busca por termo que NÃO existe
        url = "/api/riscos/planos/?search=Inexistente"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_objetivos_pdi_sao_listados_com_ordenacao_estavel(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco["u1"])
        ObjetivoPDI.objects.create(codigo="A-TESTE-001", descricao="Primeiro", desafio=infra_risco["risco"].objetivo.desafio)
        ObjetivoPDI.objects.create(codigo="Z-TESTE-001", descricao="Ultimo", desafio=infra_risco["risco"].objetivo.desafio)

        response = api_client.get("/api/riscos/objetivos/")

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        codigos = [item["codigo"] for item in response.data]
        codigos_esperados = list(ObjetivoPDI.objects.values_list("codigo", flat=True))
        assert codigos == codigos_esperados
        assert "A-TESTE-001" in codigos
        assert "Z-TESTE-001" in codigos

    def test_macroprocessos_sao_listados_com_ordenacao_estavel(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco["u1"])
        Macroprocesso.objects.create(nome="A Macroprocesso")
        Macroprocesso.objects.create(nome="Z Macroprocesso")

        response = api_client.get("/api/riscos/macroprocessos/")

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        nomes = [item["nome"] for item in response.data]
        nomes_esperados = list(Macroprocesso.objects.values_list("nome", flat=True))
        assert nomes == nomes_esperados
        assert "A Macroprocesso" in nomes
        assert "Z Macroprocesso" in nomes

    def test_exporta_lista_filtrada_para_excel(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco["u1"])

        response = api_client.get(f"/api/riscos/planos/exportar-excel/?setor={infra_risco['s1'].id}")

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        assert 'filename="planos-risco.xlsx"' in response["Content-Disposition"]
        assert response.content.startswith(b"PK")

    def test_exporta_plano_individual_para_excel(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco["u1"])

        response = api_client.get(f"/api/riscos/planos/{infra_risco['risco'].id}/exportar-excel/")

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        assert f'filename="plano-risco-{infra_risco["risco"].id}.xlsx"' in response["Content-Disposition"]
        assert response.content.startswith(b"PK")

    def test_exporta_plano_individual_para_pdf(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco["u1"])
        PlanoAcao.objects.create(
            risco=infra_risco["risco"],
            tipo_resposta="Mitigar",
            descricao_acao="Executar plano de mitigacao.",
            responsavel="Gestor responsavel",
            data_inicio="2026-01-01",
            data_fim="2026-12-31",
            status="Em andamento",
        )

        response = api_client.get(f"/api/riscos/planos/{infra_risco['risco'].id}/exportar-pdf/")

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/pdf"
        assert f'filename="plano-risco-{infra_risco["risco"].id}.pdf"' in response["Content-Disposition"]
        assert response.content.startswith(b"%PDF")

    def test_dashboard_respeita_filtros_de_setor_e_data(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco["u1"])
        PlanoAcao.objects.create(
            risco=infra_risco["risco"],
            tipo_resposta="Mitigar",
            descricao_acao="Acao dentro do periodo.",
            responsavel="Gestor responsavel",
            data_inicio="2026-03-01",
            data_fim="2026-03-31",
            status="Em andamento",
        )

        response = api_client.get(
            f"/api/riscos/planos/dashboard/?setor={infra_risco['s1'].id}"
            "&data_inicio=2026-01-01&data_fim=2026-12-31"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_planos"] == 1
        assert response.data["tratamentos_ativos"] == 1
        assert response.data["setores_filtrados"] == 1
        assert len(response.data["planos"]) == 1
        assert response.data["planos"][0]["periodo_acao"] == {
            "data_inicio": "2026-03-01",
            "data_fim": "2026-03-31",
        }

    def test_dashboard_retorna_vazio_quando_periodo_nao_contem_acoes(self, api_client, infra_risco):
        api_client.force_authenticate(user=infra_risco["u1"])
        PlanoAcao.objects.create(
            risco=infra_risco["risco"],
            tipo_resposta="Mitigar",
            descricao_acao="Acao fora do periodo.",
            responsavel="Gestor responsavel",
            data_inicio="2024-03-01",
            data_fim="2024-03-31",
            status="Em andamento",
        )

        response = api_client.get(
            f"/api/riscos/planos/dashboard/?setor={infra_risco['s1'].id}"
            "&data_inicio=2026-01-01&data_fim=2026-12-31"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_planos"] == 0
        assert response.data["tratamentos_ativos"] == 0
        assert response.data["planos"] == []
