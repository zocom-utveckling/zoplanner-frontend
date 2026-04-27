import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString("sv-SE");
}

function formatTime(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function exportSchedulePdf(schedule) {
  const sessions = schedule?.sessionsDraft ?? schedule?.sessions ?? [];

  const courseName = schedule?.courseName ?? schedule?.course?.name ?? "Schema";

  const customerName = schedule?.customerName ?? "-";
  const className = schedule?.className ?? "-";

  const startDate = schedule?.startDate ?? schedule?.dateStart;
  const endDate = schedule?.endDate ?? schedule?.dateEnd;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(courseName, 14, 20);

  doc.setFontSize(11);
  doc.text(`Kund: ${customerName}`, 14, 32);
  doc.text(`Klass: ${className}`, 14, 39);
  doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 46);

  const rows = sessions.map((session, index) => [
    index + 1,
    formatDate(session.timeStart),
    formatTime(session.timeStart),
    formatTime(session.timeEnd),
    session.title || session.comment || `Pass ${index + 1}`,
    session.location || "-",
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["#", "Datum", "Start", "Slut", "Titel", "Plats"]],
    body: rows,
  });

  doc.save(`${courseName}-schema.pdf`);
}