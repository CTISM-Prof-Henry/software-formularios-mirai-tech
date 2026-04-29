import pytest
from django.core.management import call_command
from rest_framework.authtoken.models import Token

from src.riscos.models import Monitoramento, PlanoAcao, Risco
from src.usuarios.management.commands.seed_base_demo import RISCOS_DEMO, USUARIOS_DEMO
from src.usuarios.models import Usuario


@pytest.mark.django_db
class TestSeedBaseDemo:
    def test_cria_base_demo_com_usuarios_riscos_planos_e_monitoramentos(self):
        call_command("seed_base_demo")

        for dados_usuario in USUARIOS_DEMO:
            usuario = Usuario.objects.get(siape=dados_usuario["siape"])
            unidades = set(usuario.setores.values_list("sigla_centro", "nome"))
            unidades_esperadas = set(dados_usuario["setores"])

            assert usuario.nome == dados_usuario["nome"]
            assert usuario.email == dados_usuario["email"]
            assert usuario.ativo is True
            assert usuario.equipe == dados_usuario["equipe"]
            assert usuario.is_superuser is False
            assert usuario.check_password("Teste@12345")
            assert unidades == unidades_esperadas
            assert Token.objects.filter(user=usuario).exists()

        assert Risco.objects.count() == len(RISCOS_DEMO)
        assert PlanoAcao.objects.count() == len(RISCOS_DEMO)
        assert Monitoramento.objects.count() == sum(
            1 for dados_risco in RISCOS_DEMO if "monitoramento" in dados_risco
        )

        risco_ti = Risco.objects.get(evento=RISCOS_DEMO[0]["evento"])
        plano_ti = risco_ti.planos_acao.get()
        assert plano_ti.responsavel == RISCOS_DEMO[0]["plano"]["responsavel"]
        assert plano_ti.status == RISCOS_DEMO[0]["plano"]["status"]

    def test_seed_e_idempotente(self):
        call_command("seed_base_demo")
        call_command("seed_base_demo")

        assert Usuario.objects.filter(
            siape__in=[dados_usuario["siape"] for dados_usuario in USUARIOS_DEMO]
        ).count() == len(USUARIOS_DEMO)
        assert Risco.objects.count() == len(RISCOS_DEMO)
        assert PlanoAcao.objects.count() == len(RISCOS_DEMO)
        assert Monitoramento.objects.count() == sum(
            1 for dados_risco in RISCOS_DEMO if "monitoramento" in dados_risco
        )

    def test_seed_mantem_apenas_superusuario_existente(self):
        admin = Usuario.objects.create_superuser(
            siape="202512603",
            password="12345678",
            nome="Administrador Local",
            email="admin.local@ufsm.br",
        )

        call_command("seed_base_demo")

        admin.refresh_from_db()
        assert admin.is_superuser is True
        assert Usuario.objects.filter(is_superuser=True).count() == 1
        assert not Usuario.objects.exclude(siape=admin.siape).filter(is_superuser=True).exists()
