"""Thresholds per variable for alert severity levels.

This file is intentionally a simple Python dict to avoid DB migrations.
Keys should match `Variable.v_name` or variable id as string.
Values: dict with keys 'info','warning','critical' numeric thresholds.
"""

THRESHOLDS = {
    # Example thresholds (units depend on variable.v_unit)
    # PM2.5
    'PM2.5': {'info': 12.0, 'warning': 35.0, 'critical': 55.0},
    'PM25': {'info': 12.0, 'warning': 35.0, 'critical': 55.0},
    # PM10
    'PM10': {'info': 20.0, 'warning': 50.0, 'critical': 150.0},
    # O3
    'O3': {'info': 70.0, 'warning': 120.0, 'critical': 180.0},
    # NO2
    'NO2': {'info': 40.0, 'warning': 100.0, 'critical': 200.0},
    # SO2
    'SO2': {'info': 20.0, 'warning': 80.0, 'critical': 200.0},
    # CO (mg/m3)
    'CO': {'info': 4.0, 'warning': 10.0, 'critical': 30.0},
}
