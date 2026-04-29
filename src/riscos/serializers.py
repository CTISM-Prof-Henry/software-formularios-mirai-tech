from rest_framework import serializers

from src.usuarios.serializers import UnidadeOrganizacionalSerializer

from .models import DesafioPDI, Macroprocesso, Monitoramento, ObjetivoPDI, PlanoAcao, Risco


class DesafioPDISerializer(serializers.ModelSerializer):
    class Meta:
        model = DesafioPDI
        fields = '__all__'

class MacroprocessoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Macroprocesso
        fields = '__all__'

class ObjetivoPDISerializer(serializers.ModelSerializer):
    desafio_detalhes = DesafioPDISerializer(source='desafio', read_only=True)
    
    class Meta:
        model = ObjetivoPDI
        fields = ['id', 'codigo', 'descricao', 'desafio', 'desafio_detalhes']

class RiscoSerializer(serializers.ModelSerializer):
    nivel_risco = serializers.IntegerField(read_only=True)
    nivel_residual = serializers.IntegerField(read_only=True)
    setor_detalhes = UnidadeOrganizacionalSerializer(source='setor', read_only=True)
    objetivo_detalhes = ObjetivoPDISerializer(source='objetivo', read_only=True)
    macroprocesso_detalhes = MacroprocessoSerializer(source='macroprocesso', read_only=True)

    class Meta:
        model = Risco
        fields = [
            'id', 'setor', 'setor_detalhes', 'objetivo', 'objetivo_detalhes', 
            'macroprocesso', 'macroprocesso_detalhes', 'categoria', 'evento', 
            'causa', 'consequencia', 'controles_atuais', 'eficacia_controle', 
            'probabilidade', 'impacto', 'nivel_risco', 'prob_residual', 
            'imp_residual', 'nivel_residual'
        ]

class PlanoAcaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanoAcao
        fields = '__all__'

class MonitoramentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Monitoramento
        fields = '__all__'
