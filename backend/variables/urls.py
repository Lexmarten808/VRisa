from django.urls import path
from .views import variables_list

urlpatterns = [
    path('', variables_list),
]
