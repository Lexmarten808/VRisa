from django.urls import path
from .views import register_user, login_user, health

urlpatterns = [
    path('register/', register_user),
    path('login/', login_user),
    path('health/', health),
]
