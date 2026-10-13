import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const exportEVotingPDF = (event) => {
  if (!event || !event.Event_teams) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const teamsWithBalance = event.Event_teams.map((t) => ({
    nama: t.Team?.team_name || "-",
    instansi: t.Team?.team_sekolah_instansi || "-",
    nomor: t.nomor_tampil || "-",
    balance: Number(t.balance) || 0,
  })).sort((a, b) => b.balance - a.balance);

  const totalBalance = teamsWithBalance.reduce((sum, t) => sum + t.balance, 0);
  const teamsWithDonation = teamsWithBalance.filter((t) => t.balance > 0).length;
  const teamsWithoutDonation = teamsWithBalance.filter((t) => t.balance === 0).length;

  let formattedDate = "";
  if (event.event_tanggal) {
    try {
      formattedDate = format(new Date(event.event_tanggal), "EEEE, d MMMM yyyy", {
        locale: id,
      });
    } catch (e) {
      formattedDate = "";
    }
  }

  const currencyFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("REKAPITULASI E-VOTING", 105, 18, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(event.event_name ? event.event_name.toUpperCase() : "", 105, 25, {
    align: "center",
  });

  const details = [
    event.event_tempat,
    formattedDate,
    event.event_penyelenggara ? `Penyelenggara: ${event.event_penyelenggara}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  if (details) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(details, 105, 30, { align: "center" });
    doc.setTextColor(0, 0, 0);
  }

  // Header line
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  // --- Table ---
  const tableData = teamsWithBalance.map((t, idx) => [
    idx + 1,
    t.nomor,
    t.nama,
    t.instansi,
    currencyFormatter.format(t.balance),
  ]);

  autoTable(doc, {
    startY: 38,
    head: [
      [
        "Peringkat",
        "No. Tampil",
        "Nama Tim",
        "Asal Sekolah / Instansi",
        "Total E-Voting",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { halign: "center", fontStyle: "bold", cellWidth: 20 },
      1: { halign: "center", cellWidth: 25 },
      2: { halign: "left" },
      3: { halign: "left" },
      4: { halign: "right", fontStyle: "bold", textColor: [21, 128, 61] },
    },
    margin: { left: 14, right: 14 },
  });

  // --- Summary Section ---
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 100;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan E-Voting:", 14, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`• Tim Mendapat Voting : ${teamsWithDonation} Tim`, 14, finalY + 6);
  doc.text(
    `• Tim Tidak Mendapat Voting : ${teamsWithoutDonation} Tim`,
    14,
    finalY + 11
  );

  // Total Keseluruhan (Right aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total Keseluruhan E-Voting:", 196, finalY, { align: "right" });

  doc.setFontSize(13);
  doc.setTextColor(21, 128, 61); // Green color
  doc.text(currencyFormatter.format(totalBalance), 196, finalY + 7, {
    align: "right",
  });
  doc.setTextColor(0, 0, 0);

  // Footer print date
  const nowStr = `Dicetak pada: ${new Date().toLocaleString("id-ID")}`;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);
  doc.text(nowStr, 196, finalY + 22, { align: "right" });

  // Save the PDF
  const sanitizeFileName = (event.event_name || "Event").replace(
    /[^a-zA-Z0-9_\-]/g,
    "_"
  );
  doc.save(`Rekap_EVoting_${sanitizeFileName}.pdf`);
};
