import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; // NUEVO: Importar el plugin de tablas

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  gymName: string;
  gymAddress: string;
  gymPhone: string;
  memberName: string;
  memberCedula: string;
  planName: string;
  startDate: string;
  endDate: string;
  method: string;
  reference: string;
  amountUsd: number | null;
  amountBs: number | null;
  exchangeRate: number | null;
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Encabezado (Datos del Gimnasio)
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(data.gymName, margin, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`RIF: J-12345678-9 (Reemplazar)`, margin, 27); 
  doc.text(`Dirección: ${data.gymAddress}`, margin, 32);
  doc.text(`Teléfono: ${data.gymPhone}`, margin, 37);

  // Línea separadora
  doc.setDrawColor(200);
  doc.line(margin, 42, pageWidth - margin, 42);

  // Título de Factura
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURA / RECIBO DE PAGO", pageWidth - margin, 20, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`N°: ${data.invoiceNumber}`, pageWidth - margin, 27, { align: "right" });
  doc.text(`Fecha: ${data.date}`, pageWidth - margin, 32, { align: "right" });

  // Datos del Cliente
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL CLIENTE", margin, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${data.memberName}`, margin, 62);
  doc.text(`Cédula: ${data.memberCedula}`, margin, 67);

  // Tabla de Detalles de Pago
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DEL PAGO", margin, 85);

  // NUEVO: Usamos la función autoTable importada
  autoTable(doc, {
    startY: 90,
    head: [['Descripción', 'Método', 'Referencia', 'Monto USD', 'Monto Bs']],
    body: [[
      data.planName,
      data.method,
      data.reference || 'N/A',
      data.amountUsd ? `$${data.amountUsd.toFixed(2)}` : 'N/A',
      data.amountBs ? `Bs ${data.amountBs.toFixed(2)}` : 'N/A'
    ]],
    theme: 'striped',
    headStyles: { fillColor: [81, 224, 132], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    margin: { left: margin, right: margin }
  });

  // Resumen y Firmas
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY || 120;

  if (data.exchangeRate) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`Tasa de cambio aplicada: Bs ${data.exchangeRate.toFixed(2)} por USD`, margin, finalY + 10);
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Vigencia del Plan: ${data.startDate} hasta ${data.endDate}`, margin, finalY + 16);

  // Firmas
  doc.setDrawColor(150);
  doc.line(margin, finalY + 40, margin + 60, finalY + 40);
  doc.line(pageWidth - margin - 60, finalY + 40, pageWidth - margin, finalY + 40);
  
  doc.setFontSize(10);
  doc.text("Firma del Cliente", margin, finalY + 46);
  doc.text("Sello y Firma del Gimnasio", pageWidth - margin - 60, finalY + 46);

  // Guardar
  doc.save(`Factura_${data.invoiceNumber}.pdf`);
}