import { useEffect, useState, useRef, useMemo } from 'react';
import { apiFetch } from '../lib/api';

interface AttendanceRecord {
  id: string;
  memberName: string;
  cedula: string;
  memberPhoto: string | null;
  plan: string;
  status: string;
  time: string;
}

// NUEVO: Función para obtener la fecha de hoy en formato local (YYYY-MM-DD)
const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Attendance() {
  const [cedula, setCedula] = useState('');
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalToday()); // NUEVO
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAttendances = async (date: string) => {
    try {
      const res = await apiFetch(`/attendance?date=${date}`);
      if (!res.ok) throw new Error();
      setAttendances(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendances(selectedDate);
    inputRef.current?.focus();
  }, [selectedDate]); // Se recarga si cambia la fecha seleccionada

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cedula.length < 7 || cedula.length > 8) {
      setFlashMessage({ type: 'error', text: 'Cédula inválida. Debe tener 7 u 8 números.' });
      setCedula('');
      inputRef.current?.focus();
      setTimeout(() => setFlashMessage(null), 3000);
      return;
    }

    try {
      const res = await apiFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify({ cedula })
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.member) {
          setFlashMessage({ type: 'error', text: `${data.member.fullName} ya registró entrada hace un momento.` });
        } else {
          setFlashMessage({ type: 'error', text: data.error || 'Error al registrar entrada.' });
        }
      } else {
        setFlashMessage({ type: 'success', text: `¡Bienvenido, ${data.member.fullName}! (${data.member.status})` });
        // Si estamos viendo el día de hoy, actualizamos la tabla
        if (selectedDate === getLocalToday()) loadAttendances(selectedDate); // NUEVO
      }

      setCedula('');
      inputRef.current?.focus();
      setTimeout(() => setFlashMessage(null), 3000);

    } catch (err) {
      setFlashMessage({ type: 'error', text: 'No se pudo conectar con el servidor.' });
    }
  };

  // Filtrado en el frontend por nombre o cédula
  const filteredAttendances = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return attendances.filter(att =>
      att.memberName.toLowerCase().includes(q) || att.cedula.includes(q)
    );
  }, [attendances, searchQuery]);

  return (
    <>
      <div className="mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Control de Asistencia</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Escanea la cédula o llavero del miembro para registrar su entrada.
        </p>
      </div>

      {/* Formulario de Escaneo */}
      <div className="bg-surface-container rounded-xl border border-outline-variant p-6 mb-6 flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-primary text-[64px]">fingerprint</span>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase mb-2 block text-center">Cédula / Código QR</label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={cedula}
            onChange={(e) => setCedula(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Esperando escaneo..."
            className="w-full bg-surface border-2 border-primary rounded-lg px-3 py-3 text-center text-2xl font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all tracking-widest"
          />
        </form>

        {flashMessage && (
          <div className={`w-full max-w-md rounded-lg px-4 py-3 flex items-center gap-2 justify-center font-medium ${flashMessage.type === 'success' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-error/10 text-error border border-error/30'}`}>
            <span className="material-symbols-outlined">{flashMessage.type === 'success' ? 'check_circle' : 'cancel'}</span>
            {flashMessage.text}
          </div>
        )}
      </div>

      {/* Tabla de Asistentes */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
        {/* Header con Título, Buscador y Calendario */}
        <div className="p-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-high/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">group</span>
            <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Asistencia del Día</h3>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Buscador */}
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                type="text"
                placeholder="Buscar por nombre o cédula..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md pl-10 pr-4 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Calendario */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Tabla con Scroll Vertical Limitado */}
        <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">sync</span> Cargando...
            </div>
          ) : filteredAttendances.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-on-surface-variant text-body-sm">
              No hay registros para esta fecha o búsqueda.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container z-10">
                <tr className="border-b border-outline-variant">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Miembro</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Cédula</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Plan</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Hora de Entrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filteredAttendances.map((att) => (
                  <tr key={att.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-label-md font-semibold overflow-hidden shrink-0">
                          {att.memberPhoto ? (
                            <img src={att.memberPhoto} alt={att.memberName} className="w-full h-full object-cover" />
                          ) : (
                            att.memberName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                          )}
                        </div>
                        <span className="font-body-sm text-on-surface font-medium">{att.memberName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{att.cedula}</td>
                    <td className="p-3 font-body-sm text-on-surface-variant">{att.plan}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[12px] font-semibold border ${att.status === 'Activo' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="p-3 font-body-sm text-on-surface-variant text-right">
                      {new Date(att.time).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}