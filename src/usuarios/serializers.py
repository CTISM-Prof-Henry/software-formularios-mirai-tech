from rest_framework import serializers
from .models import Usuario, Setor

class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = ['id', 'nome', 'sigla']


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para o cadastro de novos usuários.
    """
    senha = serializers.CharField(write_only=True, min_length=8, source='password')
    id_setores = serializers.PrimaryKeyRelatedField(
        queryset=Setor.objects.all(), 
        source='setores', 
        many=True,
        required=False
    )

    class Meta:
        model = Usuario
        fields = ['id', 'siape', 'senha', 'nome', 'email', 'id_setores']

    def create(self, dados_validados):
        senha = dados_validados.pop('password')
        setores = dados_validados.pop('setores', [])
        
        usuario = Usuario.objects.create_user(**dados_validados)
        usuario.set_password(senha)
        usuario.save()
        
        if setores:
            usuario.setores.set(setores)
            
        return usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para exibir dados do usuário logado (incluindo lista de setores).
    """
    setores = SetorSerializer(many=True, read_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'siape', 'nome', 'email', 'setores']


class AtualizarPerfilSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização parcial do perfil (senha, email e setores).
    """
    senha = serializers.CharField(write_only=True, min_length=8, source='password', required=False)
    id_setores = serializers.PrimaryKeyRelatedField(
        queryset=Setor.objects.all(), 
        source='setores', 
        many=True,
        required=False
    )

    class Meta:
        model = Usuario
        fields = ['senha', 'email', 'id_setores']

    def update(self, instance, dados_validados):
        # Tratamento da senha se fornecida
        if 'password' in dados_validados:
            senha = dados_validados.pop('password')
            instance.set_password(senha)
            
        # Tratamento dos setores se fornecidos
        if 'setores' in dados_validados:
            setores = dados_validados.pop('setores')
            instance.setores.set(setores)
            
        # Atualiza os demais campos (email)
        for attr, value in dados_validados.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance
