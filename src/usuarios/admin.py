from django.contrib import admin
from .models import Usuario, Setor

@admin.register(Setor)
class SetorAdmin(admin.ModelAdmin):
    list_display = ('sigla', 'nome')
    search_fields = ('sigla', 'nome')

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('siape', 'nome', 'email', 'exibir_setores', 'ativo', 'equipe')
    search_fields = ('siape', 'nome', 'email')
    list_filter = ('ativo', 'equipe', 'setores')
    ordering = ('nome',)

    def exibir_setores(self, obj):
        return ", ".join([s.sigla for s in obj.setores.all()])
    exibir_setores.short_description = "Setores"
