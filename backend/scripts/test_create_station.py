import urllib.request
import json

url = 'http://localhost:8000/api/stations/'
payload = {
    's_name': 'estacion prueba via api',
    'lat': '3.420556',
    'lon': '-76.522224',
    'calibration_certificate': 'cert.pdf',
    's_state': 'activo'
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print('status', resp.status)
        try:
            print(json.loads(body))
        except Exception:
            print(body)
except Exception as e:
    print('ERROR', e)
