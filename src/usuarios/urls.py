from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SetorViewSet, 
    RegistroUsuarioView, 
    LoginView, 
    UsuarioLogadoView,
    EnviarCodigoRecuperacaoView,
    ValidarCodigoRecuperacaoView,
    RedefinirSenhaView
)

router = DefaultRouter()
router.register(r'setores', SetorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UsuarioLogadoView.as_view(), name='usuario-logado'),
    path('recuperar-senha/enviar/', EnviarCodigoRecuperacaoView.as_view(), name='recuperar_senha_enviar'),
    path('recuperar-senha/validar/', ValidarCodigoRecuperacaoView.as_view(), name='recuperar_senha_validar'),
    path('recuperar-senha/redefinir/', RedefinirSenhaView.as_view(), name='recuperar_senha_redefinir'),
]
