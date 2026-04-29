import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getClassName,
  getCourseName,
  getCustomerName,
  getEndDate,
  getSessionTitle,
  getStartDate,
} from "./normalize.helpers";

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

  const courseName = getCourseName(schedule, "Schema");
  const customerName = getCustomerName(schedule);
  const className = getClassName(schedule);

  const startDate = getStartDate(schedule);
  const endDate = getEndDate(schedule);

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
    getSessionTitle(session, index),
    session.location || "-",
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["#", "Datum", "Start", "Slut", "Titel", "Plats"]],
    body: rows,
  });

  doc.save(`${courseName}-schema.pdf`);
}