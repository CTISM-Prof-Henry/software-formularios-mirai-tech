from rest_framework import serializers

from .models import Setor, Usuario


class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = [
            'id',
            'nome',
            'sigla',
            'sigla_centro',
            'nome_centro',
            'tipo_unidade',
            'fonte_oficial',
            'ativo',
            'label_curto',
            'label_completo',
        ]


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
        fields = ['id', 'siape', 'nome', 'email', 'setores', 'is_superuser']


class AtualizarPerfilSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização do perfil com validação de senha atual.
    """
    senha_atual = serializers.CharField(write_only=True, required=False)
    nova_senha = serializers.CharField(write_only=True, min_length=8, required=False)
    confirmacao_senha = serializers.CharField(write_only=True, required=False)
    id_setores = serializers.PrimaryKeyRelatedField(
        queryset=Setor.objects.all(), 
        source='setores', 
        many=True,
        required=False
    )

    class Meta:
        model = Usuario
        fields = ['email', 'id_setores', 'senha_atual', 'nova_senha', 'confirmacao_senha']

    def validate(self, data):
        nova_senha = data.get('nova_senha')
        confirmacao = data.get('confirmacao_senha')
        senha_atual = data.get('senha_atual')

        # Se tentar mudar a senha, valida requisitos
        if nova_senha or confirmacao or senha_atual:
            if not senha_atual:
                raise serializers.ValidationError({"senha_atual": "A senha atual é obrigatória para definir uma nova."})
            
            if not self.instance.check_password(senha_atual):
                raise serializers.ValidationError({"senha_atual": "Senha atual incorreta."})

            if nova_senha != confirmacao:
                raise serializers.ValidationError({"confirmacao_senha": "A nova senha e a confirmação não coincidem."})
            
            if not nova_senha:
                raise serializers.ValidationError({"nova_senha": "A nova senha não pode estar vazia."})

        return data

    def update(self, instance, validated_data):
        # Remove campos de senha da atualização genérica
        nova_senha = validated_data.pop('nova_senha', None)
        validated_data.pop('senha_atual', None)
        validated_data.pop('confirmacao_senha', None)
        
        # Trata atualização de setores
        if 'setores' in validated_data:
            setores = validated_data.pop('setores')
            instance.setores.set(setores)

        # Atualiza email e outros campos genéricos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Se houver nova senha validada, aplica o hash
        if nova_senha:
            instance.set_password(nova_senha)

        instance.save()
        return instance
