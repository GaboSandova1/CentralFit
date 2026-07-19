import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDelete?: () => void;
  onSaved?: () => void;
  member?: {
    dbId: string;
    fullName: string;
    cedula: string;
    phone: string;
  };
}

export default function EditMemberModal({ isOpen, onClose, onOpenDelete, onSaved, member }: EditMemberModalProps) {
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFullName(member.fullName);
      setCedula(member.cedula);
      setPhone(member.phone);
      setError(null);
    }
  }, [member]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!member) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await apiFetch(`/members/${member.dbId}`, {
        method: 'PATCH',
        body: JSON.stringify({ fullName, cedula, phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo guardar el miembro');
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el miembro');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-surface border border-outline-variant rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
          <h3 className="font-headline-md text-lg text-on-surface">Editar perfil de miembro</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors rounded-full p-1 hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Profile Photo Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-outline-variant">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full border-2 border-outline-variant overflow-hidden bg-surface-container-high flex items-center justify-center relative">
                  <img alt="Member portrait" className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName || 'Alejandro'}`} />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="material-symbols-outlined text-white">add</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface mb-1">Foto de perfil</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                  Sube una foto nítida para la identificación del miembro. Formato JPG o PNG, máximo 5 MB.
                  <span className="block text-[11px] mt-1 opacity-70">(La subida de fotos aún no está conectada)</span>
                </p>
                <div className="flex gap-3">
                  <button disabled className="px-3 py-1.5 border border-outline-variant rounded-lg text-on-surface-variant/50 font-label-sm text-label-sm cursor-not-allowed" type="button">Cambiar foto</button>
                  <button onClick={onOpenDelete} className="px-3 py-1.5 text-error font-label-sm text-label-sm hover:bg-error/10 rounded-lg transition-colors cursor-pointer" type="button">Eliminar miembro</button>
                </div>
              </div>
            </div>
            {/* Personal Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="fullName">Nombre completo</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-body-md text-body-md placeholder-on-surface-variant"
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              {/* ID (Cédula) */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="memberCedula">C.I (Cédula)</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-body-md text-body-md placeholder-on-surface-variant"
                  id="memberCedula"
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              </div>
              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="phone">Número de teléfono</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </span>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg pr-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-body-md text-body-md placeholder-on-surface-variant text-left pl-9"
                    id="phone"
                    type="tel"
                    placeholder="+58 414-3230945"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* Modal Footer (Actions) */}
        <div className="px-5 py-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-outline-variant cursor-pointer disabled:opacity-60" type="button">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed hover:shadow-[0_0_12px_rgba(81,224,132,0.4)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer disabled:opacity-60 flex items-center gap-2" type="button">
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3d4a3e; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #869486; }
      `}} />
    </div>
  );
}