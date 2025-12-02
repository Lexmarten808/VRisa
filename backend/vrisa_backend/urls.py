"""
URL configuration for vrisa_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from institutions.views import InstitutionViewSet
from institutions.views import register_institution_with_user, approve_institution
from stations.views import StationViewSet
from sensors.views import SensorViewSet
from measurements.views import MeasurementViewSet

router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet, basename='institutions')
router.register(r'stations', StationViewSet, basename='stations')
router.register(r'sensors', SensorViewSet, basename='sensors')
router.register(r'measurements', MeasurementViewSet, basename='measurements')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/institutions/register_with_user/', register_institution_with_user),
    path('api/institutions/approve/<int:institution_id>/', approve_institution),
    path('api/', include(router.urls)),
]
