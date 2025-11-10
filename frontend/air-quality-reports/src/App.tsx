import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Radio,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { AdminInstitutions } from './components/AdminInstitutions';
import { StationManagement } from './components/StationManagement';
import { Reports } from './components/Reports';
import { Button } from './components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from './components/ui/avatar';

type View = 'dashboard' | 'institutions' | 'stations' | 'reports';
type UserType = 'public' | 'institution' | 'admin' | null;

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [userType, setUserType] = useState<UserType>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = (type: string) => {
    if (type === 'public') {
      setUserType('public');
    } else if (type === 'institution') {
      setUserType('institution');
    } else if (type === 'admin') {
      setUserType('admin');
    }
  };

  const handleLogout = () => {
    setUserType(null);
    setCurrentView('dashboard');
  };

  // Si no está logueado, mostrar pantalla de login
  if (userType === null) {
    return <Login onLogin={handleLogin} />;
  }

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

  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userType));

  const getUserLabel = () => {
    switch (userType) {
      case 'admin':
        return 'Administrador del Sistema';
      case 'institution':
        return 'Universidad del Valle';
      case 'public':
        return 'Usuario Visitante';
      default:
        return 'Usuario';
    }
  };

  const getUserInitials = () => {
    switch (userType) {
      case 'admin':
        return 'AS';
      case 'institution':
        return 'UV';
      case 'public':
        return 'UV';
      default:
        return 'U';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
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
                {userType === 'admin'
                  ? 'admin@vrisa.gov.co'
                  : userType === 'institution'
                  ? 'contacto@univalle.edu.co'
                  : 'Acceso público'}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-2">
                  <div className="font-semibold">{getUserLabel()}</div>
                  <div className="text-xs text-gray-600">
                    {userType === 'admin'
                      ? 'admin@vrisa.gov.co'
                      : userType === 'institution'
                      ? 'contacto@univalle.edu.co'
                      : 'Acceso público'}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'institutions' && userType === 'admin' && <AdminInstitutions />}
          {currentView === 'stations' && (userType === 'institution' || userType === 'admin') && (
            <StationManagement />
          )}
          {currentView === 'reports' && <Reports />}
        </main>
      </div>
    </div>
  );
}
