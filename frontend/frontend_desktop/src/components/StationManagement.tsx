import { useEffect, useMemo, useState } from 'react';
import {
  Radio,
  Check,
  X,
  Eye,
  MapPin,
  FileText,
  Key,
  MoreVertical,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import axios from 'axios';

export function StationManagement() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
  const api = useMemo(() => axios.create({ baseURL: API_BASE }), [API_BASE]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [stationAddress, setStationAddress] = useState<string | null>(null);
  const [directorName, setDirectorName] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userInfo, setUserInfo] = useState<{ name?: string; last_name?: string; user_id?: number } | null>(null);
  const [isInstitutionUser, setIsInstitutionUser] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [form, setForm] = useState({
    institution_id: '',
    s_name: '',
    lat: '',
    lon: '',
    sensor_type: '',
    variables: '',
    responsible: '',
    calibration_doc: '',
    maintenance_doc: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{ params: any; count: number } | null>(null);
  const [connectionForm, setConnectionForm] = useState<{ station_id: string; institution_id: string }>({ station_id: '', institution_id: '' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('vrisa_user_info');
      const info = raw ? JSON.parse(raw) : null;
      setUserInfo(info);
      const t = (info?.u_type || '').toLowerCase();
      setIsInstitutionUser(t === 'institution' || t === 'institucion');
    } catch {
      setUserInfo(null);
    }
  }, []);

  const userFullName = useMemo(() => {
    if (!userInfo) return '';
    const n = userInfo.name?.trim() || '';
    const l = userInfo.last_name?.trim() || '';
    return `${n} ${l}`.trim();
  }, [userInfo]);

  const loadInstitutions = async () => {
    try {
      const resp = await api.get('/api/institutions/');
      // Soportar respuesta paginada (results) o lista directa
      const items = Array.isArray(resp.data) ? resp.data : (resp.data?.results ?? []);
      setInstitutions(items);
    } catch (e) {
      console.error('No se pudieron cargar instituciones', e);
      setInstitutions([]);
    }
  };

  const loadStations = async () => {
    try {
      if (!userInfo?.user_id) return;
      let items: any[] = [];
      if (isInstitutionUser) {
        const resp = await api.get('/api/stations/', { params: { institution_admin: userInfo.user_id } });
        items = Array.isArray(resp.data) ? resp.data : (resp.data?.results ?? []);
        setDebugInfo({ params: { institution_admin: userInfo.user_id }, count: (items || []).length });
      } else {
        const resp = await api.get('/api/stations/', { params: { admin_id: userInfo.user_id } });
        items = Array.isArray(resp.data) ? resp.data : (resp.data?.results ?? []);
        setDebugInfo({ params: { admin_id: userInfo.user_id }, count: (items || []).length });
      }
      setStations(items || []);
    } catch (e) {
      console.error('No se pudieron cargar estaciones', e);
    }
  };

  const loadConnectionRequests = async () => {
    try {
      if (!userInfo?.user_id) return;
      let params: any = { request_status: 'pending' };
      if (isInstitutionUser) {
        params.requested_institution_admin = userInfo.user_id;
      } else {
        params.admin_id = userInfo.user_id;
      }
      const resp = await api.get('/api/stations/', { params });
      const items = Array.isArray(resp.data) ? resp.data : (resp.data?.results ?? []);
      setConnectionRequests(items || []);
    } catch (e) {
      console.error('No se pudieron cargar solicitudes de conexión', e);
      setConnectionRequests([]);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    loadStations();
    loadConnectionRequests();
  }, [userInfo?.user_id, isInstitutionUser]);

  const filteredStations = stations.filter((station) => {
    // Si es admin de estación, solo mostrar estaciones activas (approved/active)
    const state = station.s_state || station.status;
    const adminViewOk = !isInstitutionUser ? (state === 'active' || state === 'approved') : true;
    const matchesSearch =
      (station.s_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.institution?.i_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return adminViewOk && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'approved':
        return <Badge className="bg-green-500">Aprobada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rechazada</Badge>;
      case 'active':
      case 'activo':
        return <Badge className="bg-emerald-600">Activa</Badge>;
      case 'inactive':
      case 'inactivo':
        return <Badge className="bg-slate-600">Inactiva</Badge>;
      case 'mantenimiento':
      case 'maintenance':
        return <Badge className="bg-amber-600">Mantenimiento</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>;
    }
  };

  const submitConnectionRequest = async () => {
    if (!connectionForm.station_id || !connectionForm.institution_id) return;
    try {
      await api.post(`/api/stations/${connectionForm.station_id}/request_connection/`, {
        institution_id: connectionForm.institution_id,
        user_id: userInfo?.user_id,
      });
      setConnectionForm({ station_id: '', institution_id: '' });
      loadConnectionRequests();
      loadStations();
    } catch (e) {
      console.error('No se pudo enviar la solicitud', e);
    }
  };

  const approveConnectionRequest = async (stationId: number) => {
    try {
      // If the current user is institution admin, approve assigning this station to their institution.
      let institution_id = undefined;
      if (isInstitutionUser) {
        const myInst = institutions.find((i: any) => Number(i.admin_id) === Number(userInfo?.user_id));
        institution_id = myInst?.institution_id;
      }
      await api.post(`/api/stations/${stationId}/approve_connection/`, { admin_id: userInfo?.user_id, institution_id });
      // Remove approved request locally so it disappears immediately
      setConnectionRequests((prev) => (prev || []).filter((r) => Number(r.station_id) !== Number(stationId)));
      // Refresh stations listing to reflect the new assignment/state
      await loadStations();
    } catch (e) {
      console.error('No se pudo aprobar la solicitud', e);
    }
  };

  const rejectConnectionRequest = async (stationId: number) => {
    try {
      await api.post(`/api/stations/${stationId}/reject_connection/`, { admin_id: userInfo?.user_id });
      loadConnectionRequests();
      loadStations();
    } catch (e) {
      console.error('No se pudo rechazar la solicitud', e);
    }
  };

  const handleApprove = async (station: any) => {
    try {
      const resp = await api.post(`/api/station-requests/${station.request_id}/approve/`, {
        decider_id: userInfo?.user_id,
      });
      setDialogOpen(false);
      // Mostrar credenciales
      setSelectedStation({ ...station, _credentials: resp.data?.credentials });
      setCredentialsDialogOpen(true);
      loadRequests();
    } catch (e) {
      console.error('Error al aprobar', e);
    }
  };

  const handleReject = async (station: any) => {
    try {
      await api.post(`/api/station-requests/${station.request_id}/reject/`, {
        decider_id: userInfo?.user_id,
      });
      setDialogOpen(false);
      loadRequests();
    } catch (e) {
      console.error('Error al rechazar', e);
    }
  };

  const viewDetails = (station: any) => {
    setSelectedStation(station);
    setDialogOpen(true);
    // Fetch computed address for the station (institution address or lat/lon fallback)
    (async () => {
      try {
        const resp = await api.get(`/api/stations/${station.station_id}/address/`);
        setStationAddress(resp.data?.address || null);
      } catch (e) {
        setStationAddress(null);
      }
      // Fetch director (station admin) name if available
      try {
        const adminId = station?.admin_id?.id || station?.admin_id;
        if (adminId) {
          const r2 = await api.get(`/api/users/detail/${adminId}/`);
          const d = r2.data;
          setDirectorName(`${d.u_name || ''} ${d.last_name || ''}`.trim() || null);
        } else {
          setDirectorName(null);
        }
      } catch (e) {
        setDirectorName(null);
      }
    })();
  };

  const generateCredentials = () => {
    const apiKey = 'VRISA_' + Math.random().toString(36).substr(2, 16).toUpperCase();
    const secret = Math.random().toString(36).substr(2, 32);
    return { apiKey, secret };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Estaciones de Monitoreo</h1>
          <p className="text-gray-600">
            Administra las solicitudes y configuraciones de estaciones de tu institución
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Estaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{stations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">
              {stations.filter((s) => (s.s_state || s.status) === 'active' || (s.s_state || s.status) === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-yellow-600">
              {stations.filter((s) => (s.s_state || s.status) === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-blue-600">
              {stations.filter((s) => (s.s_state || s.status) === 'approved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* El admin de estación ya no crea solicitudes: solo ve las que administra. */}

      {/* Search removed from here and placed above stations list */}

      {/* Solicitudes de conexión */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de conexión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isInstitutionUser && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label>Estación</Label>
                <Select
                  value={connectionForm.station_id}
                  onValueChange={(val) => setConnectionForm((p) => ({ ...p, station_id: val }))}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Selecciona estación" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations
                      .filter((s) => s.admin_id === userInfo?.user_id)
                      .map((s) => (
                        <SelectItem key={s.station_id} value={String(s.station_id)}>
                          {s.s_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Institución destino</Label>
                <Select
                  value={connectionForm.institution_id}
                  onValueChange={(val) => setConnectionForm((p) => ({ ...p, institution_id: val }))}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Selecciona institución" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((i) => (
                      <SelectItem key={i.institution_id} value={String(i.institution_id)}>
                        {i.i_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button className="mt-6" onClick={submitConnectionRequest} disabled={!connectionForm.station_id || !connectionForm.institution_id}>
                  Enviar solicitud
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectionRequests.length === 0 && (
              <div className="col-span-full text-sm text-gray-500 text-center py-4">No hay solicitudes de conexión pendientes.</div>
            )}
            {connectionRequests.map((req) => (
              <div key={req.station_id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{req.s_name}</div>
                    <div className="text-xs text-gray-500">EST-{req.station_id}</div>
                  </div>
                  <Badge variant="secondary">Pendiente</Badge>
                </div>
                {/* Campos eliminados: institución solicitada y solicitado por (se mantienen fuera de la UI cuando no hay columnas) */}
                {isInstitutionUser ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveConnectionRequest(req.station_id)}>Aprobar</Button>
                    <Button size="sm" variant="outline" onClick={() => rejectConnectionRequest(req.station_id)}>Rechazar</Button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">En espera de aprobación</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-4">
        {debugInfo && (
          <div className="mb-2 p-2 rounded border text-xs text-gray-700 bg-gray-50">
            <div>Filtro usado: {JSON.stringify(debugInfo.params)}</div>
            <div>Estaciones encontradas: {debugInfo.count}</div>
          </div>
        )}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por ubicación, responsable o institución..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Listado de Estaciones */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle>Estaciones</CardTitle>
            <p className="text-sm text-gray-500">Listado de estaciones que administra tu rol</p>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStations.length === 0 ? (
            <div className="rounded border border-dashed p-6 text-center text-sm text-gray-500 bg-gray-50">
              No hay estaciones para mostrar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredStations.map((station) => (
                <div
                  key={station.station_id || station.request_id}
                  className="rounded-lg border bg-white shadow-sm p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <h3 className="font-semibold leading-tight">{station.s_name}</h3>
                      </div>
                      <p className="text-xs text-gray-500">EST-{station.station_id || '—'}</p>
                    </div>
                    <div>{getStatusBadge(station.s_state || station.status)}</div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {station.institution?.i_name || station.institution || 'Sin institución'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Estado:</span>
                      <span>{station.s_state || station.status || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Ubicación:</span>
                      <span>{`${station.lat ?? '—'}, ${station.lon ?? '—'}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button variant="ghost" size="sm" onClick={() => viewDetails(station)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </Button>

                    {(station.s_state === 'active' || station.status === 'approved') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStation(station);
                          setCredentialsDialogOpen(true);
                        }}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Credenciales
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalles */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Detalles de la Estación</DialogTitle>
            <DialogDescription>
              Información completa sobre la estación
            </DialogDescription>
          </DialogHeader>

          {selectedStation && (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Radio className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3>{selectedStation.s_name}</h3>
                  </div>
                  {getStatusBadge(selectedStation.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Institución</Label>
                    <p className="text-sm mt-1">{selectedStation.institution?.i_name || selectedStation.institution}</p>
                  </div>
                <div>
                  <Label>Director Técnico</Label>
                  <p className="text-sm mt-1">{directorName || selectedStation.responsible || 'No disponible'}</p>
                </div>
              </div>

              {/* Variables and sensor type removed per request */}

              <div>
                <Label>Ubicación Exacta</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{stationAddress || selectedStation.location || 'No disponible'}</span>
                    </div>
                  </div>
              </div>

              <div>
                <Label>Documentos Adjuntos</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm flex-1">{selectedStation.calibration_doc || 'N/A'}</span>
                    <Button variant="ghost" size="sm">
                      Descargar
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm flex-1">{selectedStation.maintenance_doc || 'N/A'}</span>
                    <Button variant="ghost" size="sm">
                      Descargar
                    </Button>
                  </div>
                </div>
              </div>

              {selectedStation.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="review-notes">Notas de Revisión</Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Agrega comentarios o razones para la decisión..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedStation?.status === 'pending' && (
              <>
                <Button variant="outline" onClick={() => handleReject(selectedStation)}>
                  <X className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button onClick={() => handleApprove(selectedStation)}>
                  <Check className="h-4 w-4 mr-2" />
                  Aprobar Estación
                </Button>
              </>
            )}
            {selectedStation?.status === 'approved' && (
              <Button onClick={() => setCredentialsDialogOpen(true)}>
                <Key className="h-4 w-4 mr-2" />
                Ver Credenciales
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Credenciales */}
      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Credenciales de la Estación</DialogTitle>
            <DialogDescription>
              Credenciales seguras para la conexión del dispositivo de monitoreo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <Check className="h-5 w-5" />
                <span className="font-semibold">Estación Aprobada</span>
              </div>
              <p className="text-sm text-green-700">
                Las siguientes credenciales han sido generadas para esta estación. Guárdalas de
                forma segura.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="api-key" value={selectedStation?._credentials?.api_key || ''} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="sm">
                    Copiar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="secret">Secret Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="secret" value={selectedStation?._credentials?.secret || ''} readOnly className="font-mono text-sm" type="password" />
                  <Button variant="outline" size="sm">
                    Copiar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="endpoint">Endpoint de API</Label>
                <Input
                  id="endpoint"
                  value="https://api.vrisa.gov.co/v1/data"
                  readOnly
                  className="font-mono text-sm mt-1"
                />
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Estas credenciales solo se muestran una vez. Asegúrate
                de guardarlas en un lugar seguro antes de cerrar esta ventana.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ejemplo de Configuración</Label>
              <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">{`{
  "station_id": "${selectedStation?._credentials?.station || 'EST-XXX'}",
  "api_key": "${selectedStation?._credentials?.api_key || ''}",
  "secret": "${selectedStation?._credentials?.secret || ''}",
  "endpoint": "https://api.vrisa.gov.co/v1/data",
  "interval": 300
}`}</pre>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCredentialsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
