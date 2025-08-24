from .views import index, generate
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', index),
    path('generate', generate)
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[1])
    urlpatterns += static('/', document_root=settings.STATICFILES_DIRS[1])
