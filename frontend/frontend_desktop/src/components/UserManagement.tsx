import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

type PendingUser = {
  id: number;
  u_name: string;
  last_name: string;
  email?: string | null;
  u_type: string;
  validated: boolean;
  creation_date: string;
};

export function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [actionBusy, setActionBusy] = useState<number | null>(null);

  const loadPending = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await axios.get('http://127.0.0.1:8000/api/users/pending/');
      setUsers(resp.data?.results || []);
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo cargar la lista';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const approve = async (id: number) => {
    setActionBusy(id);
    setError('');
    try {
      await axios.post(`http://127.0.0.1:8000/api/users/approve/${id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo aprobar el usuario';
      setError(msg);
    } finally {
      setActionBusy(null);
    }
  };

  const reject = async (id: number) => {
    setActionBusy(id);
    setError('');
    try {
      await axios.post(`http://127.0.0.1:8000/api/users/reject/${id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo rechazar el usuario';
      setError(msg);
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
        <p className="text-sm text-gray-600">Usuarios pendientes de aprobación</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pendientes</CardTitle>
          <CardDescription>Aprueba o rechaza solicitudes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-600">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-gray-600">No hay usuarios pendientes.</div>
          ) : (
            <div className="divide-y">
              {users.map((u) => (
                <div key={u.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {u.u_name} {u.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {u.email || 'Sin correo'} • Rol: {u.u_type || 'N/D'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      disabled={actionBusy === u.id}
                      onClick={() => reject(u.id)}
                    >
                      {actionBusy === u.id ? 'Procesando...' : 'Rechazar'}
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      disabled={actionBusy === u.id}
                      onClick={() => approve(u.id)}
                    >
                      {actionBusy === u.id ? 'Procesando...' : 'Aceptar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
