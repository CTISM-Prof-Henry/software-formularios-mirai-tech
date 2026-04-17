from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DesafioPDIViewSet, MacroprocessoViewSet, ObjetivoPDIViewSet, 
    RiscoViewSet, PlanoAcaoViewSet, MonitoramentoViewSet
)

router = DefaultRouter()
router.register(r'desafios', DesafioPDIViewSet)
router.register(r'macroprocessos', MacroprocessoViewSet)
router.register(r'objetivos', ObjetivoPDIViewSet)
router.register(r'planos', RiscoViewSet)
router.register(r'acoes', PlanoAcaoViewSet)
router.register(r'monitoramentos', MonitoramentoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
