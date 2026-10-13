"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// ─── helpers ────────────────────────────────────────────────────────────────

function CategoryHeader({ label, colSpan = 5 }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          background: "#FFD700",
          fontWeight: "bold",
          fontSize: "10px",
          textAlign: "center",
          padding: "2px 4px",
          border: "1px solid #888",
          textTransform: "uppercase",
          color: "#000",
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function ScoreRow({ no, label, juriValues = [], total }) {
  return (
    <tr>
      <td style={tdSm}>{no}</td>
      <td style={{ ...tdSm, textAlign: "left" }}>{label}</td>
      {juriValues.map((val, idx) => (
        <td key={idx} style={{ ...tdSm, textAlign: "center", fontStyle: "italic" }}>
          {val !== undefined && val !== null && val !== "" ? val : "-"}
        </td>
      ))}
      <td style={{ ...tdSm, textAlign: "center", fontWeight: "bold" }}>
        {total}
      </td>
    </tr>
  );
}

// ─── styles ─────────────────────────────────────────────────────────────────

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "9px",
  color: "#000",
};

const thStyle = {
  border: "1px solid #888",
  padding: "2px 4px",
  background: "#e8e8e8",
  fontWeight: "bold",
  textAlign: "center",
  fontSize: "9px",
  lineHeight: 1.2,
};

const tdSm = {
  border: "1px solid #aaa",
  padding: "1.5px 3px",
  fontSize: "9px",
  lineHeight: 1.3,
  whiteSpace: "nowrap",
};

const sectionTitle = {
  fontWeight: "bold",
  fontSize: "10px",
  textTransform: "uppercase",
  margin: "6px 0 2px 0",
};

const totalRow = {
  background: "#f0f0f0",
  fontWeight: "bold",
};

// ─── sub-components ─────────────────────────────────────────────────────────

const isPBB = (name) => /pbb|baris/i.test(name || "");
const isVariasiFormasi = (name) => /variasi|formasi/i.test(name || "");
const isKomandan = (name) => /komandan|danton/i.test(name || "");

function JuriTable({ juriList, aspectFilter }) {
  if (!juriList || juriList.length === 0)
    return (
      <p style={{ fontSize: 9, color: "#888", margin: "4px 0" }}>
        Belum ada data juri untuk kategori ini.
      </p>
    );

  const juriCount = juriList.length;
  const totalColSpan = 2 + juriCount + 1; // NO + MATERI + JURIS + JUMLAH

  // Map each aspek with its ordered list of subaspeks and scores per juri
  const aspekMap = {}; // aspek_id -> { id, nama, urutan, subList: [{ subId, nama, urutan, kategori, nilai: [] }] }
  const subIndexMap = {}; // `${aspekId}_${subId}` -> subObject

  juriList.forEach((juri, jIndex) => {
    juri.AspekNilais?.forEach((aspek) => {
      if (aspectFilter && !aspectFilter(aspek.Aspek?.nama_aspek)) return;
      const aspekId = aspek.Aspek?.id || aspek.aspek_id;
      if (!aspekMap[aspekId]) {
        aspekMap[aspekId] = {
          id: aspekId,
          nama: aspek.Aspek?.nama_aspek,
          urutan: aspek.Aspek?.urutan || 0,
          subList: [],
        };
      }

      aspek.SubAspekNilais?.forEach((sub) => {
        const subId =
          sub.subaspek_id ||
          sub.SubAspek?.id ||
          sub.SubAspek?.subaspek_id ||
          sub.id;
        const key = `${aspekId}_${subId}`;

        if (!subIndexMap[key]) {
          const rawKat = (sub.SubAspek?.kategori || "").trim();
          const kategori =
            rawKat && rawKat.toLowerCase() !== "null" ? rawKat : "";
          const subObj = {
            subId,
            nama: sub.SubAspek?.nama_subaspek || "",
            urutan: sub.SubAspek?.urutan || 0,
            kategori,
            nilai: new Array(juriCount).fill(undefined),
          };
          subIndexMap[key] = subObj;
          aspekMap[aspekId].subList.push(subObj);
        }

        subIndexMap[key].nilai[jIndex] = parseInt(sub.nilai, 10) || 0;
      });
    });
  });

  let globalNo = 1;

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: 18 }}>NO</th>
          <th style={{ ...thStyle, textAlign: "left" }}>MATERI PERLOMBAAN</th>
          {juriList.map((_, idx) => (
            <th
              key={idx}
              style={{
                ...thStyle,
                width: Math.max(26, Math.floor(90 / juriCount)),
              }}
            >
              JURI {idx + 1}
            </th>
          ))}
          <th style={{ ...thStyle, width: 36 }}>JUMLAH</th>
        </tr>
      </thead>
      <tbody>
        {Object.values(aspekMap).map((aspek) => {
          // Sort subaspeks strictly by urutan
          const orderedSubs = [...aspek.subList].sort(
            (a, b) => (a.urutan || 0) - (b.urutan || 0),
          );

          const totalTotal = orderedSubs.reduce(
            (sum, sub) =>
              sum + (sub.nilai?.reduce((a, b) => a + (b || 0), 0) || 0),
            0,
          );

          let lastCategory = null;

          return (
            <React.Fragment key={aspek.id}>
              <CategoryHeader label={aspek.nama} colSpan={totalColSpan} />
              {orderedSubs.map((sub, idx) => {
                const currentCategory = sub.kategori;
                const showCategoryBanner =
                  currentCategory &&
                  currentCategory !== lastCategory &&
                  currentCategory !== "Lainnya";

                lastCategory = currentCategory;
                const no = globalNo++;
                const total = sub.nilai.reduce((a, b) => a + (b || 0), 0);

                return (
                  <React.Fragment key={sub.subId || idx}>
                    {showCategoryBanner && (
                      <tr>
                        <td
                          colSpan={totalColSpan}
                          style={{
                            ...tdSm,
                            background: "#fffbe6",
                            fontWeight: "bold",
                            fontSize: "9px",
                            padding: "2px 4px",
                            border: "1px solid #fde68a",
                            textTransform: "uppercase",
                            color: "#78350f",
                          }}
                        >
                          {currentCategory}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ ...tdSm, textAlign: "center" }}>{no}</td>
                      <td style={{ ...tdSm, textAlign: "left" }}>
                        {sub.nama}
                      </td>
                      {juriList.map((_, jIdx) => {
                        const val = sub.nilai[jIdx];
                        return (
                          <td
                            key={jIdx}
                            style={{
                              ...tdSm,
                              textAlign: "center",
                              fontStyle: "italic",
                            }}
                          >
                            {val !== undefined && val !== null && val !== ""
                              ? val
                              : "-"}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          ...tdSm,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {total || "-"}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
              <tr style={{ background: "#f9f9f9", fontWeight: "bold" }}>
                <td
                  colSpan={2}
                  style={{ ...tdSm, textAlign: "right", paddingRight: 6 }}
                >
                  TOTAL {aspek.nama}
                </td>
                {juriList.map((_, jIdx) => {
                  const totalVal = orderedSubs.reduce(
                    (sum, sub) => sum + (sub.nilai[jIdx] || 0),
                    0,
                  );
                  return (
                    <td
                      key={jIdx}
                      style={{
                        ...tdSm,
                        textAlign: "center",
                        fontStyle: "italic",
                        fontWeight: "bold",
                      }}
                    >
                      {totalVal || ""}
                    </td>
                  );
                })}
                <td
                  style={{ ...tdSm, textAlign: "center", fontWeight: "bold" }}
                >
                  {totalTotal || ""}
                </td>
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function JuriLegend({ juriList, label }) {
  if (!juriList || juriList.length === 0) return null;
  return (
    <div
      style={{
        fontSize: "8px",
        fontStyle: "italic",
        color: "#666",
        marginTop: "3px",
        marginBottom: "8px",
        lineHeight: 1.2,
      }}
    >
      <strong>* Keterangan {label}:</strong>{" "}
      {juriList
        .map(
          (j, idx) =>
            `Juri ${idx + 1}: ${j.User?.user_name?.toUpperCase() || "-"}`,
        )
        .join("  |  ")}
    </div>
  );
}

function KomandanTable({ juriList }) {
  if (!juriList || juriList.length === 0) return null;

  const juriCount = juriList.length;
  const totalColSpan = 2 + juriCount + 1;

  const aspekMap = {};
  juriList.forEach((juri) => {
    juri.AspekNilais?.forEach((aspek) => {
      if (!isKomandan(aspek.Aspek?.nama_aspek)) return;
      const aspekId = "komandan";
      if (!aspekMap[aspekId]) aspekMap[aspekId] = { rows: {} };
      aspek.SubAspekNilais?.forEach((sub) => {
        const subId =
          sub.subaspek_id ||
          sub.SubAspek?.id ||
          sub.SubAspek?.subaspek_id ||
          sub.id;
        if (!aspekMap[aspekId].rows[subId]) {
          aspekMap[aspekId].rows[subId] = {
            nama: sub.SubAspek?.nama_subaspek,
            nilai: [],
          };
        }
        aspekMap[aspekId].rows[subId].nilai.push(parseInt(sub.nilai, 10) || 0);
      });
    });
  });

  const rows = aspekMap["komandan"]?.rows || {};

  if (Object.keys(rows).length === 0) return null;

  let no = 1;
  const totalKomandan = Object.values(rows).reduce((sum, sub) => {
    return sum + sub.nilai.reduce((a, b) => a + (b || 0), 0);
  }, 0);

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ ...sectionTitle }}>KOMANDAN PASUKAN</div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 18 }}>NO</th>
            <th style={{ ...thStyle, textAlign: "left" }}>KRITERIA</th>
            {juriList.map((_, idx) => (
              <th
                key={idx}
                style={{
                  ...thStyle,
                  width: Math.max(26, Math.floor(90 / juriCount)),
                }}
              >
                JURI {idx + 1}
              </th>
            ))}
            <th style={{ ...thStyle, width: 36 }}>JUMLAH</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rows).map(([subId, sub]) => {
            const total = sub.nilai.reduce((a, b) => a + (b || 0), 0);
            return (
              <tr key={subId}>
                <td style={{ ...tdSm, textAlign: "center" }}>{no++}</td>
                <td style={{ ...tdSm }}>{sub.nama}</td>
                {juriList.map((_, idx) => {
                  const val = sub.nilai[idx];
                  return (
                    <td
                      key={idx}
                      style={{
                        ...tdSm,
                        textAlign: "center",
                        fontStyle: "italic",
                      }}
                    >
                      {val !== undefined && val !== null && val !== ""
                        ? val
                        : "-"}
                    </td>
                  );
                })}
                <td
                  style={{ ...tdSm, textAlign: "center", fontWeight: "bold" }}
                >
                  {total || "-"}
                </td>
              </tr>
            );
          })}
          <tr style={totalRow}>
            <td
              colSpan={2}
              style={{ ...tdSm, textAlign: "right", paddingRight: 6 }}
            >
              TOTAL NILAI DANTON
            </td>
            {juriList.map((_, idx) => {
              const totalVal = Object.values(rows).reduce(
                (sum, sub) => sum + (sub.nilai[idx] || 0),
                0,
              );
              return (
                <td
                  key={idx}
                  style={{
                    ...tdSm,
                    textAlign: "center",
                    fontStyle: "italic",
                    fontWeight: "bold",
                  }}
                >
                  {totalVal || ""}
                </td>
              );
            })}
            <td style={{ ...tdSm, textAlign: "center", fontWeight: "bold" }}>
              {totalKomandan}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function TeamRekapPage() {
  const params = useParams();
  const eventId = params.eventId || params.event_id;
  const teamId = params.teamId || params.team_id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    event: null,
    details: [],
    summary: null,
    aspectSummary: [],
    teamInfo: null,
  });

  const printRef = useRef();

  // pageStyle di sini hanya untuk margin & color-adjust.
  // Orientasi A4 portrait DITARUH langsung sebagai <style> di dalam
  // elemen yang di-ref oleh printRef (lihat di bawah), karena itu cara
  // yang paling reliable menurut dokumentasi resmi react-to-print:
  // style harus ikut tersalin ke iframe cetak bersama node yang dicetak.
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Lembar_Penilaian_${data?.teamInfo?.Team?.team_name?.replace(/\s+/g, "_") || "Tim"}`,
    pageStyle: `
      @media print {
        html, body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background: white !important;
        }
      }
    `,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, detailRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/penilaian/detail/${eventId}/${teamId}`),
        ]);

        const eventData = eventRes.data.event;
        const teamData = eventData.Event_teams?.find(
          (et) => et.team_id === teamId || et.Team?.team_id === teamId,
        );

        setData({
          event: eventData,
          details: detailRes.data.details || [],
          summary: detailRes.data.summary || null,
          aspectSummary: detailRes.data.aspectSummary || [],
          teamInfo: teamData,
        });
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data rekapitulasi tim.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId && teamId) fetchData();
  }, [eventId, teamId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat dokumen rekapitulasi...</span>
      </div>
    );
  }

  const teamName = data.teamInfo?.Team?.team_name || "Tim Tidak Dikenal";
  const teamInstansi = data.teamInfo?.Team?.team_sekolah_instansi || "-";
  const nomorTampil = data.teamInfo?.nomor_tampil
    ? String(data.teamInfo.nomor_tampil).padStart(2, "0")
    : "-";

  const totalKotor = data.details.reduce(
    (acc, cur) => acc + parseInt(cur.total_nilai || 0, 10),
    0,
  );
  const nilaiAkhir = data.summary?.nilai_akhir || totalKotor;
  const penaltyDetails = data.summary?.penalty_details || [];
  const penalti = penaltyDetails.reduce(
    (sum, p) => sum + Math.abs(p.total_pengurangan || 0),
    0,
  );

  // Compute sub-totals by aspek category for the right summary panel
  const aspekTotals = data.aspectSummary || [];

  // Pisahkan Juri sesuai dengan aspek yang dinilai
  const pbbJuris = data.details.filter((j) =>
    j.AspekNilais?.some((a) => isPBB(a.Aspek?.nama_aspek)),
  );
  const varForJuris = data.details.filter((j) =>
    j.AspekNilais?.some((a) => isVariasiFormasi(a.Aspek?.nama_aspek)),
  );
  const dantonJuris = data.details.filter((j) =>
    j.AspekNilais?.some((a) => isKomandan(a.Aspek?.nama_aspek)),
  );

  // Compute per-column totals from aspectSummary
  const totalPBB = aspekTotals
    .filter((a) =>
      isPBB(a["Aspeks.nama_aspek"] || a["Aspek.nama_aspek"] || a.nama_aspek),
    )
    .reduce((s, a) => s + parseInt(a.total_score || 0, 10), 0);

  const totalVarFor = aspekTotals
    .filter((a) =>
      isVariasiFormasi(
        a["Aspeks.nama_aspek"] || a["Aspek.nama_aspek"] || a.nama_aspek,
      ),
    )
    .reduce((s, a) => s + parseInt(a.total_score || 0, 10), 0);

  // Danton total — from details where aspek = danton/komandan
  const totalDanton = data.details.reduce((sum, juri) => {
    return (
      sum +
      (juri.AspekNilais || [])
        .filter((a) => isKomandan(a.Aspek?.nama_aspek))
        .flatMap((a) => a.SubAspekNilais || [])
        .reduce((s, sub) => s + parseInt(sub.nilai, 10), 0)
    );
  }, 0);

  return (
    <ProtectedRoute requiredAccess="view_recap">
      {/* ── nav bar ── */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 print:hidden">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/rekap">Rekap Nilai</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Lembar Khusus Tim</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center gap-4 p-4 pt-0 print:p-0">
        {/* action buttons */}
        <div className="w-full max-w-[297mm] flex justify-between items-center mb-2 print:hidden">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Cetak Lembar Penilaian
          </Button>
        </div>

        {/* ── A4 Sheet (tampilan browser, TIDAK berubah) ── */}
        <div
          style={{
            width: "210mm",
            minHeight: "297mm",
            background: "#fff",
            color: "#000",
            fontFamily: "'Arial', sans-serif",
            boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            padding: "8mm",
            boxSizing: "border-box",
            margin: "0 auto",
          }}
          className="print:shadow-none print:p-0"
        >
          {/* ====== printRef: ini SATU-SATUNYA node yang dikirim ke iframe cetak ====== */}
          <div ref={printRef} style={{ padding: "2mm" }}>
            {/*
              PENTING: style ini WAJIB ditaruh di dalam elemen yang di-ref
              oleh printRef, karena react-to-print menyalin node ini apa
              adanya ke iframe cetak. Kalau ditaruh di luar (misal cuma
              lewat opsi pageStyle di hook), beberapa browser/versi tidak
              ikut menyalinnya dengan reliable.
              Style ini hanya aktif saat @media print, jadi tidak pernah
              memengaruhi tampilan normal di browser.
            */}
            <style type="text/css" media="print">
              {`
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
              `}
            </style>

            {/* ════ HEADER ════ */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 6,
              }}
            >
              <tbody>
                <tr>
                  {/* Left: event info */}

                  <td
                    style={{
                      border: "1.5px solid #000",
                      padding: "3px 8px",
                      width: "38%",
                      verticalAlign: "middle",
                    }}
                  >
                    {/* tambah tulisan REKAP NILAI */}
                    <div
                      style={{
                        fontWeight: "900",
                        fontSize: 11,
                        textAlign: "center",
                        textTransform: "uppercase",
                        lineHeight: 1.4,
                      }}
                    >
                      REKAP NILAI
                    </div>
                    <div
                      style={{
                        fontWeight: "900",
                        fontSize: 11,
                        textAlign: "center",
                        textTransform: "uppercase",
                        lineHeight: 1.4,
                      }}
                    >
                      {data.event?.event_name || "NAMA EVENT"}
                    </div>
                    {/* <div
                      style={{
                        fontSize: 9,
                        textAlign: "center",
                        color: "#555",
                        marginTop: 1,
                      }}
                    >
                      {data.event?.event_tempat}
                    </div> */}
                  </td>

                  {/* Center: waktu tampil */}
                  <td
                    style={{
                      border: "1.5px solid #000",
                      padding: "3px 8px",
                      width: "14%",
                      verticalAlign: "middle",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: "bold" }}>
                      Waktu Tampil
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: "900",
                        color: "#c00",
                        fontStyle: "italic",
                      }}
                    >
                      {data.teamInfo?.waktu_tampil || "-"}
                    </div>
                  </td>

                  {/* Right: no tampil + nama sekolah */}
                  <td
                    style={{
                      border: "1.5px solid #000",
                      padding: "3px 8px",
                      width: "48%",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: "#555",
                        textTransform: "uppercase",
                      }}
                    >
                      NAMA SEKOLAH
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: "900",
                        color: "#c00",
                        fontStyle: "italic",
                      }}
                    >
                      {nomorTampil}. {teamInstansi}
                    </div>
                    <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
                      {teamName}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ════ BODY: 2 columns ════ */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              {/* ── LEFT COLUMN: PBB + Komandan ── */}
              <div>
                {/* PBB table */}
                <div style={sectionTitle}>PENILAIAN PBB</div>
                <JuriTable juriList={pbbJuris} aspectFilter={isPBB} />
                <JuriLegend juriList={pbbJuris} label="Juri PBB" />

                {/* Danton / Komandan */}
                <KomandanTable juriList={dantonJuris} />
                <JuriLegend juriList={dantonJuris} label="Juri Komandan" />
              </div>

              {/* ── RIGHT COLUMN: Variasi + Formasi + Penalty + Final ── */}
              <div>
                {/* Variasi + Formasi table */}
                <div style={sectionTitle}>VARIASI & FORMASI</div>
                <JuriTable
                  juriList={varForJuris}
                  aspectFilter={isVariasiFormasi}
                />
                <JuriLegend
                  juriList={varForJuris}
                  label="Juri Variasi & Formasi"
                />

                {/* Penalty */}
                <div style={{ marginTop: 8 }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            ...thStyle,
                            background: "#cc0000",
                            color: "#fff",
                            textAlign: "left",
                            paddingLeft: 6,
                          }}
                        >
                          PENALTY
                        </th>
                        <th
                          style={{
                            ...thStyle,
                            background: "#cc0000",
                            color: "#fff",
                            width: 40,
                          }}
                        >
                          POIN
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {penaltyDetails.length > 0 ? (
                        penaltyDetails.map((p, i) => (
                          <tr key={p.id || i}>
                            <td style={{ ...tdSm, textAlign: "left" }}>
                              {p.event_penalty?.nama_pelanggaran || p.catatan}
                            </td>
                            <td
                              style={{
                                ...tdSm,
                                textAlign: "center",
                                color: "#c00",
                                fontWeight: "bold",
                              }}
                            >
                              {p.total_pengurangan}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              ...tdSm,
                              textAlign: "center",
                              fontStyle: "italic",
                              color: "#888",
                            }}
                          >
                            Tidak ada pelanggaran/penalti
                          </td>
                        </tr>
                      )}
                      <tr style={{ background: "#f0f0f0" }}>
                        <td
                          style={{
                            ...tdSm,
                            fontWeight: "bold",
                            textAlign: "right",
                            paddingRight: 6,
                          }}
                        >
                          TOTAL PENALTY
                        </td>
                        <td
                          style={{
                            ...tdSm,
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "#c00",
                          }}
                        >
                          {penalti > 0 ? `-${penalti}` : "0"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Final totals */}
                <div style={{ marginTop: 6 }}>
                  <table style={tableStyle}>
                    <tbody>
                      <tr style={{ background: "#f5f5f5" }}>
                        <td
                          style={{
                            ...tdSm,
                            fontWeight: "bold",
                            textAlign: "right",
                            paddingRight: 6,
                          }}
                        >
                          TOTAL NILAI PERINGKAT (PBB+DANTON-PENALTY)
                        </td>
                        <td
                          style={{
                            ...tdSm,
                            textAlign: "center",
                            fontWeight: "900",
                            fontSize: 11,
                          }}
                        >
                          {totalPBB + totalDanton - penalti}
                        </td>
                      </tr>
                      <tr
                        style={{
                          background: "#fff9e6",
                          borderTop: "2px solid #888",
                        }}
                      >
                        <td
                          style={{
                            ...tdSm,
                            fontWeight: "bold",
                            textAlign: "right",
                            paddingRight: 6,
                            fontSize: 10,
                          }}
                        >
                          TOTAL NILAI UMUM (PBB+DANTON+VARFOR-PENALTY)
                        </td>
                        <td
                          style={{
                            ...tdSm,
                            textAlign: "center",
                            fontWeight: "900",
                            fontSize: 13,
                            fontStyle: "italic",
                            color: "#c00",
                          }}
                        >
                          {totalPBB + totalDanton + totalVarFor - penalti}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signature row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 14,
                    fontSize: 9,
                    color: "#555",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: 24 }}>Peserta</div>
                    <div
                      style={{
                        borderTop: "1px solid #999",
                        paddingTop: 2,
                        minWidth: 100,
                        textAlign: "center",
                      }}
                    >
                      (.................................)
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: 24 }}>Tim Rekap</div>
                    <div
                      style={{
                        borderTop: "1px solid #999",
                        paddingTop: 2,
                        minWidth: 120,
                        textAlign: "center",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
