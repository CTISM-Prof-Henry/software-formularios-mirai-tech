from collections import defaultdict
from datetime import date

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

    CATEGORY_ORDER = ["Operacional", "Estratégico", "Integridade", "Imagem", "Financeiro"]

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

    def _normalize_status(self, status_label):
        normalized = (status_label or "").lower()
        if "conclu" in normalized:
            return "concluidas"
        if "andamento" in normalized:
            return "em_andamento"
        if "atras" in normalized:
            return "atrasadas"
        if "nao" in normalized or "não" in normalized:
            return "nao_iniciadas"
        return "outros"

    def _serialize_planos(self, planos, primeira_acao_por_risco, monitoramentos_por_risco):
        planos_data = RiscoSerializer(planos, many=True).data
        for plano_data in planos_data:
            acao = primeira_acao_por_risco.get(plano_data["id"])
            monitoramento = monitoramentos_por_risco.get(plano_data["id"])
            plano_data["periodo_acao"] = {
                "data_inicio": acao.data_inicio.isoformat() if acao else None,
                "data_fim": acao.data_fim.isoformat() if acao else None,
            }
            plano_data["possui_monitoramento"] = monitoramento is not None
        return planos_data

    def _build_analytics(self, queryset):
        planos = list(queryset)
        planos_ids = [plano.id for plano in planos]

        acoes = list(
            PlanoAcao.objects.filter(risco_id__in=planos_ids)
            .select_related("risco")
            .order_by("risco_id", "data_inicio", "id")
        )
        monitoramentos = list(
            Monitoramento.objects.filter(risco_id__in=planos_ids)
            .select_related("risco")
            .order_by("risco_id", "-data_verificacao", "-id")
        )

        primeira_acao_por_risco = {}
        monitoramentos_por_risco = {}
        for acao in acoes:
            primeira_acao_por_risco.setdefault(acao.risco_id, acao)
        for monitoramento in monitoramentos:
            monitoramentos_por_risco.setdefault(monitoramento.risco_id, monitoramento)

        categorias = {categoria: 0 for categoria in self.CATEGORY_ORDER}
        riscos_por_nivel = {
            "extremo": 0,
            "alto": 0,
            "moderado": 0,
            "baixo": 0,
        }
        matriz_residual = defaultdict(int)
        ranking_unidades = {}
        planos_melhorados = 0

        for plano in planos:
            categorias.setdefault(plano.categoria, 0)
            categorias[plano.categoria] += 1

            if plano.nivel_residual >= 20:
                riscos_por_nivel["extremo"] += 1
            elif plano.nivel_residual >= 12:
                riscos_por_nivel["alto"] += 1
            elif plano.nivel_residual >= 4:
                riscos_por_nivel["moderado"] += 1
            else:
                riscos_por_nivel["baixo"] += 1

            if plano.nivel_residual < plano.nivel_risco:
                planos_melhorados += 1

            matriz_residual[(plano.prob_residual, plano.imp_residual)] += 1

            unidade_nome = getattr(plano.setor, "label_curto", None) or plano.setor.nome
            ranking = ranking_unidades.setdefault(
                plano.setor_id,
                {
                    "id": plano.setor_id,
                    "nome": unidade_nome,
                    "pontos": 0,
                    "quantidade_riscos": 0,
                    "criticos": 0,
                },
            )
            ranking["pontos"] += int(plano.nivel_residual or 0)
            ranking["quantidade_riscos"] += 1
            if plano.nivel_residual >= 12:
                ranking["criticos"] += 1

        status_tratamentos = {
            "em_andamento": 0,
            "concluidas": 0,
            "atrasadas": 0,
            "nao_iniciadas": 0,
        }
        today = date.today()
        acoes_atrasadas = 0
        for acao in acoes:
            status_chave = self._normalize_status(acao.status)
            if status_chave in status_tratamentos:
                status_tratamentos[status_chave] += 1
            if status_chave != "concluidas" and acao.data_fim < today:
                acoes_atrasadas += 1

        unidades_maior_exposicao = sorted(
            ranking_unidades.values(),
            key=lambda item: (-item["pontos"], -item["quantidade_riscos"], item["nome"]),
        )[:5]

        total_planos = len(planos)
        riscos_monitorados = len(monitoramentos_por_risco)
        cobertura_monitoramento = round((riscos_monitorados / total_planos) * 100, 1) if total_planos else 0
        taxa_mitigacao = round((planos_melhorados / total_planos) * 100, 1) if total_planos else 0

        planos_ordenados = sorted(
            planos,
            key=lambda plano: (-plano.nivel_residual, -plano.nivel_risco, plano.id),
        )
        riscos_prioritarios = []
        for plano in planos_ordenados[:5]:
            acao = primeira_acao_por_risco.get(plano.id)
            monitoramento = monitoramentos_por_risco.get(plano.id)
            plano_data = RiscoSerializer(plano).data
            plano_data["responsavel"] = acao.responsavel if acao else None
            plano_data["tipo_resposta"] = acao.tipo_resposta if acao else None
            plano_data["status_tratamento"] = acao.status if acao else None
            plano_data["possui_monitoramento"] = monitoramento is not None
            riscos_prioritarios.append(plano_data)

        return {
            "planos": self._serialize_planos(planos, primeira_acao_por_risco, monitoramentos_por_risco),
            "total_planos": total_planos,
            "riscos_criticos": riscos_por_nivel["alto"] + riscos_por_nivel["extremo"],
            "riscos_por_nivel": riscos_por_nivel,
            "tratamentos_ativos": status_tratamentos["em_andamento"],
            "tratamentos_concluidos": status_tratamentos["concluidas"],
            "tratamentos_atrasados": status_tratamentos["atrasadas"],
            "tratamentos_nao_iniciados": status_tratamentos["nao_iniciadas"],
            "acoes_atrasadas": acoes_atrasadas,
            "setores_filtrados": len({plano.setor_id for plano in planos}),
            "riscos_sem_acao": max(total_planos - len(primeira_acao_por_risco), 0),
            "riscos_monitorados": riscos_monitorados,
            "cobertura_monitoramento": cobertura_monitoramento,
            "objetivos_cobertos": len({plano.objetivo_id for plano in planos}),
            "desafios_cobertos": len({plano.objetivo.desafio_id for plano in planos}),
            "taxa_mitigacao": taxa_mitigacao,
            "riscos_melhorados": planos_melhorados,
            "status_tratamentos": status_tratamentos,
            "distribuicao_categorias": [
                {"nome": categoria, "quantidade": categorias.get(categoria, 0)}
                for categoria in self.CATEGORY_ORDER
            ],
            "unidades_maior_exposicao": unidades_maior_exposicao,
            "matriz_residual": [
                {
                    "probabilidade": probabilidade,
                    "impacto": impacto,
                    "quantidade": matriz_residual.get((probabilidade, impacto), 0),
                    "score": probabilidade * impacto,
                }
                for impacto in [5, 4, 3, 2, 1]
                for probabilidade in [1, 2, 3, 4, 5]
            ],
            "riscos_prioritarios": riscos_prioritarios,
        }

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
        return Response(self._build_analytics(self.get_queryset()))

    @action(detail=False, methods=['get'], url_path='mapa-analytics')
    def mapa_analytics(self, request):
        """Retorna os dados analíticos do mapa de riscos respeitando filtros."""
        analytics = self._build_analytics(self.get_queryset())
        return Response({
            "total_riscos": analytics["total_planos"],
            "distribuicao_categorias": analytics["distribuicao_categorias"],
            "unidades_maior_pontuacao": analytics["unidades_maior_exposicao"],
            "taxa_mitigacao": analytics["taxa_mitigacao"],
            "riscos_melhorados": analytics["riscos_melhorados"],
            "riscos_sem_acao": analytics["riscos_sem_acao"],
            "riscos_monitorados": analytics["riscos_monitorados"],
            "cobertura_monitoramento": analytics["cobertura_monitoramento"],
            "objetivos_cobertos": analytics["objetivos_cobertos"],
            "desafios_cobertos": analytics["desafios_cobertos"],
            "acoes_atrasadas": analytics["acoes_atrasadas"],
            "resumo_niveis": analytics["riscos_por_nivel"],
            "matriz_residual": analytics["matriz_residual"],
            "riscos_prioritarios": analytics["riscos_prioritarios"],
            "status_tratamentos": analytics["status_tratamentos"],
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
