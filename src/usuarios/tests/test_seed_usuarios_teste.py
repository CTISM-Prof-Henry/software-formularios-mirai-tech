from django.core.management import call_command
import pytest
from rest_framework.authtoken.models import Token

from src.usuarios.management.commands.seed_usuarios_teste import USUARIOS_TESTE
from src.usuarios.models import Usuario


@pytest.mark.django_db
class TestSeedUsuariosTeste:
    def test_cria_usuarios_de_teste_com_multiplos_setores(self):
        call_command("seed_usuarios_teste")

        for dados_usuario in USUARIOS_TESTE:
            usuario = Usuario.objects.get(siape=dados_usuario["siape"])
            siglas = set(usuario.setores.values_list("sigla", flat=True))

            assert usuario.nome == dados_usuario["nome"]
            assert usuario.email == dados_usuario["email"]
            assert usuario.ativo is True
            assert usuario.equipe == dados_usuario["equipe"]
            assert siglas == set(dados_usuario["setores"])
            assert usuario.check_password("Teste@12345")
            assert Token.objects.filter(user=usuario).exists()

    def test_seed_e_idempotente_e_nao_duplica_usuarios(self):
        call_command("seed_usuarios_teste")
        call_command("seed_usuarios_teste")

        assert Usuario.objects.filter(
            siape__in=[dados_usuario["siape"] for dados_usuario in USUARIOS_TESTE]
        ).count() == len(USUARIOS_TESTE)

    def test_reset_password_atualiza_senha_de_usuario_existente(self):
        call_command("seed_usuarios_teste")
        usuario = Usuario.objects.get(siape=USUARIOS_TESTE[0]["siape"])
        usuario.set_password("SenhaAntiga@123")
        usuario.save()

        call_command("seed_usuarios_teste", password="NovaSenha@123", reset_password=True)
        usuario.refresh_from_db()

        assert usuario.check_password("NovaSenha@123")
