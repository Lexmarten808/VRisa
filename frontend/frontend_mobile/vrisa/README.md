# VRISA Mobile — Local testing guide

Quick steps to run the mobile app and backend locally (no web):

1. Start the backend (Django) and allow connections from your machine:

```powershell
cd backend
py -3 -m pip install -r requirements.txt   # if needed
py -3 manage.py runserver 0.0.0.0:8000
```

2. Ensure the backend health endpoint responds:

```powershell
Invoke-RestMethod -Uri 'http://localhost:8000/api/users/health/'
# expected: {"status":"ok"}
```

3. Start the mobile app using Expo (device/emulator):

```powershell
cd frontend\frontend_mobile\vrisa
npm install
npx expo start
# Use the Expo dev tools to open on a device or emulator (do not use --web)
```

4. If the app can't detect the backend automatically, set the "API base" on the Login screen to `http://localhost:8000` or `http://<YOUR_PC_IP>:8000` for physical devices.

Notes
- The backend is configured to allow CORS during development (`DEBUG = True`). If you change `DEBUG` to `False`, update `CORS_ALLOWED_ORIGINS` appropriately.
- If you test from a physical phone on the same LAN, set the API base to `http://<YOUR_PC_IP>:8000` and run the Django server bound to `0.0.0.0`.
