import pytest
from rest_framework.test import APIClient
from rest_framework import status
from src.usuarios.models import Setor, Usuario

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def setor(db):
    return Setor.objects.create(nome="Setor A", sigla="SA")

@pytest.fixture
def usuario(db, setor):
    u = Usuario.objects.create_user(
        siape="1111111", 
        password="senha_original", 
        nome="Teste Original", 
        email="orig@ufsm.br"
    )
    u.setores.add(setor)
    return u

@pytest.mark.django_db
class TestUsuarioViews:
    def test_registro_usuario(self, api_client, setor):
        url = "/api/usuarios/registro/"
        payload = {
            "siape": "2222222",
            "senha": "senha_segura_123",
            "nome": "Novo Gestor",
            "email": "novo@ufsm.br",
            "id_setores": [setor.id]
        }
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert "token" in response.data
        assert response.data["usuario"]["nome"] == "Novo Gestor"

    def test_login_usuario(self, api_client, usuario):
        url = "/api/usuarios/login/"
        payload = {"siape": "1111111", "senha": "senha_original"}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert "token" in response.data

    def test_login_invalido(self, api_client, usuario):
        url = "/api/usuarios/login/"
        payload = {"siape": "1111111", "senha": "senha_errada"}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_perfil_usuario_autenticado(self, api_client, usuario):
        api_client.force_authenticate(user=usuario)
        url = "/api/usuarios/me/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["siape"] == usuario.siape

    def test_atualizar_perfil(self, api_client, usuario):
        api_client.force_authenticate(user=usuario)
        url = "/api/usuarios/me/"
        novo_email = "atualizado@ufsm.br"
        # Testando e-mail (campo genérico no loop) e senha (campo especial)
        payload = {"email": novo_email, "senha": "nova_senha_456"}
        response = api_client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["usuario"]["email"] == novo_email
        
        # Verificar se a senha realmente mudou
        usuario.refresh_from_db()
        assert usuario.check_password("nova_senha_456") is True

    def test_admin_exibir_setores(self, db, usuario, setor):
        from src.usuarios.admin import UsuarioAdmin
        from django.contrib.admin.sites import AdminSite
        
        ua = UsuarioAdmin(Usuario, AdminSite())
        display = ua.exibir_setores(usuario)
        assert setor.sigla in display
