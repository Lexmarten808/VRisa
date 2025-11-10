import { useState } from 'react';
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
import { stationRequests } from '../lib/mockData';

export function StationManagement() {
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = stationRequests.filter((station) => {
    const matchesStatus = filterStatus === 'all' || station.status === filterStatus;
    const matchesSearch =
      station.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.responsible.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.institution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Aprobada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rechazada</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>;
    }
  };

  const handleApprove = (station: any) => {
    console.log('Aprobar estación:', station);
    setDialogOpen(false);
    // Mostrar diálogo de credenciales
    setCredentialsDialogOpen(true);
  };

  const handleReject = (station: any) => {
    console.log('Rechazar estación:', station);
    setDialogOpen(false);
  };

  const viewDetails = (station: any) => {
    setSelectedStation(station);
    setDialogOpen(true);
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
          <h1>Gestión de Estaciones de Monitoreo</h1>
          <p className="text-gray-600">
            Administra las solicitudes y configuraciones de estaciones de tu institución
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{stationRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">
              {stationRequests.filter((s) => s.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-yellow-600">
              {stationRequests.filter((s) => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-blue-600">
              {stationRequests.filter((s) => s.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ubicación, responsable o institución..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Estaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Estaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ubicación</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Tipo de Sensor</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-semibold">{station.location}</div>
                        <div className="text-xs text-gray-500">{station.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{station.institution}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{station.sensorType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {station.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {station.variables.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{station.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{station.responsible}</TableCell>
                  <TableCell>{new Date(station.submittedDate).toLocaleDateString('es-CO')}</TableCell>
                  <TableCell>{getStatusBadge(station.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(station)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        {station.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStation(station);
                                handleApprove(station);
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Aprobar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStation(station);
                                handleReject(station);
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rechazar
                            </DropdownMenuItem>
                          </>
                        )}
                        {station.status === 'approved' && (
                          <DropdownMenuItem onClick={() => setCredentialsDialogOpen(true)}>
                            <Key className="h-4 w-4 mr-2" />
                            Ver Credenciales
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Documentos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalles */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Estación</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de estación de monitoreo
            </DialogDescription>
          </DialogHeader>

          {selectedStation && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Radio className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3>{selectedStation.location}</h3>
                  <p className="text-sm text-gray-600">{selectedStation.id}</p>
                </div>
                {getStatusBadge(selectedStation.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Institución</Label>
                  <p className="text-sm mt-1">{selectedStation.institution}</p>
                </div>
                <div>
                  <Label>Fecha de Solicitud</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedStation.submittedDate).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div>
                  <Label>Tipo de Sensor</Label>
                  <p className="text-sm mt-1">{selectedStation.sensorType}</p>
                </div>
                <div>
                  <Label>Responsable Técnico</Label>
                  <p className="text-sm mt-1">{selectedStation.responsible}</p>
                </div>
              </div>

              <div>
                <Label>Variables Monitoreadas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedStation.variables.map((variable: string) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Ubicación Exacta</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedStation.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Documentos Adjuntos</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm flex-1">Certificado_Calibracion_2024.pdf</span>
                    <Button variant="ghost" size="sm">
                      Descargar
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm flex-1">Especificaciones_Tecnicas.pdf</span>
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
        <DialogContent>
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
                  <Input
                    id="api-key"
                    value={generateCredentials().apiKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    Copiar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="secret">Secret Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="secret"
                    value={generateCredentials().secret}
                    readOnly
                    className="font-mono text-sm"
                    type="password"
                  />
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
              <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
{`{
  "station_id": "${selectedStation?.id || 'EST-XXX'}",
  "api_key": "${generateCredentials().apiKey}",
  "secret": "${generateCredentials().secret}",
  "endpoint": "https://api.vrisa.gov.co/v1/data",
  "interval": 300
}`}
              </pre>
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
