import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface PendingApprovalProps {
  email: string;
  onBack: () => void;
}

export function PendingApproval({ email, onBack }: PendingApprovalProps) {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
  const api = axios.create({ baseURL: API_BASE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [validated, setValidated] = useState<boolean | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.get('/api/users/status/', { params: { email } });
      setValidated(!!resp.data?.validated);
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo consultar el estado';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [email]);

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Cuenta en revisión</CardTitle>
          <CardDescription>
            Verificaremos si ya fuiste aprobado por un administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="text-sm text-gray-700">
            <p>
              Usuario <span className="font-medium">{email}</span> está a la espera de su aprobación.
            </p>
            <p>
              Espera a que el administrador te valide o intenta más tarde.
            </p>
          </div>
          <div className="text-sm">
            {loading ? (
              <span className="text-gray-600">Consultando estado...</span>
            ) : validated ? (
              <span className="text-green-700">Tu cuenta ha sido validada. Vuelve al inicio para iniciar sesión.</span>
            ) : (
              <span className="text-gray-600">Aún en revisión.</span>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={fetchStatus} disabled={loading}>
              Reintentar
            </Button>
            <Button onClick={onBack}>
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
