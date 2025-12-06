from django.urls import path
from .views import register_user, login_user, health, pending_users, approve_user, reject_user, user_status, user_detail

urlpatterns = [
    path('register/', register_user),
    path('login/', login_user),
    path('health/', health),
    path('pending/', pending_users),
    path('approve/<int:user_id>/', approve_user),
    path('reject/<int:user_id>/', reject_user),
    path('status/', user_status),
    path('detail/<int:user_id>/', user_detail),
]
