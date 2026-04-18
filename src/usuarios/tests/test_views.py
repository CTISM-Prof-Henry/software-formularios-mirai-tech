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
        # Agora exige senha_atual, nova_senha e confirmacao_senha
        payload = {
            "email": novo_email, 
            "senha_atual": "senha_original",
            "nova_senha": "nova_senha_456",
            "confirmacao_senha": "nova_senha_456"
        }
        response = api_client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["usuario"]["email"] == novo_email
        
        # Verificar se a senha realmente mudou
        usuario.refresh_from_db()
        assert usuario.check_password("nova_senha_456") is True

    def test_enviar_codigo_sucesso(self, api_client, usuario):
        url = "/api/usuarios/recuperar-senha/enviar/"
        payload = {"email": usuario.email}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["mensagem"] == "Código enviado com sucesso!"

    def test_enviar_codigo_email_inexistente(self, api_client):
        url = "/api/usuarios/recuperar-senha/enviar/"
        payload = {"email": "fantasma@ufsm.br"}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_validar_codigo_sucesso(self, api_client, usuario):
        from src.usuarios.models import CodigoRecuperacao
        CodigoRecuperacao.objects.create(email=usuario.email, codigo="123456")
        
        url = "/api/usuarios/recuperar-senha/validar/"
        payload = {"email": usuario.email, "codigo": "123456"}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK

    def test_validar_codigo_errado(self, api_client, usuario):
        from src.usuarios.models import CodigoRecuperacao
        CodigoRecuperacao.objects.create(email=usuario.email, codigo="123456")
        
        url = "/api/usuarios/recuperar-senha/validar/"
        payload = {"email": usuario.email, "codigo": "000000"}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_validar_codigo_expirado(self, api_client, usuario):
        from src.usuarios.models import CodigoRecuperacao
        from django.utils import timezone
        from datetime import timedelta
        
        # Cria o código
        registro = CodigoRecuperacao.objects.create(email=usuario.email, codigo="123456")
        
        # Retrocede o tempo de criação manualmente para simular expiração (ex: 2 minutos atrás)
        CodigoRecuperacao.objects.filter(id=registro.id).update(
            criado_em=timezone.now() - timedelta(minutes=2)
        )
        
        url = "/api/usuarios/recuperar-senha/validar/"
        payload = {"email": usuario.email, "codigo": "123456"}
        response = api_client.post(url, payload, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["erro"] == "Este código expirou."

    def test_redefinir_senha_sucesso(self, api_client, usuario):
        from src.usuarios.models import CodigoRecuperacao
        CodigoRecuperacao.objects.create(email=usuario.email, codigo="123456")
        
        url = "/api/usuarios/recuperar-senha/redefinir/"
        payload = {
            "email": usuario.email,
            "codigo": "123456",
            "nova_senha": "nova_senha_ultra_segura",
            "confirmacao_senha": "nova_senha_ultra_segura"
        }
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Valida se a senha mudou mesmo
        usuario.refresh_from_db()
        assert usuario.check_password("nova_senha_ultra_segura") is True

    def test_redefinir_senha_senhas_divergentes(self, api_client, usuario):
        url = "/api/usuarios/recuperar-senha/redefinir/"
        payload = {
            "email": usuario.email,
            "codigo": "123456",
            "nova_senha": "senha1",
            "confirmacao_senha": "senha2"
        }
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["erro"] == "As senhas não coincidem."

    def test_listar_membros_setor(self, api_client, usuario, setor):
        api_client.force_authenticate(user=usuario)
        url = f"/api/usuarios/setores/{setor.id}/membros/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["siape"] == usuario.siape

    def test_remover_membro_setor_sucesso(self, api_client, usuario, setor):
        api_client.force_authenticate(user=usuario)
        url = f"/api/usuarios/setores/{setor.id}/remover_membro/"
        payload = {"usuario_id": usuario.id}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["mensagem"] == "Membro removido da equipe com sucesso."
        
        # Valida se o vínculo sumiu
        assert setor not in usuario.setores.all()

    def test_remover_membro_nao_pertencente(self, api_client, usuario):
        # Novo setor que o usuário não pertence
        setor_vazio = Setor.objects.create(nome="Vazio", sigla="VV")
        api_client.force_authenticate(user=usuario)
        url = f"/api/usuarios/setores/{setor_vazio.id}/remover_membro/"
        payload = {"usuario_id": usuario.id}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["erro"] == "Usuário não pertence a este setor."

    def test_adicionar_membro_setor_sucesso(self, api_client, usuario, setor):
        # Novo usuário que não pertence ao setor
        novo_usuario = Usuario.objects.create_user(siape="999", password="p", nome="Novo", email="n@u.com")
        api_client.force_authenticate(user=usuario)
        url = f"/api/usuarios/setores/{setor.id}/adicionar_membro/"
        payload = {"siape": "999"}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["mensagem"] == "Membro adicionado com sucesso!"
        
        # Valida se o vínculo foi criado
        assert setor in novo_usuario.setores.all()

    def test_adicionar_membro_ja_existente(self, api_client, usuario, setor):
        api_client.force_authenticate(user=usuario)
        url = f"/api/usuarios/setores/{setor.id}/adicionar_membro/"
        payload = {"siape": usuario.siape}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["erro"] == "Este usuário já faz parte deste setor."

    def test_adicionar_membro_nao_encontrado(self, api_client, usuario, setor):
        api_client.force_authenticate(user=usuario)
        url = f"/api/usuarios/setores/{setor.id}/adicionar_membro/"
        payload = {"siape": "000"} # Não existe
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["erro"] == "Usuário com este SIAPE não encontrado."

    def test_admin_exibir_setores(self, db, usuario, setor):
        from src.usuarios.admin import UsuarioAdmin
        from django.contrib.admin.sites import AdminSite
        
        ua = UsuarioAdmin(Usuario, AdminSite())
        display = ua.exibir_setores(usuario)
        assert setor.sigla in display
