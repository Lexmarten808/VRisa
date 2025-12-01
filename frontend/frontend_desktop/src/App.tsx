import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Radio,
  FileText,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { useEffect } from 'react';
import { applyInstitutionTheme, clearInstitutionTheme, loadInstitutionThemeFromStorage, paletteFromColorSet } from './lib/theme';
import { AdminInstitutions } from './components/AdminInstitutions';
import { StationManagement } from './components/StationManagement';
import { Reports } from './components/Reports';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';

type View = 'dashboard' | 'institutions' | 'stations' | 'reports';
type UserType = 'public' | 'institution' | 'admin' | null;
interface UserInfo {
  user_id?: number;
  name?: string;
  last_name?: string;
  email?: string;
  u_type?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [userType, setUserType] = useState<UserType>(() => {
    try {
      const t = localStorage.getItem('vrisa_user_type');
      return (t as UserType) || null;
    } catch {
      return null;
    }
  });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const raw = localStorage.getItem('vrisa_user_info');
      return raw ? (JSON.parse(raw) as UserInfo) : null;
    } catch {
      return null;
    }
  });
  const [institutionColorSet, setInstitutionColorSet] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Force clean re-render cycles on auth/state changes
  const [appKey, setAppKey] = useState<number>(Date.now());
  // Simple profile submenu toggle
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Defensive: accept either a payload object or a plain string user type
  const handleLogin = (payload: { u_type: string; user_id?: number; name?: string; last_name?: string; email?: string } | string) => {
    // Normalizar tipos que vienen del backend (regular, invitado, super_admin, etc.)
    const normalized = (() => {
      const t = (typeof payload === 'string' ? payload : (payload.u_type || '')).toLowerCase();
      if (['public', 'regular', 'invitado', 'visitor'].includes(t)) return 'public';
      if (['institution', 'institucion', 'org'].includes(t)) return 'institution';
      if (['admin', 'super_admin', 'administrator'].includes(t)) return 'admin';
      return 'public';
    })();
    setUserType(normalized as UserType);
    // Persist for refresh
    localStorage.setItem('vrisa_user_type', normalized);
    // Store user info
    const p = typeof payload === 'string' ? { u_type: payload } : payload;
    const info: UserInfo = {
      user_id: p.user_id,
      name: p.name,
      last_name: p.last_name,
      email: p.email,
      u_type: p.u_type
    };
    setUserInfo(info);
    localStorage.setItem('vrisa_user_info', JSON.stringify(info));
    setCurrentView('dashboard');
    setSidebarOpen(false);
    // bump key to force a clean re-render of subtree
    setAppKey(Date.now());
    console.log('Login success:', { normalized, info });
    // If the user belongs to an institution (by type), try to apply a theme.
    // Later, when linking user->station from backend, pass color_set explicitly.
    if (normalized === 'institution') {
      // Fallback: infer from email domain or default sample mapping
      const inferredColorSet = 'red-white';
      setInstitutionColorSet(inferredColorSet);
      const palette = paletteFromColorSet(inferredColorSet);
      if (palette) applyInstitutionTheme(palette);
    } else {
      clearInstitutionTheme();
      setInstitutionColorSet(null);
    }
  };

  const handleLogout = () => {
    setUserType(null);
    setCurrentView('dashboard');
    localStorage.removeItem('vrisa_user_type');
    localStorage.removeItem('vrisa_user_info');
    setSidebarOpen(false);
    clearInstitutionTheme();
    // bump key to force a clean re-render of subtree
    setAppKey(Date.now());
  };

  // Nota: evitamos returns condicionales antes de hooks para mantener el orden

  const menuItems = [
    {
      id: 'dashboard' as View,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['public', 'institution', 'admin'],
    },
    {
      id: 'institutions' as View,
      label: 'Gestión de Instituciones',
      icon: Building2,
      roles: ['admin'],
    },
    {
      id: 'stations' as View,
      label: 'Gestión de Estaciones',
      icon: Radio,
      roles: ['institution', 'admin'],
    },
    {
      id: 'reports' as View,
      label: 'Reportes Detallados',
      icon: FileText,
      roles: ['public', 'institution', 'admin'],
    },
  ];

  // Filtrar elementos según el tipo de usuario (comportamiento original)
  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userType || 'public'));

  const getUserLabel = () => {
    if (userInfo?.name) {
      return `${userInfo.name}${userInfo.last_name ? ' ' + userInfo.last_name : ''}`;
    }
    switch (userType) {
      case 'admin': return 'Administrador del Sistema';
      case 'institution': return 'Institución';
      case 'public': return 'Usuario Visitante';
      default: return 'Usuario';
    }
  };

  const getUserInitials = () => {
    if (userInfo?.name) {
      const first = userInfo.name.charAt(0).toUpperCase();
      const second = userInfo.last_name ? userInfo.last_name.charAt(0).toUpperCase() : '';
      return (first + second) || 'U';
    }
    switch (userType) {
      case 'admin': return 'AS';
      case 'institution': return 'IN';
      case 'public': return 'PU';
      default: return 'U';
    }
  };

  // Load theme from storage on mount
  useEffect(() => {
    loadInstitutionThemeFromStorage();
  }, []);

  // Fallback dashboard rendering handled within main return to avoid conditional returns

  // Expose a helper to set institution theme when a station is linked
  const setThemeForInstitution = (colorSet?: string) => {
    const palette = paletteFromColorSet(colorSet);
    if (palette) {
      applyInstitutionTheme(palette);
      setInstitutionColorSet(palette.name || null);
    }
  };

  return (
    <div key={appKey} className="min-h-screen bg-gray-50">
      {userType === null ? (
        <div className="min-h-screen p-6">
          <Login onLogin={handleLogin} />
        </div>
      ) : (
        <>
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-blue-900">VRISA</h2>
                <p className="text-xs text-gray-600">Calidad del Aire - Cali</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-semibold">{getUserLabel()}</div>
              <div className="text-xs text-gray-600">
                {userInfo?.email || (
                  userType === 'admin'
                    ? 'admin@vrisa.gov.co'
                    : userType === 'institution'
                      ? 'contacto@institucion.edu'
                      : 'Acceso público'
                )}
              </div>
            </div>
            {/* Default avatar with simple submenu */}
            <div className="relative">
              <Button type="button" variant="ghost" className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); setProfileMenuOpen((v) => !v); }}>
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg z-[1000]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 py-2 text-sm border-b">
                    <div className="font-semibold">{getUserLabel()}</div>
                    <div className="text-xs text-gray-600 truncate">
                      {userInfo?.email || (
                        userType === 'admin'
                          ? 'admin@vrisa.gov.co'
                          : userType === 'institution'
                            ? 'contacto@institucion.edu'
                            : 'Acceso público'
                      )}
                    </div>
                  </div>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100" onClick={() => { setProfileMenuOpen(false); }}>
                    Perfil
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100" onClick={() => { setProfileMenuOpen(false); }}>
                    Configuración
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { setProfileMenuOpen(false); handleLogout(); }}>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Removed explicit logout button per request */}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static lg:translate-x-0 inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out top-[73px]`}
        >
          <nav className="p-4 space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Información de Usuario en Sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-1">Tipo de Cuenta</div>
              <div>
                {userType === 'admin'
                  ? 'Administrador del Sistema'
                  : userType === 'institution'
                  ? 'Institución'
                  : 'Visitante'}
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-[73px]"
            onClick={() => { setSidebarOpen(false); setProfileMenuOpen(false); }}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {visibleMenuItems.length === 0 ? (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Bienvenido</h2>
                <div className="text-sm text-gray-600">Sesión activa como {getUserLabel()}</div>
              </div>
              <Dashboard />
            </>
          ) : (
            <>
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'institutions' && userType === 'admin' && <AdminInstitutions />}
              {currentView === 'stations' && (userType === 'institution' || userType === 'admin') && (
                <StationManagement />
              )}
              {currentView === 'reports' && <Reports />}
            </>
          )}
        </main>
      </div>
        </>
      )}
    </div>
  );
}
