import axios from 'axios';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Radio } from 'lucide-react';
import { PendingApproval } from './PendingApproval';




interface LoginPayload {
  u_type: string;
  user_id?: number;
  name?: string;
  last_name?: string;
  email?: string;
}
interface LoginProps {
  onLogin: (payload: LoginPayload) => void;
}


export function Login({ onLogin }: LoginProps) {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';
  const api = axios.create({ baseURL: API_BASE });
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string>('');
  const [regLoading, setRegLoading] = useState(false);
  const [regMode, setRegMode] = useState<'user' | 'institution'>('user');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string>('');
  const [pendingView, setPendingView] = useState(false);
  // Registration controlled state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'ciudadano' | 'administrador_estacion'>('ciudadano');
  const [regStationId, setRegStationId] = useState('');
  // Institution registration
  const [instName, setInstName] = useState('');
  const [instStreet, setInstStreet] = useState('');
  const [instNeighborhood, setInstNeighborhood] = useState('');
  const [instColorSet, setInstColorSet] = useState('');
  const [instLogoName, setInstLogoName] = useState('');
  const [instAdminEmail, setInstAdminEmail] = useState('');
  const [instAdminPassword, setInstAdminPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const emailInput = loginEmail.trim();
    const passwordInput = loginPassword;
    try {
      const response = await api.post('/api/users/login/', {
        identifier: emailInput,
        password: passwordInput,
      });
      onLogin({
        u_type: response.data.u_type,
        user_id: response.data.user_id,
        name: response.data.name,
        last_name: response.data.last_name,
        email: emailInput
      });
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Error al iniciar sesión';
      if (error?.response?.status === 403 && typeof msg === 'string' && msg.toLowerCase().includes('no ha sido validado')) {
        setPendingView(true);
      } else {
        setLoginError(msg);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);
    const u_name = regFirstName.trim();
    const last_name = regLastName.trim();
    const email = regEmail.trim();
    const phone = regPhone.trim();
    const u_password = regPassword;
    // send u_type expected by backend: 'regular' or 'station_admin'
    const u_type = regRole === 'ciudadano' ? 'regular' : 'station_admin';
    try {
      const resp = await api.post('/api/users/register/', {
        u_name, last_name, u_password, email, phone, u_type, station_id: regRole === 'administrador_estacion' ? regStationId.trim() : undefined
      });
      // show backend message instead of auto-login (user must be validated)
      const message = resp?.data?.message || 'Usuario registrado correctamente, espere validación';
      setRegSuccess(message + (resp?.data?.station_assignment ? ` — ${resp.data.station_assignment.assigned ? 'Estación asociada' : resp.data.station_assignment.reason}` : ''));
      // clear form (keep user on registration view so they see the message)
      setRegFirstName(''); setRegLastName(''); setRegEmail(''); setRegPhone(''); setRegPassword(''); setRegStationId('');
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'No se pudo crear la cuenta';
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  const handleInstitutionRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      // Endpoint atómico: crea usuario + institución
      await api.post('/api/institutions/register_with_user/', {
        i_name: instName.trim(),
        street: instStreet.trim() || null,
        neighborhood: instNeighborhood.trim() || null,
        color_set: instColorSet.trim() || null,
        logo: instLogoName || null,
        email: instAdminEmail,
        password: instAdminPassword
      });
      // Nota: Login inmediato puede estar bloqueado por validación; omitimos autologin
      // Reset
      setIsRegistering(false);
      setRegMode('user');
      setInstName('');
      setInstStreet('');
      setInstNeighborhood('');
      setInstColorSet('');
      setInstLogoName('');
      setInstAdminEmail('');
      setInstAdminPassword('');
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'No se pudo registrar la institución';
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Radio className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-blue-900">VRISA</h1>
          <p className="text-gray-600">
            Vigilancia de Riesgos e Inmisiones de Sustancias Atmosféricas
          </p>
          <p className="text-sm text-gray-500 mt-1">Monitoreo de Calidad del Aire - Cali, Colombia</p>
        </div>

        {!isRegistering ? (
          /* Formulario de Login */
          <div className="max-w-md mx-auto">
            {pendingView ? (
              <PendingApproval email={loginEmail} onBack={() => { setPendingView(false); setLoginError(''); }} />
            ) : (
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>

                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Iniciar Sesión
                </Button>
                <div className="text-center text-sm">
                  <a href="#" className="text-blue-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => { setRegMode('user'); setIsRegistering(true); }}
                >
                  Registrarme
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => onLogin({ u_type: 'public' })}
                >
                  Continuar como Visitante
                </Button>
              </form>
            </CardContent>
          </Card>
            )}
          </div>
        ) : (
          /* Formularios de Registro */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{regMode === 'user' ? 'Registrarme' : 'Registrar Institución'}</CardTitle>
                  <CardDescription>
                    {regMode === 'user'
                      ? 'Crea tu cuenta en VRISA. Si eres administrador de estación, proporciona la ID de la estación.'
                      : 'Solicita el registro de tu institución. Será validada por el administrador.'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant={regMode === 'user' ? 'default' : 'outline'} size="sm" onClick={() => setRegMode('user')}>Usuario</Button>
                  <Button variant={regMode === 'institution' ? 'default' : 'outline'} size="sm" onClick={() => setRegMode('institution')}>Institución</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {regError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{regError}</AlertDescription>
                </Alert>
              )}
              {regSuccess && (
                <Alert className="mb-4">
                  <AlertDescription>{regSuccess}</AlertDescription>
                </Alert>
              )}
              {regMode === 'user' ? (
              <form className="space-y-4" onSubmit={handleUserRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-first-name">Nombre *</Label>
                    <Input id="reg-first-name" placeholder="Juan" required value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-last-name">Apellido *</Label>
                    <Input id="reg-last-name" placeholder="Pérez" required value={regLastName} onChange={(e) => setRegLastName(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Correo *</Label>
                    <Input id="reg-email" type="email" placeholder="usuario@correo.com" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Teléfono</Label>
                    <Input id="reg-phone" type="tel" placeholder="300 123 4567" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña *</Label>
                  <Input id="reg-password" type="password" placeholder="••••••••" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rol *</Label>
                    <Select value={regRole} onValueChange={(v) => setRegRole(v as any)}>
                      <SelectTrigger id="reg-role">
                        <SelectValue placeholder="Selecciona tu rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ciudadano">Ciudadano</SelectItem>
                        <SelectItem value="administrador_estacion">Administrador de Estación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {regRole === 'administrador_estacion' && (
                    <div className="space-y-2">
                      <Label htmlFor="reg-station-id">ID de la Estación *</Label>
                      <Input id="reg-station-id" placeholder="Ej: 12" value={regStationId} onChange={(e) => setRegStationId(e.target.value)} required />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={regLoading} className="flex-1">
                    {regLoading ? 'Creando...' : 'Crear cuenta'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsRegistering(false)} disabled={regLoading}>Volver a iniciar sesión</Button>
                </div>
              </form>
              ) : (
              <form className="space-y-4" onSubmit={handleInstitutionRegister}>
                <div className="space-y-2">
                  <Label htmlFor="inst-name">Nombre de la Institución *</Label>
                  <Input id="inst-name" placeholder="Universidad del Valle" required value={instName} onChange={(e) => setInstName(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inst-street">Dirección</Label>
                    <Input id="inst-street" placeholder="Calle 13 #100" value={instStreet} onChange={(e) => setInstStreet(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inst-neighborhood">Barrio</Label>
                    <Input id="inst-neighborhood" placeholder="Ciudad Universitaria" value={instNeighborhood} onChange={(e) => setInstNeighborhood(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inst-colorset">Conjunto de Colores</Label>
                  <Input id="inst-colorset" placeholder="red-white" value={instColorSet} onChange={(e) => setInstColorSet(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inst-logo">Logo (imagen)</Label>
                  <Input
                    id="inst-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setInstLogoName(file ? file.name : '');
                    }}
                  />
                  {instLogoName && (
                    <p className="text-xs text-gray-600">Archivo seleccionado: {instLogoName}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inst-admin-email">Email de la Institución *</Label>
                    <Input id="inst-admin-email" type="email" placeholder="admin@institucion.com" required value={instAdminEmail} onChange={(e) => setInstAdminEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inst-admin-password">Contraseña *</Label>
                    <Input id="inst-admin-password" type="password" placeholder="••••••••" required value={instAdminPassword} onChange={(e) => setInstAdminPassword(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={regLoading} className="flex-1">
                    {regLoading ? 'Enviando...' : 'Enviar solicitud'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsRegistering(false)} disabled={regLoading}>Volver a iniciar sesión</Button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
