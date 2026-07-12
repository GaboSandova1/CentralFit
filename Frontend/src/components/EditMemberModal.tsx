import { useState } from 'react';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDelete?: () => void;
  member?: {
    name: string;
    id: string;
    phone?: string;
    status?: string;
    plan?: string;
  };
}

export default function EditMemberModal({ isOpen, onClose, onOpenDelete, member }: EditMemberModalProps) {
  if (!isOpen) return null;

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
          <form className="space-y-4">
            {/* Profile Photo Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-outline-variant">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full border-2 border-outline-variant overflow-hidden bg-surface-container-high flex items-center justify-center relative">
                  <img alt="Member portrait" className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member?.name || 'Alejandro'}`} />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="material-symbols-outlined text-white">add</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface mb-1">Foto de perfil</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">Sube una foto nítida para la identificación del miembro. Formato JPG o PNG, máximo 5 MB.</p>
                <div className="flex gap-3">
                  <button className="px-3 py-1.5 border border-outline-variant rounded-lg text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high hover:border-outline transition-colors cursor-pointer" type="button">Cambiar foto</button>
                  <button onClick={onOpenDelete} className="px-3 py-1.5 text-error font-label-sm text-label-sm hover:bg-error/10 rounded-lg transition-colors cursor-pointer" type="button">Eliminar</button>
                </div>
              </div>
            </div>
            {/* Personal Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="fullName">Nombre completo</label>
                <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-body-md text-body-md placeholder-on-surface-variant" id="fullName" type="text" defaultValue={member?.name || "Alejandro Gomez"} />
              </div>
              {/* ID (Cédula) */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="memberId">C.I (Cédula)</label>
                <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-body-md text-body-md placeholder-on-surface-variant" id="memberId" type="text" defaultValue={member?.id || "1029384756"} />
              </div>
              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="phone">Número de teléfono</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </span>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg pr-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-body-md text-body-md placeholder-on-surface-variant text-left pl-9" id="phone" type="tel" defaultValue="+58 412 123 4567" placeholder="+58 414-3230945" />
                </div>
              </div>
            </div>
            {/* Status Toggle */}
            <div className="pt-4 border-t border-outline-variant/50">
              <div className="flex items-center justify-between bg-surface-container p-4 rounded-lg border border-outline-variant/50">
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">Estado de membresía</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Deshabilitar temporalmente el acceso sin eliminar el perfil.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </form>
        </div>
        {/* Modal Footer (Actions) */}
        <div className="px-5 py-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-outline-variant cursor-pointer" type="button">
            Cancelar
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed hover:shadow-[0_0_12px_rgba(81,224,132,0.4)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer" type="button">
            Guardar cambios
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