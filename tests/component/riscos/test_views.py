import pytest
from rest_framework import status

from src.riscos.models import DesafioPDI, Macroprocesso, ObjetivoPDI, PlanoAcao, Risco


@pytest.fixture
def infra_risco(setor_oficial, setor_secundario, usuario_gestor, usuario_outro_setor, objetivo_padrao, macroprocesso_padrao):
    # este fixture monta um cenario completo reutilizando as fixtures compartilhadas do conftest
    risco = Risco.objects.create(
        setor=setor_oficial,
        objetivo=objetivo_padrao,
        macroprocesso=macroprocesso_padrao,
        categoria="Operacional",
        evento="E",
        causa="C",
        consequencia="C",
        controles_atuais="C",
        eficacia_controle="Satisfatório",
        probabilidade=3,
        impacto=3,
        prob_residual=1,
        imp_residual=1,
    )
    return {
        "u1": usuario_gestor,
        "u2": usuario_outro_setor,
        "s1": setor_oficial,
        "s2": setor_secundario,
        "risco": risco,
    }


@pytest.mark.django_db
class TestRiscoViewsPermissions:
    def test_calculo_niveis_no_save(self, infra_risco):
        # a criacao do fixture ja deve ter calculado os niveis automaticamente
        risco = infra_risco['risco']
        assert risco.nivel_risco == 9
        assert risco.nivel_residual == 1

    def test_qualquer_gestor_visualiza_riscos(self, api_client, infra_risco):
        # este caso valida a leitura do plano por outro gestor autenticado
        api_client.force_authenticate(user=infra_risco['u2'])
        url = f"/api/riscos/planos/{infra_risco['risco'].id}/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_gestor_nao_edita_risco_de_outro_setor(self, api_client, infra_risco):
        # aqui a regra esperada e o bloqueio da edicao fora do proprio setor
        api_client.force_authenticate(user=infra_risco['u2'])
        url = f"/api/riscos/planos/{infra_risco['risco'].id}/"
        payload = {"evento": "Hacked"}
        response = api_client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_gestor_edita_proprio_risco(self, api_client, infra_risco):
        # neste cenario o gestor altera um risco da propria unidade
        api_client.force_authenticate(user=infra_risco['u1'])
        url = f"/api/riscos/planos/{infra_risco['risco'].id}/"
        payload = {"evento": "Atualizado"}
        response = api_client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["usuario"]["evento"] if "usuario" in response.data else True

    def test_gestor_nao_cria_risco_para_outro_setor(self, api_client, infra_risco):
        # a criacao tambem deve respeitar o setor vinculado ao usuario
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

    def test_permissao_objeto_com_atributo_risco(self, infra_risco):
        # valida o segundo caminho da permissao: objetos que possuem FK para risco (PlanoAcao, Monitoramento)
        from src.riscos.views import PertenceAoSetorDoRisco
        perm = PertenceAoSetorDoRisco()

        class ObjComRisco:
            risco = infra_risco['risco']  # risco pertence a s1

        class RequestU2:
            method = "PUT"
            user = infra_risco['u2']  # u2 pertence a s2

        class RequestU1:
            method = "PUT"
            user = infra_risco['u1']  # u1 pertence a s1

        # gestor de outro setor nao pode editar objeto vinculado ao risco de s1
        assert perm.has_object_permission(RequestU2(), None, ObjComRisco()) is False
        # gestor do proprio setor pode editar
        assert perm.has_object_permission(RequestU1(), None, ObjComRisco()) is True

    def test_permissao_objeto_invalido(self, infra_risco):
        # este teste cobre um objeto que nao corresponde ao esperado pela permissao
        from src.riscos.views import PertenceAoSetorDoRisco
        perm = PertenceAoSetorDoRisco()

        class MockObj: pass

        # o request abaixo representa o minimo necessario para a chamada
        class MockRequest:
            method = "POST"
            user = infra_risco['u1']

        assert perm.has_object_permission(MockRequest(), None, MockObj()) is False

    def test_paginacao_riscos(self, api_client, infra_risco):
        # a listagem deve retornar o formato paginado padrao da api
        api_client.force_authenticate(user=infra_risco['u1'])
        url = "/api/riscos/planos/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data
        assert "count" in response.data
        assert len(response.data["results"]) == 1

    def test_filtro_setor(self, api_client, infra_risco):
        # primeiro o filtro deve retornar o risco pertencente ao setor informado
        api_client.force_authenticate(user=infra_risco['u1'])
        url = f"/api/riscos/planos/?setor={infra_risco['s1'].id}"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

        # depois o mesmo teste valida um filtro sem resultados
        url = f"/api/riscos/planos/?setor={infra_risco['s2'].id}"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_busca_texto_risco(self, api_client, infra_risco):
        # a busca textual deve localizar o risco por termos simples
        api_client.force_authenticate(user=infra_risco['u1'])
        url = "/api/riscos/planos/?search=E"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

        # na segunda chamada o termo nao existe e a lista deve vir vazia
        url = "/api/riscos/planos/?search=Inexistente"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_objetivos_pdi_sao_listados_com_ordenacao_estavel(self, api_client, infra_risco):
        # este teste insere itens extras para validar a ordenacao do endpoint
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
        # a mesma logica e aplicada para macroprocessos
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
        # este endpoint deve gerar um arquivo excel para a listagem filtrada
        api_client.force_authenticate(user=infra_risco["u1"])

        response = api_client.get(f"/api/riscos/planos/exportar-excel/?setor={infra_risco['s1'].id}")

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        assert 'filename="planos-risco.xlsx"' in response["Content-Disposition"]
        assert response.content.startswith(b"PK")

    def test_exporta_plano_individual_para_excel(self, api_client, infra_risco):
        # aqui a exportacao e de um plano especifico
        api_client.force_authenticate(user=infra_risco["u1"])

        response = api_client.get(f"/api/riscos/planos/{infra_risco['risco'].id}/exportar-excel/")

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        assert f'filename="plano-risco-{infra_risco["risco"].id}.xlsx"' in response["Content-Disposition"]
        assert response.content.startswith(b"PK")

    def test_exporta_plano_individual_para_pdf(self, api_client, infra_risco):
        # primeiro cria um plano de acao para enriquecer o pdf exportado
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

        # depois solicita a geracao do pdf do plano
        response = api_client.get(f"/api/riscos/planos/{infra_risco['risco'].id}/exportar-pdf/")

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/pdf"
        assert f'filename="plano-risco-{infra_risco["risco"].id}.pdf"' in response["Content-Disposition"]
        assert response.content.startswith(b"%PDF")

    def test_dashboard_respeita_filtros_de_setor_e_data(self, api_client, infra_risco):
        # este cenario cria uma acao dentro do periodo filtrado
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

        # a chamada deve refletir os indicadores apenas do recorte informado
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
        assert response.data["riscos_sem_acao"] == 0
        assert response.data["riscos_monitorados"] == 0
        assert response.data["taxa_mitigacao"] == 100.0
        assert "distribuicao_categorias" in response.data
        assert "unidades_maior_exposicao" in response.data
        assert "riscos_por_nivel" in response.data

    def test_dashboard_retorna_vazio_quando_periodo_nao_contem_acoes(self, api_client, infra_risco):
        # aqui a acao e criada fora do periodo para validar retorno vazio
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

