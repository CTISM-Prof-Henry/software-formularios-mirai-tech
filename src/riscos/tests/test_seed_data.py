import pytest

from src.riscos.models import DesafioPDI, Macroprocesso, ObjetivoPDI


@pytest.mark.django_db
class TestDadosIniciaisPDI:
    def test_desafios_pdi_iniciais_carregados(self):
        assert DesafioPDI.objects.count() == 7
        assert DesafioPDI.objects.filter(numero=1, descricao="Internacionalização").exists()
        assert DesafioPDI.objects.filter(
            numero=7,
            descricao="Gestão ambiental",
        ).exists()

    def test_macroprocessos_iniciais_carregados(self):
        assert Macroprocesso.objects.count() == 22
        assert Macroprocesso.objects.filter(nome="Tecnologia da Informação").exists()
        assert Macroprocesso.objects.filter(nome="Assistência Estudantil").exists()

    def test_objetivos_pdi_iniciais_carregados(self):
        assert ObjetivoPDI.objects.count() == 43

        objetivo = ObjetivoPDI.objects.select_related("desafio").get(codigo="PR-D5-01")
        assert objetivo.desafio.numero == 5
        assert "Otimizar rotinas administrativas e sistemas de informação" in objetivo.descricao

        objetivo_ambiental = ObjetivoPDI.objects.select_related("desafio").get(codigo="AS-D7-01")
        assert objetivo_ambiental.desafio.numero == 7
