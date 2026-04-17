from django.db import models
from src.usuarios.models import Setor

class DesafioPDI(models.Model):
    numero = models.IntegerField(unique=True, verbose_name="Número do Desafio", db_column="numero")
    descricao = models.CharField(max_length=255, verbose_name="Descrição", db_column="descricao")

    class Meta:
        db_table = "desafios_pdi"
        verbose_name = "Desafio PDI"
        verbose_name_plural = "Desafios PDI"

    def __str__(self):
        return f"{self.numero} - {self.descricao}"


class Macroprocesso(models.Model):
    nome = models.CharField(max_length=255, unique=True, verbose_name="Nome do Processo", db_column="nome")

    class Meta:
        db_table = "macroprocessos"
        verbose_name = "Macroprocesso"
        verbose_name_plural = "Macroprocessos"

    def __str__(self):
        return self.nome


class ObjetivoPDI(models.Model):
    codigo = models.CharField(max_length=20, unique=True, verbose_name="Código", db_column="codigo")
    descricao = models.TextField(verbose_name="Descrição", db_column="descricao")
    desafio = models.ForeignKey(DesafioPDI, on_delete=models.CASCADE, related_name="objetivos", db_column="id_desafio")

    class Meta:
        db_table = "objetivos_pdi"
        verbose_name = "Objetivo PDI"
        verbose_name_plural = "Objetivos PDI"

    def __str__(self):
        return f"{self.codigo} - {self.descricao[:50]}"


class Risco(models.Model):
    CATEGORIAS_CHOICES = [
        ('Operacional', 'Operacional'),
        ('Estratégico', 'Estratégico'),
        ('Integridade', 'Integridade'),
        ('Imagem', 'Imagem'),
        ('Financeiro', 'Financeiro'),
    ]

    EFICACIA_CHOICES = [
        ('Forte', 'Forte'),
        ('Médio', 'Médio'),
        ('Fraco', 'Fraco'),
    ]

    setor = models.ForeignKey(Setor, on_delete=models.CASCADE, related_name="riscos", db_column="id_setor")
    objetivo = models.ForeignKey(ObjetivoPDI, on_delete=models.CASCADE, related_name="riscos", db_column="id_objetivo")
    macroprocesso = models.ForeignKey(Macroprocesso, on_delete=models.CASCADE, related_name="riscos", db_column="id_macroprocesso")
    
    categoria = models.CharField(max_length=50, choices=CATEGORIAS_CHOICES, db_column="categoria")
    evento = models.TextField(db_column="evento")
    causa = models.TextField(db_column="causa")
    consequencia = models.TextField(db_column="consequencia")
    
    controles_atuais = models.TextField(db_column="controles_atuais")
    eficacia_controle = models.CharField(max_length=50, choices=EFICACIA_CHOICES, db_column="eficacia_controle")
    
    probabilidade = models.IntegerField(db_column="probabilidade") # 1-5
    impacto = models.IntegerField(db_column="impacto") # 1-5
    nivel_risco = models.IntegerField(db_column="nivel_risco", editable=False)
    
    prob_residual = models.IntegerField(db_column="prob_residual") # 1-5
    imp_residual = models.IntegerField(db_column="imp_residual") # 1-5
    nivel_residual = models.IntegerField(db_column="nivel_residual", editable=False)

    class Meta:
        db_table = "riscos"
        verbose_name = "Risco"
        verbose_name_plural = "Riscos"

    def save(self, *args, **kwargs):
        self.nivel_risco = self.probabilidade * self.impacto
        self.nivel_residual = self.prob_residual * self.imp_residual
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Risco {self.id} - {self.setor.sigla}"


class PlanoAcao(models.Model):
    RESPOSTA_CHOICES = [
        ('Mitigar', 'Mitigar'),
        ('Evitar', 'Evitar'),
        ('Transferir', 'Transferir'),
        ('Aceitar', 'Aceitar'),
    ]

    STATUS_CHOICES = [
        ('Não iniciada', 'Não iniciada'),
        ('Em andamento', 'Em andamento'),
        ('Concluída', 'Concluída'),
        ('Atrasada', 'Atrasada'),
    ]

    risco = models.ForeignKey(Risco, on_delete=models.CASCADE, related_name="planos_acao", db_column="id_risco")
    tipo_resposta = models.CharField(max_length=50, choices=RESPOSTA_CHOICES, db_column="tipo_resposta")
    descricao_acao = models.TextField(db_column="descricao_acao")
    responsavel = models.CharField(max_length=255, db_column="responsavel")
    parceiros = models.TextField(db_column="parceiros")
    data_inicio = models.DateField(db_column="data_inicio")
    data_fim = models.DateField(db_column="data_fim")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, db_column="status")
    observacoes = models.TextField(db_column="observacoes")

    class Meta:
        db_table = "planos_acao"
        verbose_name = "Plano de Ação"
        verbose_name_plural = "Planos de Ação"


class Monitoramento(models.Model):
    risco = models.ForeignKey(Risco, on_delete=models.CASCADE, related_name="monitoramentos", db_column="id_risco")
    data_verificacao = models.DateField(auto_now_add=True, db_column="data_verificacao")
    resultados = models.TextField(db_column="resultados")
    acoes_futuras = models.TextField(db_column="acoes_futuras")
    analise_critica = models.TextField(db_column="analise_critica")

    class Meta:
        db_table = "monitoramentos"
        verbose_name = "Monitoramento"
        verbose_name_plural = "Monitoramentos"
