import pytest

from src.usuarios.models import Setor, Usuario


@pytest.mark.django_db
class TestSetorModel:
    def test_criar_setor(self):
        setor = Setor.objects.create(nome="Setor de Teste", sigla="TST")
        assert str(setor) == "TST - Setor de Teste"
        assert setor._meta.db_table == "setores"

    def test_labels_curto_e_completo(self):
        setor = Setor.objects.create(
            nome="Departamento de Computacao Aplicada",
            sigla="CT",
            sigla_centro="CT",
            nome_centro="Centro de Tecnologia",
            tipo_unidade="Departamento Didatico",
            fonte_oficial=True,
        )

        assert setor.label_curto == "CT - Departamento de Computacao Aplicada"
        assert (
            setor.label_completo
            == "CT - Departamento de Computacao Aplicada - Centro de Tecnologia - Departamento Didatico"
        )

@pytest.mark.django_db
class TestUsuarioModel:
    def test_criar_usuario(self, db):
        setor = Setor.objects.create(nome="Setor A", sigla="SA")
        usuario = Usuario.objects.create_user(
            siape="1234567", 
            password="senha_segura", 
            nome="Usuário de Teste",
            email="teste@ufsm.br"
        )
        usuario.setores.add(setor)
        
        assert usuario.siape == "1234567"
        assert usuario.nome == "Usuário de Teste"
        assert usuario.setores.count() == 1
        assert str(usuario) == "1234567 - Usuário de Teste"
        assert usuario.is_active is True
        assert usuario.is_staff is False

    def test_create_user_sem_siape(self):
        with pytest.raises(ValueError, match="O SIAPE é obrigatório"):
            Usuario.objects.create_user(siape="")

    def test_create_superuser_com_flags_invalidas(self):
        with pytest.raises(ValueError, match="Superusuario deve ter equipe=True"):
            Usuario.objects.create_superuser(siape="1", password="p", nome="n", equipe=False)
        with pytest.raises(ValueError, match="Superusuario deve ter is_superuser=True"):
            Usuario.objects.create_superuser(siape="1", password="p", nome="n", is_superuser=False)

    def test_create_superuser_valido(self):
        superuser = Usuario.objects.create_superuser(
            siape="9999999",
            password="admin_password",
            nome="Admin Master",
            email="admin@ufsm.br"
        )
        assert superuser.is_superuser is True
        assert superuser.is_staff is True
