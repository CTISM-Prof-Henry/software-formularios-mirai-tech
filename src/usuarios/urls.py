from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SetorViewSet, RegistroUsuarioView, LoginView, UsuarioLogadoView

router = DefaultRouter()
router.register(r'setores', SetorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UsuarioLogadoView.as_view(), name='usuario-logado'),
]
