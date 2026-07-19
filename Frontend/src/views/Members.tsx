import { useEffect, useMemo, useState } from 'react';
import ConfirmMemberDeletionModal from '../components/ConfirmMemberDeletionModal';
import EditMemberModal from '../components/EditMemberModal';
import RenovationModal from '../components/RenovationModal';
import { apiFetch } from '../lib/api';

interface Member {
  id: string;
  fullName: string;
  cedula: string;
  phone: string | null;
  photoUrl: string | null;
  plan: string | null;
  endDate: string | null;
  status: 'sin_plan' | 'activo' | 'por_vencer' | 'en_gracia' | 'vencido';
}

const STATUS_LABELS: Record<Member['status'], string> = {
  sin_plan: 'Sin Plan',
  activo: 'Activo',
  por_vencer: 'Por Vencer',
  en_gracia: 'En Gracia',
  vencido: 'Vencido',
};

const STATUS_STYLES: Record<Member['status'], string> = {
  sin_plan: 'text-on-surface-variant border-outline-variant bg-surface-container-high',
  activo: 'text-primary border-primary/30 bg-primary/10',
  por_vencer: 'text-tertiary border-tertiary/30 bg-tertiary/10',
  en_gracia: 'text-tertiary border-tertiary/30 bg-tertiary/10',
  vencido: 'text-error border-error/30 bg-error/10',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'por_vencer' | 'vencido'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [renovationModalOpen, setRenovationModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/members');
      if (!response.ok) throw new Error();
      setMembers(await response.json());
    } catch {
      setError('No se pudieron cargar los miembros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleDeleteClick = (member: Member) => {
    setSelectedMember(member);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleRenovateClick = (member: Member) => {
    setSelectedMember(member);
    setRenovationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;
    try {
      const response = await apiFetch(`/members/${selectedMember.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setDeleteModalOpen(false);
      setSelectedMember(null);
      loadMembers();
    } catch {
      setError('No se pudo eliminar el miembro. Puede que tenga historial de pagos asociado.');
    }
  };

  const totalMembers = members.length;
  const dueSoonMembers = members.filter((m) => m.status === 'por_vencer').length;
  const activeRate = totalMembers > 0
    ? Math.round((members.filter((m) => m.status === 'activo').length / totalMembers) * 100)
    : 0;

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q || member.fullName.toLowerCase().includes(q) || member.cedula.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [members, statusFilter, searchQuery]);

  return (
    <>
      <div className="mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Directorio de Miembros</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Gestiona suscripciones activas, visualiza vencimientos y actualiza perfiles de miembros.
        </p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">error</span>
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total de Miembros</h3>
            <span className="material-symbols-outlined text-primary">group</span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : totalMembers}</span>
        </div>

        <div className="bg-surface-container rounded-xl border border-tertiary/50 p-4 flex flex-col justify-between shadow-[0_0_10px_rgba(255,184,110,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">Por Vencer</h3>
            <span className="material-symbols-outlined text-tertiary">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : dueSoonMembers}</span>
            <span className="text-on-surface-variant text-label-sm font-label-sm">Próximos 7 días</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tasa de Activos</h3>
            <span className="material-symbols-outlined text-primary">show_chart</span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface">{isLoading ? '—' : `${activeRate}%`}</span>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-2 border-b border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              className="bg-surface-container-high border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">Todos los Miembros</option>
              <option value="activo">Activos</option>
              <option value="por_vencer">Por Vencer</option>
              <option value="vencido">Vencidos</option>
            </select>
          </div>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md pl-10 pr-4 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[440px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">sync</span>
              Cargando miembros...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-on-surface-variant text-body-sm">
              No se encontraron miembros con ese criterio.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-lowest z-10">
                <tr className="border-b border-outline-variant bg-surface-container-lowest">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-[250px]">Nombre del Miembro</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Plan de Suscripción</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha de Vencimiento</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-label-md font-semibold overflow-hidden shrink-0">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                          ) : (
                            member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-body-sm text-on-surface font-medium leading-tight">{member.fullName}</p>
                          <p className="font-label-sm text-on-surface-variant text-[12px]">C.I: {member.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-body-sm text-on-surface-variant text-[14px]">{member.plan ?? 'Sin plan'}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant text-[14px]">{formatDate(member.endDate)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-semibold border min-w-[80px] ${STATUS_STYLES[member.status]}`}>
                        {STATUS_LABELS[member.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRenovateClick(member)}
                          className="w-8 h-8 rounded-lg hover:bg-primary/20 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer" title="Renovar"
                        >
                          <span className="material-symbols-outlined text-[20px]">autorenew</span>
                        </button>
                        <button
                          onClick={() => handleEditClick(member)}
                          className="w-8 h-8 rounded-lg hover:bg-surface-container-high hover:text-on-surface flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer" title="Editar"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="w-8 h-8 rounded-lg hover:bg-error/20 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer" title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmMemberDeletionModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        memberName={selectedMember?.fullName}
        memberId={selectedMember?.cedula}
      />

      <EditMemberModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onOpenDelete={() => {
          setEditModalOpen(false);
          setDeleteModalOpen(true);
        }}
        onSaved={loadMembers}
        member={selectedMember ? { dbId: selectedMember.id, fullName: selectedMember.fullName, cedula: selectedMember.cedula, phone: selectedMember.phone ?? '' } : undefined}
      />

      <RenovationModal
        isOpen={renovationModalOpen}
        onClose={() => setRenovationModalOpen(false)}
      />
    </>
  );
}