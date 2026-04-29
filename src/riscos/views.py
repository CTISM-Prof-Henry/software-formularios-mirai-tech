from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .exporters import exportar_risco_excel, exportar_risco_pdf, exportar_riscos_excel
from .models import DesafioPDI, Macroprocesso, Monitoramento, ObjetivoPDI, PlanoAcao, Risco
from .serializers import (
    DesafioPDISerializer,
    MacroprocessoSerializer,
    MonitoramentoSerializer,
    ObjetivoPDISerializer,
    PlanoAcaoSerializer,
    RiscoSerializer,
)


class PertenceAoSetorDoRisco(permissions.BasePermission):
    """
    Permissão que permite visualizar a qualquer gestor, mas
    restringe a edição apenas a gestores vinculados ao setor do risco.
    """
    def has_object_permission(self, request, view, obj):
        # Métodos de leitura (GET, HEAD, OPTIONS) são permitidos para qualquer gestor logado
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Para edição, verifica se o setor do risco está entre os setores do usuário
        # obj pode ser um Risco ou ter uma relação direta com Risco
        if isinstance(obj, Risco):
            setor_do_risco = obj.setor
        elif hasattr(obj, 'risco'):
            setor_do_risco = obj.risco.setor
        else:
            return False

        return request.user.setores.filter(id=setor_do_risco.id).exists()

class RiscoViewSet(viewsets.ModelViewSet):
    queryset = Risco.objects.all()
    serializer_class = RiscoSerializer
    permission_classes = [permissions.IsAuthenticated, PertenceAoSetorDoRisco]

    def get_queryset(self):
        queryset = Risco.objects.select_related(
            "setor",
            "objetivo__desafio",
            "macroprocesso",
        ).prefetch_related("planos_acao")
        
        # Filtros básicos
        setor_id = self.request.query_params.get('setor')
        categoria = self.request.query_params.get('categoria')
        search = self.request.query_params.get('search')
        
        # Filtros de Data (considerando que planos de ação tem datas, mas o risco em si usaremos ID para ordenação)
        # Se desejar filtrar pela data de início do primeiro plano de ação vinculado:
        data_inicio = self.request.query_params.get('data_inicio')
        data_fim = self.request.query_params.get('data_fim')
        ordenacao = self.request.query_params.get('ordenacao', 'desc') # padrão: mais recentes primeiro

        if setor_id:
            queryset = queryset.filter(setor_id=setor_id)
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(evento__icontains=search) | 
                Q(causa__icontains=search) | 
                Q(consequencia__icontains=search)
            )
        if data_inicio:
            queryset = queryset.filter(planos_acao__data_inicio__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(planos_acao__data_fim__lte=data_fim)
        
        # Ordenação
        if ordenacao == 'asc':
            queryset = queryset.order_by('id')
        else:
            queryset = queryset.order_by('-id')
        
        return queryset.distinct()

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Retorna estatísticas globais para os cards do dashboard."""
        total = Risco.objects.count()
        riscos_altos = Risco.objects.filter(nivel_residual__gte=15).count()
        
        # Estatísticas baseadas nos Planos de Ação
        concluidos = PlanoAcao.objects.filter(status='Concluída').count()
        em_revisao = PlanoAcao.objects.filter(status='Em andamento').count()
        
        return Response({
            "total_planos": total,
            "riscos_altos": riscos_altos,
            "em_revisao": em_revisao,
            "concluidos": concluidos
        })

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Retorna os dados consolidados da dashboard respeitando filtros."""
        queryset = self.get_queryset()
        planos = list(queryset)
        planos_ids = [plano.id for plano in planos]
        acoes_filtradas = PlanoAcao.objects.filter(risco_id__in=planos_ids)
        setores_filtrados = {plano.setor_id for plano in planos}
        primeira_acao_por_risco = {}
        for acao in acoes_filtradas.order_by("risco_id", "data_inicio", "id"):
            primeira_acao_por_risco.setdefault(acao.risco_id, acao)

        planos_data = RiscoSerializer(planos, many=True).data
        for plano_data in planos_data:
            acao = primeira_acao_por_risco.get(plano_data["id"])
            plano_data["periodo_acao"] = {
                "data_inicio": acao.data_inicio.isoformat() if acao else None,
                "data_fim": acao.data_fim.isoformat() if acao else None,
            }

        return Response({
            "total_planos": len(planos),
            "riscos_criticos": sum(1 for plano in planos if plano.nivel_residual >= 15),
            "tratamentos_ativos": acoes_filtradas.filter(status='Em andamento').count(),
            "setores_filtrados": len(setores_filtrados),
            "planos": planos_data,
        })

    def create(self, request, *args, **kwargs):
        # Garante que o gestor só crie riscos para os seus próprios setores
        id_setor = request.data.get('setor')
        if not request.user.setores.filter(id=id_setor).exists():
            return Response(
                {"erro": "Você só pode criar riscos para setores aos quais está vinculado."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='exportar-excel')
    def exportar_excel(self, request):
        """Exporta a lista filtrada de planos de risco em Excel."""
        return exportar_riscos_excel(self.get_queryset())

    @action(detail=True, methods=['get'], url_path='exportar-excel')
    def exportar_excel_individual(self, request, pk=None):
        """Exporta um plano de risco em Excel."""
        return exportar_risco_excel(self.get_object())

    @action(detail=True, methods=['get'], url_path='exportar-pdf')
    def exportar_pdf(self, request, pk=None):
        """Exporta um plano de risco em PDF."""
        return exportar_risco_pdf(self.get_object())

class DesafioPDIViewSet(viewsets.ModelViewSet):
    queryset = DesafioPDI.objects.all()
    serializer_class = DesafioPDISerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

class MacroprocessoViewSet(viewsets.ModelViewSet):
    queryset = Macroprocesso.objects.all()
    serializer_class = MacroprocessoSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

class ObjetivoPDIViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoPDI.objects.all()
    serializer_class = ObjetivoPDISerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

class PlanoAcaoViewSet(viewsets.ModelViewSet):
    queryset = PlanoAcao.objects.all()
    serializer_class = PlanoAcaoSerializer
    permission_classes = [permissions.IsAuthenticated, PertenceAoSetorDoRisco]

    def get_queryset(self):
        queryset = PlanoAcao.objects.select_related("risco", "risco__setor").all()
        risco_id = self.request.query_params.get("risco")
        if risco_id:
            queryset = queryset.filter(risco_id=risco_id)
        return queryset.order_by("id")

class MonitoramentoViewSet(viewsets.ModelViewSet):
    queryset = Monitoramento.objects.all()
    serializer_class = MonitoramentoSerializer
    permission_classes = [permissions.IsAuthenticated, PertenceAoSetorDoRisco]
