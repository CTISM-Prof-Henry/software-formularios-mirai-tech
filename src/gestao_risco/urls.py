from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('src.usuarios.urls')),
    path('api/riscos/', include('src.riscos.urls')),
]
