import jsPDF from "jspdf";
import "jspdf-autotable";

export function generatePaymentReceipt(payment: any, tenancy: any) {
  const doc = new jsPDF() as any;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Navy Blue
  doc.text("NestSync", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Official Payment Receipt", 105, 28, { align: "center" });

  // Receipt Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Receipt No: ${payment.id.toUpperCase().slice(0, 8)}`, 20, 45);
  doc.text(`Date: ${new Date(payment.submittedAt).toLocaleDateString()}`, 20, 52);
  doc.text(`Status: ${payment.status}`, 20, 59);

  // Bill To / Paid By
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("PAID BY:", 20, 75);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(payment.tenant.name || "N/A", 20, 82);
  doc.setFontSize(10);
  doc.text(payment.tenant.email, 20, 88);

  doc.setTextColor(100);
  doc.text("PAID TO:", 120, 75);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(tenancy.landlord.name || "N/A", 120, 82);
  doc.setFontSize(10);
  doc.text(tenancy.landlord.email, 120, 88);

  // Property Info
  doc.setDrawColor(240);
  doc.line(20, 95, 190, 95);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("PROPERTY:", 20, 105);
  doc.setTextColor(0);
  doc.text(tenancy.property.address, 45, 105);

  // Table
  const tableData = [
    ["Description", "Period", "Method", "Amount"],
    [
      `${payment.type} Payment`,
      payment.period,
      payment.method,
      `KES ${payment.amount.toLocaleString()}`
    ]
  ];

  doc.autoTable({
    startY: 115,
    head: [tableData[0]],
    body: [tableData[1]],
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42] }, // Navy
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY || 130;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL PAID: KES ${payment.amount.toLocaleString()}`, 190, finalY + 20, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Thank you for using NestSync.", 105, 280, { align: "center" });

  doc.save(`Receipt_${payment.period.replace(" ", "_")}.pdf`);
}
