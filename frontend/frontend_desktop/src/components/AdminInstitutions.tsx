import { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, Check, Eye, Settings, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

type Institution = {
  id: number;
  name: string;
  address: string;
  registeredDate: string;
  stationsCount: number;
  status: 'approved' | 'pending' | 'rejected' | string;
  raw: any;
};

export function AdminInstitutions() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
  const api = axios.create({ baseURL: API_BASE });
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadInstitutions = async () => {
    try {
      const resp = await api.get('/api/institutions/');
      const items: Institution[] = (resp.data || []).map((i: any) => ({
        id: i.institution_id,
        name: i.i_name,
        address: [i.street, i.neighborhood].filter(Boolean).join(', '),
        registeredDate: new Date().toISOString(),
        stationsCount: 0,
        status: i.validated ? 'approved' : 'pending',
        raw: i,
      }));
      setInstitutions(items);
    } catch (e) {
      console.error('Failed to load institutions', e);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-green-500">Aprobada</Badge>;
    if (status === 'pending') return <Badge className="bg-yellow-500">Pendiente</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-500">Rechazada</Badge>;
    return <Badge className="bg-gray-500">Desconocido</Badge>;
  };

  const handleApprove = async (institution: Institution) => {
    try {
      await api.post(`/api/institutions/approve/${institution.id}/`);
      setDialogOpen(false);
      loadInstitutions();
    } catch (e) {
      console.error('Approve institution failed', e);
    }
  };

  const handleReject = (institution: Institution) => {
    console.log('Rechazar institución:', institution);
    setDialogOpen(false);
  };

  const viewDetails = (institution: Institution) => {
    setSelectedInstitution(institution);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestión de Instituciones</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadInstitutions}>Refrescar</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutions.map((institution) => (
              <TableRow key={institution.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{institution.name}</TableCell>
                <TableCell>{institution.address}</TableCell>
                <TableCell>{getStatusBadge(institution.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(institution)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Detalles
                    </Button>
                    {institution.status === 'pending' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(institution)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Backdrop to improve readability when dialog is open */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl z-50">
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
            </div>
          )}

          <DialogFooter>
            {selectedInstitution?.status === 'pending' && selectedInstitution && (
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
                Configurar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
 
