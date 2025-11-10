import { useState } from 'react';
import {
  Building2,
  Check,
  X,
  Eye,
  MoreVertical,
  Search,
  Filter,
  UserCheck,
  Settings,
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
import { institutions } from '../lib/mockData';

export function AdminInstitutions() {
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesStatus = filterStatus === 'all' || inst.status === filterStatus;
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.address.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleApprove = (institution: any) => {
    console.log('Aprobar institución:', institution);
    setDialogOpen(false);
  };

  const handleReject = (institution: any) => {
    console.log('Rechazar institución:', institution);
    setDialogOpen(false);
  };

  const viewDetails = (institution: any) => {
    setSelectedInstitution(institution);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestión de Instituciones</h1>
          <p className="text-gray-600">
            Administra las instituciones registradas en la plataforma VRISA
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Instituciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{institutions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">
              {institutions.filter((i) => i.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-yellow-600">
              {institutions.filter((i) => i.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Estaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {institutions.reduce((sum, inst) => sum + inst.stationsCount, 0)}
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
                  placeholder="Buscar por nombre o dirección..."
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

      {/* Tabla de Instituciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Instituciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institución</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Estaciones</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{institution.name}</div>
                        <div className="text-sm text-gray-500">{institution.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{institution.address}</TableCell>
                  <TableCell>{new Date(institution.registeredDate).toLocaleDateString('es-CO')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{institution.stationsCount} estaciones</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(institution.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(institution)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        {institution.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInstitution(institution);
                                handleApprove(institution);
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Aprobar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInstitution(institution);
                                handleReject(institution);
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rechazar
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Gestionar Roles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configuración
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Institución</DialogTitle>
            <DialogDescription>
              Información completa y opciones de gestión
            </DialogDescription>
          </DialogHeader>

          {selectedInstitution && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3>{selectedInstitution.name}</h3>
                  <p className="text-sm text-gray-600">{selectedInstitution.id}</p>
                </div>
                {getStatusBadge(selectedInstitution.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dirección</Label>
                  <p className="text-sm mt-1">{selectedInstitution.address}</p>
                </div>
                <div>
                  <Label>Fecha de Registro</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedInstitution.registeredDate).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div>
                  <Label>Estaciones Registradas</Label>
                  <p className="text-sm mt-1">{selectedInstitution.stationsCount} estaciones</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <p className="text-sm mt-1">
                    {selectedInstitution.status === 'approved'
                      ? 'Aprobada'
                      : selectedInstitution.status === 'pending'
                      ? 'Pendiente de Aprobación'
                      : 'Rechazada'}
                  </p>
                </div>
              </div>

              {selectedInstitution.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="review-notes">Notas de Revisión</Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Agrega comentarios o razones para la decisión..."
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Permisos y Roles</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-view" defaultChecked />
                    <Label htmlFor="perm-view" className="cursor-pointer">
                      Ver datos públicos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-manage" defaultChecked />
                    <Label htmlFor="perm-manage" className="cursor-pointer">
                      Gestionar estaciones
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-export" />
                    <Label htmlFor="perm-export" className="cursor-pointer">
                      Exportar reportes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-branding" />
                    <Label htmlFor="perm-branding" className="cursor-pointer">
                      Personalización visual
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedInstitution?.status === 'pending' && (
              <>
                <Button variant="outline" onClick={() => handleReject(selectedInstitution)}>
                  <X className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button onClick={() => handleApprove(selectedInstitution)}>
                  <Check className="h-4 w-4 mr-2" />
                  Aprobar Institución
                </Button>
              </>
            )}
            {selectedInstitution?.status === 'approved' && (
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Actualizar Configuración
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
