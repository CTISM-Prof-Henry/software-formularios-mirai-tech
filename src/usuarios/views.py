from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from .models import Usuario, Setor
from .serializers import (
    SetorSerializer, 
    RegistroUsuarioSerializer, 
    UsuarioSerializer, 
    AtualizarPerfilSerializer
)

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
