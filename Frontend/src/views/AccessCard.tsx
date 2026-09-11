import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { API_URL } from '../lib/api';

export default function AccessCard() {
  const { memberId } = useParams();
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    // Llamamos al endpoint público (montado en /members) para traer el nombre del cliente
    fetch(`${API_URL}/members/public/${memberId}`)
      .then(res => res.json())
      .then(data => setMember(data))
      .catch(() => setMember(null));
  }, [memberId]);

  if (!member) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-outline-variant shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full">
        
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[40px]">fitness_center</span>
          <h1 className="font-headline-md text-xl font-bold text-primary">{member.gymName}</h1>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md mt-4">
          {/* El QR contiene la cédula del cliente, que es lo que el lector va a "escribir" */}
          <QRCodeSVG value={member.cedula} size={200} level="H" />
        </div>

        <div className="text-center mt-4">
          <h2 className="font-headline-md text-lg font-semibold text-on-surface">{member.fullName}</h2>
          <p className="font-body-sm text-on-surface-variant">C.I: {member.cedula}</p>
        </div>

        <p className="text-[11px] text-on-surface-variant mt-4 text-center">
          Muestra este código en la recepción para registrar tu entrada.
        </p>
      </div>
    </div>
  );
}