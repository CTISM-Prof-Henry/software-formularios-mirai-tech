from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class Setor(models.Model):
    """
    Representa as unidades administrativas da UFSM.
    """
    nome = models.CharField(max_length=255, verbose_name="Nome do Setor", db_column="nome")
    sigla = models.CharField(max_length=20, unique=True, verbose_name="Sigla", db_column="sigla")

    class Meta:
        db_table = "setores"
        verbose_name = "Setor"
        verbose_name_plural = "Setores"
        ordering = ['nome']

    def __str__(self):
        return f"{self.sigla} - {self.nome}"


class GerenciadorUsuario(BaseUserManager):
    """
    Gerenciador customizado para o modelo Usuario que usa o 'siape' em vez de 'username'.
    """
    def create_user(self, siape, password=None, **campos_extras):
        if not siape:
            raise ValueError('O SIAPE é obrigatório.')
        usuario = self.model(siape=siape, **campos_extras)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, siape, password=None, **campos_extras):
        campos_extras.setdefault('equipe', True)
        campos_extras.setdefault('is_superuser', True)
        
        if campos_extras.get('equipe') is not True:
            raise ValueError('Superusuario deve ter equipe=True.')
        if campos_extras.get('is_superuser') is not True:
            raise ValueError('Superusuario deve ter is_superuser=True.')

        return self.create_user(siape, password, **campos_extras)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Modelo customizado de usuário para gestores da UFSM.
    Focado em SIAPE, Nome Completo, E-mail e múltiplos Setores.
    """
    siape = models.CharField(max_length=20, unique=True, verbose_name="Matrícula SIAPE", db_column="siape")
    nome = models.CharField(max_length=255, verbose_name="Nome Completo", db_column="nome")
    email = models.EmailField(verbose_name="E-mail", unique=True, db_column="email", null=True, blank=True)
    setores = models.ManyToManyField(
        Setor, 
        related_name="usuarios",
        blank=True,
        verbose_name="Setores do Usuário",
        db_table="usuario_setores" # Tabela intermediária traduzida
    )
    ativo = models.BooleanField(default=True, db_column="ativo")
    equipe = models.BooleanField(default=False, db_column="equipe")

    objects = GerenciadorUsuario()

    USERNAME_FIELD = 'siape'
    REQUIRED_FIELDS = ['nome']

    @property
    def is_staff(self):
        return self.equipe

    @property
    def is_active(self):
        return self.ativo

    class Meta:
        db_table = "usuarios"
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self):
        return f"{self.siape} - {self.nome}"


class CodigoRecuperacao(models.Model):
    email = models.EmailField(db_column="email")
    codigo = models.CharField(max_length=6, db_column="codigo")
    criado_em = models.DateTimeField(auto_now_add=True, db_column="criado_em")

    class Meta:
        db_table = "codigos_recuperacao"
        verbose_name = "Código de Recuperação"
        verbose_name_plural = "Códigos de Recuperação"
