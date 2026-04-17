from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
import random
from django.utils import timezone
from datetime import timedelta
from .models import Usuario, Setor, CodigoRecuperacao
from .serializers import (
    SetorSerializer, 
    RegistroUsuarioSerializer, 
    UsuarioSerializer, 
    AtualizarPerfilSerializer
)

class EnviarCodigoRecuperacaoView(APIView):
    """
    Gera e "envia" um código de 6 dígitos para o e-mail informado.
    Valida se o e-mail pertence a um usuário cadastrado.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'erro': 'O e-mail é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        # Valida se o usuário existe
        if not Usuario.objects.filter(email=email).exists():
            return Response({'erro': 'E-mail não encontrado no sistema.'}, status=status.HTTP_404_NOT_FOUND)

        # Gera código de 6 dígitos
        codigo = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Salva o código (remove códigos anteriores do mesmo e-mail para limpar)
        CodigoRecuperacao.objects.filter(email=email).delete()
        CodigoRecuperacao.objects.create(email=email, codigo=codigo)

        # TODO: Integrar com serviço de e-mail real
        print(f"DEBUG: Código de recuperação para {email}: {codigo}")

        return Response({'mensagem': 'Código enviado com sucesso!'})


class ValidarCodigoRecuperacaoView(APIView):
    """
    Valida se o código informado é correto e se ainda não expirou (1 minuto).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')

        if not email or not codigo:
            return Response({'erro': 'E-mail e código são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            registro = CodigoRecuperacao.objects.get(email=email, codigo=codigo)
            
            # Verifica expiração (1 minuto)
            agora = timezone.now()
            if agora > registro.criado_em + timedelta(minutes=1):
                registro.delete()
                return Response({'erro': 'Este código expirou.'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({'mensagem': 'Código validado com sucesso!'})
            
        except CodigoRecuperacao.DoesNotExist:
            return Response({'erro': 'Código inválido.'}, status=status.HTTP_400_BAD_REQUEST)


class RedefinirSenhaView(APIView):
    """
    Realiza a troca de senha após a validação do código de recuperação.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')
        nova_senha = request.data.get('nova_senha')
        confirmacao = request.data.get('confirmacao_senha')

        if not all([email, codigo, nova_senha, confirmacao]):
            return Response({'erro': 'Todos os campos são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        if nova_senha != confirmacao:
            return Response({'erro': 'As senhas não coincidem.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(nova_senha) < 8:
            return Response({'erro': 'A senha deve ter pelo menos 8 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Valida o código uma última vez por segurança
            registro = CodigoRecuperacao.objects.get(email=email, codigo=codigo)
            
            # Verifica expiração (1 minuto)
            agora = timezone.now()
            if agora > registro.criado_em + timedelta(minutes=1):
                registro.delete()
                return Response({'erro': 'O tempo para redefinir a senha expirou.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Atualiza a senha do usuário
            usuario = Usuario.objects.get(email=email)
            usuario.set_password(nova_senha)
            usuario.save()
            
            # Remove o código usado
            registro.delete()
            
            return Response({'mensagem': 'Senha redefinida com sucesso!'})
            
        except (CodigoRecuperacao.DoesNotExist, Usuario.DoesNotExist):
            return Response({'erro': 'Dados inválidos ou sessão expirada.'}, status=status.HTTP_400_BAD_REQUEST)


class SetorViewSet(viewsets.ModelViewSet):
    """
    CRUD completo de Setores da UFSM.
    """
    queryset = Setor.objects.all()
    serializer_class = SetorSerializer
    permission_classes = [AllowAny] # Aberto para cadastro


class RegistroUsuarioView(generics.CreateAPIView):
    """
    Endpoint para cadastrar novos usuários (Gestores).
    """
    queryset = Usuario.objects.all()
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializador = self.get_serializer(data=request.data)
        serializador.is_valid(raise_exception=True)
        usuario = serializador.save()
        
        # Criamos o token automaticamente ao registrar
        token, criado = Token.objects.get_or_create(user=usuario)
        
        return Response({
            "usuario": UsuarioSerializer(usuario).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Endpoint de Login 100% em português. Recebe 'siape' e 'senha'.
    Retorna o Token de acesso e dados básicos do usuário.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        siape = request.data.get('siape')
        senha = request.data.get('senha')

        # Autentica usando o backend do Django, mapeando username para siape
        usuario = authenticate(request, username=siape, password=senha)
        
        if usuario is not None:
            token, criado = Token.objects.get_or_create(user=usuario)
            return Response({
                'token': token.key,
                'usuario': UsuarioSerializer(usuario).data
            })
        else:
            return Response(
                {'erro': 'SIAPE ou senha inválidos.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class UsuarioLogadoView(APIView):
    """
    Gerencia os dados do próprio usuário (Leitura e Atualização).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retorna os dados do usuário autenticado."""
        serializador = UsuarioSerializer(request.user)
        return Response(serializador.data)

    def patch(self, request):
        """Atualiza parcialmente os dados do usuário (senha, e-mail e setores)."""
        serializador = AtualizarPerfilSerializer(
            instance=request.user, 
            data=request.data, 
            partial=True
        )
        serializador.is_valid(raise_exception=True)
        serializador.save()
        
        # Retorna os dados atualizados usando o serializador de exibição
        return Response({
            "mensagem": "Perfil atualizado com sucesso!",
            "usuario": UsuarioSerializer(request.user).data
        })
