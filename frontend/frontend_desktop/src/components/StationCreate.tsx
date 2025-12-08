import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function StationCreate() {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';
  const api = axios.create({ baseURL: API_BASE });
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [form, setForm] = useState({ s_name: '', lat: '', lon: '', institution_id: 'none', calibration_certificate: '', admin_id: 'none', s_state: 'activo' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get('/api/institutions/');
        const items = Array.isArray(resp.data) ? resp.data : (resp.data?.results ?? []);
        setInstitutions(items || []);
      } catch (e) {
        setInstitutions([]);
      }
      // try to fetch admin users for admin_id select (best-effort)
      try {
        const uresp = await api.get('/api/users/');
        const users = Array.isArray(uresp.data) ? uresp.data : (uresp.data?.results ?? []);
        const adminsList = (users || []).filter((u: any) => (u.u_type || u.role || '').toString().toLowerCase().includes('admin'));
        setAdmins(adminsList);
      } catch (e) {
        setAdmins([]);
      }
    })();
  }, []);

  const submit = async () => {
    setError(null); setSuccess(null);
    if (!form.s_name || form.s_name.trim() === '') {
      setError('El nombre de la estación es obligatorio');
      return;
    }
    if (!form.lat || String(form.lat).trim() === '' || Number.isNaN(Number(form.lat))) {
      setError('Latitud válida es obligatoria');
      return;
    }
    if (!form.lon || String(form.lon).trim() === '' || Number.isNaN(Number(form.lon))) {
      setError('Longitud válida es obligatoria');
      return;
    }
    setLoading(true);
    try {
      const payload: any = { s_name: form.s_name };
      payload.lat = Number(form.lat);
      payload.lon = Number(form.lon);
      if (form.institution_id && form.institution_id !== 'none') payload.institution_id = Number(form.institution_id);
      if (form.calibration_certificate) payload.calibration_certificate = form.calibration_certificate;
      // maintenance_date is set automatically by the server (NOW()) so we do not send it
      if (form.admin_id && form.admin_id !== 'none') payload.admin_id = Number(form.admin_id);
      if (form.s_state) payload.s_state = form.s_state;
      const resp = await api.post('/api/stations/', payload);
      // prefer common names for returned id
      const stationId = resp?.data?.station_id ?? resp?.data?.id ?? resp?.data?.stationId ?? null;
      setSuccess(stationId ? `Estación creada correctamente (ID: ${stationId})` : 'Estación creada correctamente');
      // notify other parts of the app and include the created id so a user can associate to it
      try {
        window.dispatchEvent(new CustomEvent('station:created', { detail: { station_id: stationId } }));
      } catch (ev) {
        // ignore in non-browser environments
      }
      setForm({ s_name: '', lat: '', lon: '', institution_id: 'none', calibration_certificate: '', admin_id: 'none', s_state: 'activo' });
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.response?.data || 'Error creando estación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">Creación de Estaciones</h2>
        <p className="text-sm text-gray-600">Crear nueva estación (solo administradores)</p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert variant="default"><AlertDescription>{success}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Formulario</CardTitle>
          <CardDescription>Ingrese datos básicos de la estación</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre de la Estación</Label>
              <Input value={form.s_name} onChange={(e: any) => setForm((p) => ({ ...p, s_name: e.target.value }))} />
            </div>
            <div>
              <Label>Institución (opcional)</Label>
              <Select value={form.institution_id} onValueChange={(v) => setForm((p) => ({ ...p, institution_id: v }))}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecciona institución (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin institución</SelectItem>
                  {institutions.map((i) => (
                    <SelectItem key={i.institution_id} value={String(i.institution_id)}>{i.i_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Latitud</Label>
              <Input value={form.lat} onChange={(e: any) => setForm((p) => ({ ...p, lat: e.target.value }))} placeholder="3.43722" />
            </div>
            <div>
              <Label>Longitud</Label>
              <Input value={form.lon} onChange={(e: any) => setForm((p) => ({ ...p, lon: e.target.value }))} placeholder="-76.5225" />
            </div>

            <div>
              <Label>Certificado de Calibración (opcional)</Label>
              <Input value={form.calibration_certificate} onChange={(e: any) => setForm((p) => ({ ...p, calibration_certificate: e.target.value }))} placeholder="Archivo/ID del certificado" />
            </div>
            

            <div>
              <Label>Responsable administrativo (opcional)</Label>
              <Select value={form.admin_id} onValueChange={(v) => setForm((p) => ({ ...p, admin_id: v }))}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecciona un administrador (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin responsable</SelectItem>
                  {admins.map((a: any) => (
                    <SelectItem key={a.id ?? a.user_id} value={String(a.id ?? a.user_id)}>{a.u_name} {a.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select value={form.s_state} onValueChange={(v) => setForm((p) => ({ ...p, s_state: v }))}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            <div className="mt-4 flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={loading} onClick={submit}>{loading ? 'Creando...' : 'Crear Estación'}</Button>
            <Button variant="ghost" onClick={() => { setForm({ s_name: '', lat: '', lon: '', institution_id: 'none', calibration_certificate: '', admin_id: 'none', s_state: 'activo' }); setError(null); setSuccess(null); }}>Limpiar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
