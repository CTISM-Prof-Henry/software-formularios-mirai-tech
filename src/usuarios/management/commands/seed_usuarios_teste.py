from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token

from src.usuarios.models import Setor, Usuario


USUARIOS_TESTE = [
    {
        "siape": "2030001",
        "nome": "Ana Paula Multissetorial",
        "email": "ana.multissetorial@teste.ufsm.br",
        "setores": ["CAL", "CCS", "CT"],
        "equipe": True,
    },
    {
        "siape": "2030002",
        "nome": "Bruno Gestor Centros",
        "email": "bruno.centros@teste.ufsm.br",
        "setores": ["CAL", "CCR"],
        "equipe": False,
    },
    {
        "siape": "2030003",
        "nome": "Carla Gestora Pesquisa",
        "email": "carla.pesquisa@teste.ufsm.br",
        "setores": ["CCS", "CCNE", "CCSH"],
        "equipe": False,
    },
    {
        "siape": "2030004",
        "nome": "Diego Gestor Ensino",
        "email": "diego.ensino@teste.ufsm.br",
        "setores": ["CE", "CEFD"],
        "equipe": False,
    },
    {
        "siape": "2030005",
        "nome": "Elisa Gestora Tecnologia",
        "email": "elisa.tecnologia@teste.ufsm.br",
        "setores": ["CT", "CTISM", "Politecnico"],
        "equipe": False,
    },
]


class Command(BaseCommand):
    help = "Cria usuarios de teste vinculados a varios setores para validar a gestao de equipe."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default="Teste@12345",
            help="Senha que sera aplicada aos usuarios de teste.",
        )
        parser.add_argument(
            "--reset-password",
            action="store_true",
            help="Atualiza a senha mesmo quando o usuario ja existe.",
        )

    def handle(self, *args, **options):
        password = options["password"]
        reset_password = options["reset_password"]
        criados = 0
        atualizados = 0

        for dados_usuario in USUARIOS_TESTE:
            setores = [
                Setor.objects.get_or_create(sigla=sigla, defaults={"nome": sigla})[0]
                for sigla in dados_usuario["setores"]
            ]
            usuario, criado = Usuario.objects.get_or_create(
                siape=dados_usuario["siape"],
                defaults={
                    "nome": dados_usuario["nome"],
                    "email": dados_usuario["email"],
                    "equipe": dados_usuario["equipe"],
                },
            )

            usuario.nome = dados_usuario["nome"]
            usuario.email = dados_usuario["email"]
            usuario.equipe = dados_usuario["equipe"]
            usuario.ativo = True

            if criado or reset_password:
                usuario.set_password(password)

            usuario.save()
            usuario.setores.set(setores)
            Token.objects.get_or_create(user=usuario)

            if criado:
                criados += 1
            else:
                atualizados += 1

        self.stdout.write(self.style.SUCCESS(
            f"Usuarios de teste prontos: {criados} criados, {atualizados} atualizados. "
            f"Senha padrao: {password}"
        ))
