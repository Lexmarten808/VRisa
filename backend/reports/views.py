from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Max, Min, Count
from django.utils.dateparse import parse_datetime
from datetime import datetime, timedelta

from measurements.models import Measurement
from variables.models import Variable
from stations.models import Station
from .thresholds import THRESHOLDS
import math


def _parse_float(v):
    try:
        return float(v)
    except Exception:
        return None


class AirQualityReportView(APIView):
    """Return aggregated air quality summary for city or a station."""

    def get(self, request):
        station_id = request.query_params.get('station_id')
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')

        try:
            if end:
                end_dt = parse_datetime(end) or datetime.fromisoformat(end)
            else:
                end_dt = datetime.utcnow()
        except Exception:
            end_dt = datetime.utcnow()

        try:
            if start:
                start_dt = parse_datetime(start) or datetime.fromisoformat(start)
            else:
                start_dt = end_dt - timedelta(hours=24)
        except Exception:
            start_dt = end_dt - timedelta(hours=24)

        qs = Measurement.objects.filter(m_date__gte=start_dt, m_date__lte=end_dt)
        if station_id:
            qs = qs.filter(sensor__station__station_id=station_id)

        # Aggregate averages per variable
        agg = (
            qs.values('variable__v_id', 'variable__v_name', 'variable__v_unit')
            .annotate(avg=Avg('m_value'), maximum=Max('m_value'), minimum=Min('m_value'), samples=Count('m_id'))
            .order_by('-avg')
        )

        # Hotspots: stations with highest average for their top pollutant
        station_avgs = (
            qs.values('sensor__station__station_id', 'sensor__station__s_name', 'sensor__station__lat', 'sensor__station__lon')
            .annotate(avg_value=Avg('m_value'))
            .order_by('-avg_value')[:200]
        )

        # Build simple heatmap by binning lat/lon into grid cells
        cell_size = 0.01  # ~1km scale depending on latitude
        grid = {}
        for s in station_avgs:
            lat = _parse_float(s.get('sensor__station__lat'))
            lon = _parse_float(s.get('sensor__station__lon'))
            if lat is None or lon is None:
                continue
            cell_lat = round(lat / cell_size) * cell_size
            cell_lon = round(lon / cell_size) * cell_size
            key = f"{cell_lat}:{cell_lon}"
            entry = grid.setdefault(key, {'sum': 0.0, 'count': 0, 'lat_sum': 0.0, 'lon_sum': 0.0})
            entry['sum'] += float(s.get('avg_value') or 0)
            entry['count'] += 1
            entry['lat_sum'] += lat
            entry['lon_sum'] += lon

        heatmap = []
        for k, v in grid.items():
            avg_intensity = v['sum'] / max(1, v['count'])
            heatmap.append({'lat': v['lat_sum'] / v['count'], 'lon': v['lon_sum'] / v['count'], 'intensity': avg_intensity})

        return Response({'summary': list(agg), 'hotspots': list(station_avgs), 'heatmap': heatmap})


class TrendsReportView(APIView):
    """Return time-series trends for a variable and station grouped by hour/day."""

    def get(self, request):
        variable = request.query_params.get('variable')  # accept id or code/name
        station_id = request.query_params.get('station_id')
        range_days = int(request.query_params.get('days') or 7)

        end_dt = datetime.utcnow()
        start_dt = end_dt - timedelta(days=range_days)

        qs = Measurement.objects.filter(m_date__gte=start_dt, m_date__lte=end_dt)
        if variable:
            try:
                # try numeric id
                vid = int(variable)
                qs = qs.filter(variable__v_id=vid)
            except Exception:
                qs = qs.filter(variable__v_name__icontains=variable)
        if station_id:
            qs = qs.filter(sensor__station__station_id=station_id)

        # Simple hourly aggregation
        # Build a dict grouped by hour
        series = {}
        for m in qs.order_by('m_date'):
            hour = m.m_date.strftime('%Y-%m-%d %H:00')
            key = hour
            if key not in series:
                series[key] = {'time': key, 'count': 0, 'sum': 0}
            series[key]['count'] += 1
            series[key]['sum'] += float(m.m_value)

        data = []
        for k, v in series.items():
            data.append({'time': v['time'], 'value': v['sum'] / max(1, v['count'])})

        return Response({'series': data})


class AlertsReportView(APIView):
    """Compute alert episodes using simple statistical thresholds."""

    def get(self, request):
        variable = request.query_params.get('variable')
        station_id = request.query_params.get('station_id')
        days = int(request.query_params.get('days') or 7)

        end_dt = datetime.utcnow()
        start_dt = end_dt - timedelta(days=days)

        qs = Measurement.objects.filter(m_date__gte=start_dt, m_date__lte=end_dt)
        if variable:
            try:
                vid = int(variable)
                qs = qs.filter(variable__v_id=vid)
            except Exception:
                qs = qs.filter(variable__v_name__icontains=variable)
        if station_id:
            qs = qs.filter(sensor__station__station_id=station_id)

        alerts = []
        # If THRESHOLDS contains an entry for the variable, use it; otherwise fallback to statistical method
        threshold_cfg = None
        if variable:
            # try exact match by name
            threshold_cfg = THRESHOLDS.get(variable)
            # try common variants
            if not threshold_cfg:
                threshold_cfg = THRESHOLDS.get(variable.replace(' ', '').upper()) or THRESHOLDS.get(variable.upper())

        if threshold_cfg:
            for m in qs.order_by('m_date'):
                val = float(m.m_value)
                sev = None
                if val >= threshold_cfg.get('critical'):
                    sev = 'critical'
                elif val >= threshold_cfg.get('warning'):
                    sev = 'warning'
                elif val >= threshold_cfg.get('info'):
                    sev = 'info'
                if sev:
                    alerts.append({'datetime': m.m_date, 'value': val, 'station': getattr(m.sensor.station, 's_name', None), 'severity': sev})
            return Response({'mode': 'thresholds', 'thresholds': threshold_cfg, 'alerts': alerts})

        # fallback statistical
        values = [float(m.m_value) for m in qs]
        if not values:
            return Response({'alerts': []})

        import statistics

        mean = statistics.mean(values)
        stdev = statistics.pstdev(values) if len(values) > 1 else 0
        threshold = mean + 2 * stdev

        for m in qs.order_by('m_date'):
            if float(m.m_value) > threshold:
                alerts.append({'datetime': m.m_date, 'value': float(m.m_value), 'station': getattr(m.sensor.station, 's_name', None), 'severity': 'statistical'})

        return Response({'mode': 'statistical', 'threshold': threshold, 'alerts': alerts})


class ProjectionReportView(APIView):
    """Return a simple linear projection for a variable over the next N hours.

    Uses a least-squares linear fit on recent measurements (no external deps).
    """

    def get(self, request):
        variable = request.query_params.get('variable')
        station_id = request.query_params.get('station_id')
        hours = int(request.query_params.get('hours') or 24)
        points = int(request.query_params.get('points') or hours)

        end_dt = datetime.utcnow()
        start_dt = end_dt - timedelta(days=7)  # use last 7 days by default

        qs = Measurement.objects.filter(m_date__gte=start_dt, m_date__lte=end_dt)
        if variable:
            try:
                vid = int(variable)
                qs = qs.filter(variable__v_id=vid)
            except Exception:
                qs = qs.filter(variable__v_name__icontains=variable)
        if station_id:
            qs = qs.filter(sensor__station__station_id=station_id)

        data = list(qs.order_by('m_date'))
        if len(data) < 3:
            return Response({'error': 'Not enough data to project', 'available': len(data)}, status=400)

        # build arrays of t (seconds) and y
        t0 = data[0].m_date.timestamp()
        xs = [m.m_date.timestamp() - t0 for m in data]
        ys = [float(m.m_value) for m in data]

        # linear regression (least squares)
        n = len(xs)
        sum_x = sum(xs)
        sum_y = sum(ys)
        sum_xx = sum(x * x for x in xs)
        sum_xy = sum(x * y for x, y in zip(xs, ys))
        denom = (n * sum_xx - sum_x * sum_x)
        if denom == 0:
            slope = 0.0
        else:
            slope = (n * sum_xy - sum_x * sum_y) / denom
        intercept = (sum_y - slope * sum_x) / n

        # generate projection points equally spaced over `hours`
        proj = []
        last_ts = data[-1].m_date.timestamp()
        step = (hours * 3600) / max(1, points)
        for i in range(1, points + 1):
            ts = last_ts + i * step
            x = ts - t0
            y = intercept + slope * x
            proj.append({'time': datetime.utcfromtimestamp(ts).isoformat(), 'value': y})

        return Response({'slope': slope, 'intercept': intercept, 'projection': proj})


class InfrastructureReportView(APIView):
    """Return stations infrastructure and maintenance data."""

    def get(self, request):
        try:
            # Use values() to avoid selecting model fields that may not exist in DB
            stations_qs = Station.objects.values('station_id', 's_name', 'lat', 'lon', 'calibration_certificate', 'maintenance_date')
            out = []
            for s in stations_qs:
                # find last measurement by station_id
                last_meas = Measurement.objects.filter(sensor__station__station_id=s.get('station_id')).order_by('-m_date').first()
                maintenance_date = s.get('maintenance_date').isoformat() if s.get('maintenance_date') else None
                last_meas_dt = last_meas.m_date.isoformat() if getattr(last_meas, 'm_date', None) else None
                out.append({
                    'station_id': s.get('station_id'),
                    'name': s.get('s_name'),
                    'lat': s.get('lat'),
                    'lon': s.get('lon'),
                    'calibration_certificate': s.get('calibration_certificate'),
                    'maintenance_date': maintenance_date,
                    'last_measurement': last_meas_dt,
                })

            return Response({'stations': out})
        except Exception as exc:
            return Response({'error': str(exc)}, status=500)
