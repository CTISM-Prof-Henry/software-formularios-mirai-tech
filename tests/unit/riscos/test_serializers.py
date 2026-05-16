import pytest

from src.riscos.serializers import RiscoSerializer


@pytest.mark.django_db
class TestRiscoSerializer:
    def test_serializa_detalhes_relacionados_do_risco(self, risco_basico):
        # este teste garante que os dados detalhados sao expostos no serializer
        serializer = RiscoSerializer(instance=risco_basico)
        dados = serializer.data

        assert dados["id"] == risco_basico.id
        assert dados["nivel_risco"] == risco_basico.nivel_risco
        assert dados["nivel_residual"] == risco_basico.nivel_residual
        assert dados["setor_detalhes"]["label_curto"] == risco_basico.setor.label_curto
        assert dados["objetivo_detalhes"]["codigo"] == risco_basico.objetivo.codigo
        assert dados["macroprocesso_detalhes"]["nome"] == risco_basico.macroprocesso.nome

    def test_cria_risco_com_dados_validos(self, setor_oficial, objetivo_padrao, macroprocesso_padrao):
        # a validacao deve aceitar um payload completo e coerente
        serializer = RiscoSerializer(
            data={
                "setor": setor_oficial.id,
                "objetivo": objetivo_padrao.id,
                "macroprocesso": macroprocesso_padrao.id,
                "categoria": "Operacional",
                "evento": "Evento serializer",
                "causa": "Causa serializer",
                "consequencia": "Consequencia serializer",
                "controles_atuais": "Controle serializer",
                "eficacia_controle": "Fraco",
                "probabilidade": 2,
                "impacto": 5,
                "prob_residual": 1,
                "imp_residual": 3,
            }
        )

        assert serializer.is_valid(), serializer.errors

        risco = serializer.save()

        assert risco.nivel_risco == 10
        assert risco.nivel_residual == 3

    def test_rejeita_categoria_invalida(self, setor_oficial, objetivo_padrao, macroprocesso_padrao):
        # o serializer deve bloquear opcoes fora das escolhas do model
        serializer = RiscoSerializer(
            data={
                "setor": setor_oficial.id,
                "objetivo": objetivo_padrao.id,
                "macroprocesso": macroprocesso_padrao.id,
                "categoria": "Categoria Invalida",
                "evento": "Evento invalido",
                "causa": "Causa invalida",
                "consequencia": "Consequencia invalida",
                "controles_atuais": "Controle",
                "eficacia_controle": "Fraco",
                "probabilidade": 2,
                "impacto": 2,
                "prob_residual": 1,
                "imp_residual": 1,
            }
        )

        assert serializer.is_valid() is False
        assert "categoria" in serializer.errors

    def test_rejeita_campo_obrigatorio_ausente(self, setor_oficial, objetivo_padrao):
        # aqui o payload deixa de fora o macroprocesso para validar erro de obrigatoriedade
        serializer = RiscoSerializer(
            data={
                "setor": setor_oficial.id,
                "objetivo": objetivo_padrao.id,
                "categoria": "Operacional",
                "evento": "Evento sem macro",
                "causa": "Causa sem macro",
                "consequencia": "Consequencia sem macro",
                "controles_atuais": "Controle",
                "eficacia_controle": "Fraco",
                "probabilidade": 1,
                "impacto": 1,
                "prob_residual": 1,
                "imp_residual": 1,
            }
        )

        assert serializer.is_valid() is False
        assert "macroprocesso" in serializer.errors
