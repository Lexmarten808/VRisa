import axios from 'axios';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building2, Radio, Info } from 'lucide-react';




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
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationType, setRegistrationType] = useState<'institution' | 'station' | 'user'>('user');
  const [regError, setRegError] = useState<string>('');
  const [regLoading, setRegLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const emailInput = loginEmail.trim();
    const passwordInput = loginPassword;
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
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
      alert(error.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    const u_name = (document.getElementById('reg-first-name') as HTMLInputElement)?.value;
    const last_name = (document.getElementById('reg-last-name') as HTMLInputElement)?.value;
    const email = (document.getElementById('reg-email') as HTMLInputElement)?.value;
    const phone = (document.getElementById('reg-phone') as HTMLInputElement)?.value;
    const u_password = (document.getElementById('reg-password') as HTMLInputElement)?.value;
    try {
      await axios.post('http://127.0.0.1:8000/api/users/register/', {
        u_name, last_name, u_password, email, phone, u_type: 'regular'
      });
      // Auto-login right after successful registration
      const loginResp = await axios.post('http://127.0.0.1:8000/api/users/login/', {
        identifier: email,
        password: u_password
      });
      onLogin({
        u_type: loginResp.data.u_type,
        user_id: loginResp.data.user_id,
        name: loginResp.data.name,
        last_name: loginResp.data.last_name,
        email
      });
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'No se pudo crear la cuenta';
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
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>

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
                  onClick={() => setIsRegistering(true)}
                >
                  Registrar Nueva Institución o Estación
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
        ) : (
          /* Formularios de Registro */
          <Card>
            <CardHeader>
              <CardTitle>Registro</CardTitle>
              <CardDescription>
                Registra tu institución o estación de monitoreo en la plataforma VRISA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={registrationType} onValueChange={(v) => setRegistrationType(v as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="user">
                    Crear Usuario
                  </TabsTrigger>
                  <TabsTrigger value="institution">
                    <Building2 className="h-4 w-4 mr-2" />
                    Institución
                  </TabsTrigger>
                  <TabsTrigger value="station">
                    <Radio className="h-4 w-4 mr-2" />
                    Estación de Monitoreo
                  </TabsTrigger>
                </TabsList>

                {/* Registro de Usuario Simple (conexión Django) */}
                <TabsContent value="user" className="space-y-4">
                  {regError && (
                    <Alert variant="destructive">
                      <AlertDescription>{regError}</AlertDescription>
                    </Alert>
                  )}
                  <form className="space-y-4" onSubmit={handleUserRegister}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-first-name">Nombre *</Label>
                        <Input id="reg-first-name" placeholder="Juan" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-last-name">Apellido *</Label>
                        <Input id="reg-last-name" placeholder="Pérez" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Correo *</Label>
                        <Input id="reg-email" type="email" placeholder="usuario@correo.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-phone">Teléfono</Label>
                        <Input id="reg-phone" type="tel" placeholder="300 123 4567" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Contraseña *</Label>
                      <Input id="reg-password" type="password" placeholder="••••••••" required />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={regLoading} className="flex-1">
                        {regLoading ? 'Creando...' : 'Crear cuenta'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsRegistering(false)} disabled={regLoading}>Volver a iniciar sesión</Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="institution" className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      El registro de instituciones debe ser validado por el administrador del
                      sistema antes de obtener acceso completo.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inst-name">Nombre Oficial de la Institución *</Label>
                      <Input id="inst-name" placeholder="Universidad del Valle" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-email">Correo Electrónico Institucional *</Label>
                      <Input id="inst-email" type="email" placeholder="contacto@inst.edu.co" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inst-address">Dirección Física *</Label>
                    <Input id="inst-address" placeholder="Calle 13 # 100-00, Cali" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inst-phone">Teléfono de Contacto</Label>
                      <Input id="inst-phone" type="tel" placeholder="+57 2 123 4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-website">Sitio Web</Label>
                      <Input id="inst-website" type="url" placeholder="https://www.institucion.edu.co" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inst-logo">Logo de la Institución (URL o archivo)</Label>
                    <Input id="inst-logo" type="file" accept="image/*" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inst-primary-color">Color Primario (Hexadecimal)</Label>
                      <div className="flex gap-2">
                        <Input id="inst-primary-color" placeholder="#0066CC" />
                        <Input type="color" className="w-16" defaultValue="#0066CC" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-secondary-color">Color Secundario (Hexadecimal)</Label>
                      <div className="flex gap-2">
                        <Input id="inst-secondary-color" placeholder="#00AA00" />
                        <Input type="color" className="w-16" defaultValue="#00AA00" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inst-description">Descripción de la Institución</Label>
                    <Textarea
                      id="inst-description"
                      placeholder="Breve descripción de la institución y su interés en el monitoreo ambiental..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Nombre del Administrador *</Label>
                      <Input id="admin-name" placeholder="Juan Pérez" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-position">Cargo *</Label>
                      <Input id="admin-position" placeholder="Director de Sostenibilidad" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Correo del Administrador *</Label>
                      <Input id="admin-email" type="email" placeholder="admin@inst.edu.co" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Contraseña *</Label>
                      <Input id="admin-password" type="password" placeholder="••••••••" required />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" className="flex-1">
                      Enviar Solicitud de Registro
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRegistering(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="station" className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      El registro de estaciones debe ser aprobado por la institución asociada antes
                      de activarse en la plataforma.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="station-name">Nombre de la Estación *</Label>
                    <Input id="station-name" placeholder="Estación Centro" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="station-institution">Institución Asociada *</Label>
                    <Select required>
                      <SelectTrigger id="station-institution">
                        <SelectValue placeholder="Seleccionar institución" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="univalle">Universidad del Valle</SelectItem>
                        <SelectItem value="dagma">DAGMA</SelectItem>
                        <SelectItem value="cvc">CVC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="station-lat">Latitud *</Label>
                      <Input id="station-lat" placeholder="3.4516" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="station-lng">Longitud *</Label>
                      <Input id="station-lng" placeholder="-76.5320" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="station-address">Dirección *</Label>
                    <Input id="station-address" placeholder="Carrera 100 # 13-00, Cali" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="station-sensor">Tipo de Sensor *</Label>
                      <Select required>
                        <SelectTrigger id="station-sensor">
                          <SelectValue placeholder="Seleccionar sensor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bam1020">BAM-1020 (PM2.5/PM10)</SelectItem>
                          <SelectItem value="teledyne">Teledyne T400 (Gases)</SelectItem>
                          <SelectItem value="combined">Combinado (PM + Gases)</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="station-frequency">Frecuencia de Medición</Label>
                      <Select>
                        <SelectTrigger id="station-frequency">
                          <SelectValue placeholder="Seleccionar frecuencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1min">Cada minuto</SelectItem>
                          <SelectItem value="5min">Cada 5 minutos</SelectItem>
                          <SelectItem value="15min">Cada 15 minutos</SelectItem>
                          <SelectItem value="1hour">Cada hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Variables Monitoreadas *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['PM2.5', 'PM10', 'SO2', 'NO2', 'O3', 'CO', 'Temperatura', 'Humedad', 'Viento'].map(
                        (variable) => (
                          <div key={variable} className="flex items-center space-x-2">
                            <input type="checkbox" id={`var-${variable}`} className="rounded" />
                            <Label htmlFor={`var-${variable}`} className="cursor-pointer">
                              {variable}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="station-responsible">Responsable Técnico *</Label>
                      <Input id="station-responsible" placeholder="Dr. María González" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="station-contact">Contacto *</Label>
                      <Input
                        id="station-contact"
                        type="email"
                        placeholder="responsable@inst.edu.co"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="station-certificates">Certificados de Calibración</Label>
                    <Input id="station-certificates" type="file" accept=".pdf,.doc,.docx" multiple />
                    <p className="text-xs text-gray-500">
                      Carga los certificados de calibración y documentación técnica del equipo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="station-notes">Notas Adicionales</Label>
                    <Textarea
                      id="station-notes"
                      placeholder="Información adicional sobre la estación, ubicación específica, condiciones especiales..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" className="flex-1">
                      Enviar Solicitud de Estación
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRegistering(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
