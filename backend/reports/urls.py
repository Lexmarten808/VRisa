from django.urls import path
from . import views

urlpatterns = [
    path('air_quality/', views.AirQualityReportView.as_view(), name='reports-air-quality'),
    path('trends/', views.TrendsReportView.as_view(), name='reports-trends'),
    path('alerts/', views.AlertsReportView.as_view(), name='reports-alerts'),
    path('projection/', views.ProjectionReportView.as_view(), name='reports-projection'),
    path('infrastructure/', views.InfrastructureReportView.as_view(), name='reports-infrastructure'),
]
