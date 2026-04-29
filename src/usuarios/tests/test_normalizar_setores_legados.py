import pytest

from src.riscos.models import DesafioPDI, Macroprocesso, ObjetivoPDI, Risco
from src.usuarios.models import Setor, Usuario
from src.usuarios.normalizacao_legado import (
    encontrar_setor_oficial_equivalente,
    normalizar_riscos_legados,
    normalizar_vinculos_legados,
)


@pytest.mark.django_db
class TestNormalizacaoSetoresLegados:
    def test_encontra_unidade_oficial_de_ensino_por_sigla_legada(self):
        legado = Setor.objects.create(
            nome="TTT",
            sigla="TTT",
            sigla_centro="TTT",
            nome_centro="TTT",
            tipo_unidade="Legado",
            fonte_oficial=False,
            ativo=False,
        )
        oficial = Setor.objects.create(
            nome="Centro Teste TTT",
            sigla="TTT",
            sigla_centro="TTT",
            nome_centro="Centro Teste TTT",
            tipo_unidade="Unidade de Ensino",
            fonte_oficial=True,
            ativo=True,
        )

        encontrado = encontrar_setor_oficial_equivalente(legado, Setor)

        assert encontrado == oficial

    def test_normaliza_vinculos_de_usuario_trocando_legado_por_oficial(self):
        legado = Setor.objects.create(
            nome="LEGX",
            sigla="LEGX",
            sigla_centro="LEGX",
            nome_centro="LEGX",
            tipo_unidade="Legado",
            fonte_oficial=False,
            ativo=False,
        )
        oficial = Setor.objects.create(
            nome="Centro Oficial LEGX",
            sigla="LEGX",
            sigla_centro="LEGX",
            nome_centro="Centro Oficial LEGX",
            tipo_unidade="Unidade de Ensino",
            fonte_oficial=True,
            ativo=True,
        )
        usuario = Usuario.objects.create_user(
            siape="202512603",
            password="12345678",
            nome="matheus",
            email="matheus@ufsm.br",
        )
        usuario.setores.add(legado)

        resultado = normalizar_vinculos_legados(Usuario, Setor)
        usuario.refresh_from_db()

        assert resultado["usuarios_atualizados"] == 1
        assert legado not in usuario.setores.all()
        assert oficial in usuario.setores.all()

    def test_normaliza_risco_legado(self):
        legado = Setor.objects.create(
            nome="LEGY",
            sigla="LEGY",
            sigla_centro="LEGY",
            nome_centro="LEGY",
            tipo_unidade="Legado",
            fonte_oficial=False,
            ativo=False,
        )
        oficial = Setor.objects.create(
            nome="Centro Oficial LEGY",
            sigla="LEGY",
            sigla_centro="LEGY",
            nome_centro="Centro Oficial LEGY",
            tipo_unidade="Unidade de Ensino",
            fonte_oficial=True,
            ativo=True,
        )
        desafio = DesafioPDI.objects.create(numero=999, descricao="Desafio")
        objetivo = ObjetivoPDI.objects.create(codigo="OBJ-LEG", descricao="Objetivo", desafio=desafio)
        macro = Macroprocesso.objects.create(nome="Macroprocesso Legado")
        risco = Risco.objects.create(
            setor=legado,
            objetivo=objetivo,
            macroprocesso=macro,
            categoria="Operacional",
            evento="Teste",
            causa="Causa",
            consequencia="Consequencia",
            controles_atuais="Controle",
            eficacia_controle="Fraco",
            probabilidade=2,
            impacto=3,
            prob_residual=1,
            imp_residual=2,
        )

        resultado = normalizar_riscos_legados(Setor)
        risco.refresh_from_db()

        assert resultado["riscos_atualizados"] == 1
        assert risco.setor == oficial
