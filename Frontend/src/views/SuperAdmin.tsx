import { useEffect, useState } from 'react';

interface SuperAdminProps {
  onLogout: () => void;
}

interface Owner {
  fullName: string | null;
  email: string;
  phone: string | null;
}

interface Gym {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  memberCount: number;
  userCount: number;
  owner: Owner | null;
}

interface Stats {
  totalGyms: number;
  activeGyms: number;
  trialGyms: number;
  suspendedGyms: number;
  totalMembers: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUS_LABELS: Record<Gym['status'], string> = {
  active: 'ACTIVO',
  suspended: 'SUSPENDIDO',
  trial: 'PRUEBA',
};

const STATUS_STYLES: Record<Gym['status'], string> = {
  active: 'bg-primary/20 text-primary border-primary/30',
  suspended: 'bg-error/20 text-error border-error/30',
  trial: 'bg-tertiary-container/20 text-tertiary-container border-tertiary-container/30',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

export default function SuperAdmin({ onLogout }: SuperAdminProps) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gymsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/gyms`, { headers: authHeaders() }),
        fetch(`${API_URL}/admin/stats`, { headers: authHeaders() }),
      ]);

      if (!gymsRes.ok || !statsRes.ok) {
        if (gymsRes.status === 401 || statsRes.status === 401) {
          onLogout();
          return;
        }
        throw new Error('No se pudieron cargar los datos');
      }

      setGyms(await gymsRes.json());
      setStats(await statsRes.json());
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleAccess = async (gym: Gym) => {
    const newStatus = gym.status === 'active' ? 'suspended' : 'active';

    // Actualización optimista, revertimos si falla
    setGyms((prev) => prev.map((g) => (g.id === gym.id ? { ...g, status: newStatus } : g)));

    try {
      const response = await fetch(`${API_URL}/admin/gyms/${gym.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar el estado');
      }
    } catch {
      setGyms((prev) => prev.map((g) => (g.id === gym.id ? { ...g, status: gym.status } : g)));
      setError('No se pudo actualizar el acceso de ese gimnasio. Intenta de nuevo.');
    }
  };

  const filteredGyms = gyms.filter((gym) => {
    const q = searchQuery.toLowerCase();
    return (
      gym.name.toLowerCase().includes(q) ||
      gym.owner?.fullName?.toLowerCase().includes(q) ||
      gym.owner?.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-surface text-on-surface font-body-md h-screen overflow-hidden flex">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-full py-6 bg-surface-container fixed left-0 top-0 w-64 border-r border-outline-variant z-20">
        <div className="px-6 mb-8">
          <h1 className="font-headline-md text-2xl font-bold text-primary">Kinetic Admin</h1>
          <p className="font-label-sm text-xs text-on-surface-variant mt-1">Consola de Super Admin</p>
        </div>
        <ul className="flex flex-col gap-1 mt-4">
          <li>
            <a className="flex items-center gap-3 px-4 py-3 border-l-4 border-primary bg-secondary-container/10 text-primary font-bold active:scale-95 transition-transform" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>list_alt</span>
              <span className="font-label-md text-sm">Directorio de Gimnasios</span>
            </a>
          </li>
        </ul>
        <div className="mt-auto px-6">
          <div className="flex items-center gap-3 pt-4 border-t border-outline-variant">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              SA
            </div>
            <div>
              <p className="font-label-sm text-xs text-on-surface">Usuario Admin</p>
              <p className="font-label-sm text-[10px] text-on-surface-variant">Superusuario</p>
            </div>
          </div>
        </div>
        <div className="px-4 mt-4">
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              onLogout();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error/10 rounded transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* TopNavBar */}
      <header className="hidden md:flex justify-between items-center px-6 h-16 bg-surface fixed top-0 right-0 w-[calc(100%-16rem)] border-b border-outline-variant z-10">
        <div className="flex-1 flex items-center">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontVariationSettings: '"FILL" 1' }}>search</span>
            <input
              className="w-full bg-surface-container-highest border border-outline-variant rounded py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Buscar por nombre de gimnasio o dueño..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-0 md:ml-64 mt-0 md:mt-16 p-4 md:p-8 w-full h-[calc(100vh-64px)] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Directorio de Gimnasios</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Gestiona todas las sedes registradas y su acceso a la plataforma.</p>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[18px]">error</span>
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}

        {/* Metrics Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface-container rounded-lg p-4 border border-outline-variant/50">
            <p className="font-label-sm text-xs text-on-surface-variant mb-2">Total de Gimnasios</p>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{stats?.totalGyms ?? '—'}</h3>
          </div>
          <div className="bg-surface-container rounded-lg p-4 border border-outline-variant/50">
            <p className="font-label-sm text-xs text-on-surface-variant mb-2">Activos</p>
            <h3 className="font-headline-md text-headline-md font-bold text-primary">{stats?.activeGyms ?? '—'}</h3>
          </div>
          <div className="bg-surface-container rounded-lg p-4 border border-outline-variant/50">
            <p className="font-label-sm text-xs text-on-surface-variant mb-2">En Prueba</p>
            <h3 className="font-headline-md text-headline-md font-bold text-tertiary-container">{stats?.trialGyms ?? '—'}</h3>
          </div>
          <div className="bg-surface-container rounded-lg p-4 border border-outline-variant/50">
            <p className="font-label-sm text-xs text-on-surface-variant mb-2">Suspendidos</p>
            <h3 className="font-headline-md text-headline-md font-bold text-error">{stats?.suspendedGyms ?? '—'}</h3>
          </div>
        </div>

        {/* High-Density Table */}
        <div className="bg-surface-container rounded-lg border border-outline-variant overflow-hidden flex-1 relative h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">sync</span>
              Cargando gimnasios...
            </div>
          ) : filteredGyms.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-on-surface-variant text-body-sm">
              No se encontraron gimnasios.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-surface-container border-b-2 border-outline-variant">
                  <tr>
                    <th className="py-3 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Nombre / Sede</th>
                    <th className="py-3 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Dueño</th>
                    <th className="py-3 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Miembros</th>
                    <th className="py-3 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Usuarios</th>
                    <th className="py-3 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Fecha Registro</th>
                    <th className="py-3 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Estado</th>
                    <th className="py-3 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Acceso</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-sm">
                  {filteredGyms.map((gym) => (
                    <tr key={gym.id} className="border-b border-outline-variant/30 hover:bg-surface-container-highest/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-label-md font-semibold shrink-0">
                            {getInitials(gym.name)}
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface text-sm">{gym.name}</p>
                            {gym.address && <p className="text-on-surface-variant text-[11px]">{gym.address}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {gym.owner ? (
                          <div>
                            <p className="text-on-surface">{gym.owner.fullName ?? gym.owner.email}</p>
                            <p className="text-on-surface-variant text-[11px]">{gym.owner.email}</p>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-[11px]">Sin dueño registrado</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{gym.memberCount}</td>
                      <td className="py-3 px-4">{gym.userCount}</td>
                      <td className="py-3 px-4">{new Date(gym.createdAt).toLocaleDateString('es-VE')}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center py-1 px-2 rounded-full text-[10px] font-bold border uppercase tracking-widest ${STATUS_STYLES[gym.status]}`}>
                          {STATUS_LABELS[gym.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            checked={gym.status === 'active'}
                            onChange={() => handleToggleAccess(gym)}
                            className="sr-only peer"
                            type="checkbox"
                          />
                          <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}