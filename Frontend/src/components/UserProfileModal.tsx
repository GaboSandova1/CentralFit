import { useState } from 'react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-surface-container rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-surface-variant w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-surface-variant">
          <h2 className="font-headline-md text-lg text-on-surface">Perfil de Administrador</h2>
          <button onClick={onClose} aria-label="Close modal" className="text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Profile Image & Status */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <button className="w-full h-full rounded-full bg-primary/20 border-2 border-primary border-dashed flex items-center justify-center text-primary hover:bg-primary/30 transition-colors group cursor-pointer" aria-label="Upload photo">
                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
              </button>
              <div className="absolute bottom-0 right-0 bg-surface-container p-1 rounded-full">
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-headline-md text-lg text-on-surface">centralfit@gmail.com</h3>
            </div>
          </div>
          {/* User Details Grid */}
          <div className="bg-surface rounded-lg p-3 border border-surface-variant grid gap-4">
            <div className="grid grid-cols-3 items-center border-b border-surface-variant/50 pb-2">
              <span className="col-span-1 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">ID de Usuario</span>
              <span className="col-span-2 font-body-md text-body-md text-on-surface text-right">CentralFit1</span>
            </div>
            {/* <div className="grid grid-cols-3 items-center border-b border-surface-variant/50 pb-2"></div> */}
            <div className="grid grid-cols-3 items-center">
              <span className="col-span-1 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nombre del gimnasio</span>
              <span className="col-span-2 font-body-md text-body-md text-on-surface text-right">CentralFit Principal</span>
            </div>
          </div>
          {/* Security Section */}
          <div className="space-y-3">
            <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">Seguridad</h4>
            <div className="bg-surface rounded-lg p-3 border border-surface-variant space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-label-md text-on-surface-variant">Contraseña Anterior</label>
                <input type="password" placeholder="••••••••" className="bg-surface-container border border-surface-variant rounded p-1.5 text-on-surface focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-label-md text-on-surface-variant">Nueva Contraseña</label>
                <input type="password" placeholder="••••••••" className="bg-surface-container border border-surface-variant rounded p-1.5 text-on-surface focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-label-md text-on-surface-variant">Confirmar Contraseña</label>
                <div className="flex gap-2">
                  <input type="password" placeholder="••••••••" className="flex-1 bg-surface-container border border-surface-variant rounded p-1.5 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                  <button className="px-4 py-1.5 bg-primary/20 text-primary border border-primary/50 rounded font-label-md hover:bg-primary/30 transition-colors cursor-pointer">
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-high border-t border-surface-variant flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded font-label-md text-label-md text-on-surface border border-surface-variant hover:bg-surface-variant/50 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button onClick={onClose} className="px-5 py-1.5 rounded font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-md flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">edit</span>
            Editar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}