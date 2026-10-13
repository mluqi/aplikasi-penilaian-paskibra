import React, { forwardRef } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const CertificateLayout = forwardRef(({ certificates = [], event = {} }, ref) => {
  if (!event || certificates.length === 0) return null;

  const eventName = event.event_name || "Event";
  const eventTempat = event.event_tempat || "-";
  const eventTanggal = event.event_tanggal
    ? format(new Date(event.event_tanggal), "d MMMM yyyy", { locale: localeId })
    : "-";
  const koordinatorNama = event.User?.user_name || "Koordinator Event";
  const penyelenggara = event.event_penyelenggara || "Palindo Indonesia";

  return (
    <div
      ref={ref}
      className="certificate-print-container w-full bg-slate-900/5 p-0 text-black print:bg-white"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {certificates.map((cert, index) => {
        const { recipientName, instansiName, predikat, certificateNo } = cert;

        return (
          <div
            key={index}
            className="certificate-page relative mx-auto my-0 box-border bg-white flex flex-col justify-between overflow-hidden shadow-2xl print:shadow-none print:my-0 print:mx-auto"
            style={{
              width: "297mm",
              height: "210mm",
              padding: "24mm",
              pageBreakAfter: index < certificates.length - 1 ? "always" : "auto",
              breakAfter: index < certificates.length - 1 ? "page" : "auto",
            }}
          >
            {/* Elegant Border */}
            <div className="absolute inset-[10mm] border-4 border-double border-amber-500 rounded-sm pointer-events-none" />
            <div className="absolute inset-[12mm] border border-amber-600/30 rounded-sm pointer-events-none" />

            {/* Corner Ornaments */}
            {/* Top-Left */}
            <div className="absolute top-[12mm] left-[12mm] w-12 h-12 border-t-4 border-l-4 border-amber-600 pointer-events-none" />
            <div className="absolute top-[15mm] left-[15mm] w-8 h-8 border-t border-l border-amber-500/70 pointer-events-none" />
            {/* Top-Right */}
            <div className="absolute top-[12mm] right-[12mm] w-12 h-12 border-t-4 border-r-4 border-amber-600 pointer-events-none" />
            <div className="absolute top-[15mm] right-[15mm] w-8 h-8 border-t border-r border-amber-500/70 pointer-events-none" />
            {/* Bottom-Left */}
            <div className="absolute bottom-[12mm] left-[12mm] w-12 h-12 border-b-4 border-l-4 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-[15mm] left-[15mm] w-8 h-8 border-b border-l border-amber-500/70 pointer-events-none" />
            {/* Bottom-Right */}
            <div className="absolute bottom-[12mm] right-[12mm] w-12 h-12 border-b-4 border-r-4 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-[15mm] right-[15mm] w-8 h-8 border-b border-r border-amber-500/70 pointer-events-none" />

            {/* Background Faint Watermark (Shield Ornament) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <svg
                width="600"
                height="600"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-amber-700"
              >
                <path d="M12 2L2 7v6c0 5.52 4.48 10 10 10s10-4.48 10-10V7L12 2zm0 18c-4.41 0-8-3.59-8-8V8.38l8-4 8 4V12c0 4.41-3.59 8-8 8z" />
              </svg>
            </div>

            {/* Top Header Section */}
            <div className="text-center z-10">
              <p className="text-[11px] tracking-[0.2em] font-sans font-bold uppercase text-amber-800/80 mb-1">
                Aplikasi Penilaian Lomba Indonesia
              </p>
              <h1 className="text-4xl font-extrabold tracking-[0.15em] text-slate-800 font-sans uppercase mb-1 drop-shadow-sm">
                Sertifikat Penghargaan
              </h1>
              <p className="text-xs font-sans tracking-widest text-slate-500 uppercase font-medium">
                No. {certificateNo || `CERT/${event.event_id || "EVT"}/${index + 1}`}
              </p>
            </div>

            {/* Main Content Section */}
            <div className="text-center my-auto px-8 z-10 flex flex-col items-center justify-center gap-5">
              <p className="text-md italic text-slate-500 font-serif">
                Sertifikat ini dengan bangga diberikan kepada:
              </p>
              
              <div className="w-full flex flex-col items-center gap-1">
                <h2 className="text-4xl font-extrabold text-amber-900 border-b-2 border-amber-200/50 pb-2 px-10 max-w-[85%] text-center leading-normal tracking-wide capitalize font-serif">
                  {recipientName}
                </h2>
                <p className="text-md font-sans font-semibold tracking-wider text-slate-700 mt-1">
                  {instansiName}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 max-w-[80%]">
                <p className="text-sm text-slate-600 font-serif leading-relaxed">
                  Atas partisipasi aktif dan pencapaian luar biasa sebagai
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-2 rounded-full shadow-sm">
                  <span className="text-lg font-sans font-extrabold text-amber-800 tracking-widest uppercase">
                    {predikat || "PESERTA"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-serif leading-relaxed mt-1">
                  dalam ajang <strong className="text-slate-700">{eventName}</strong> yang diselenggarakan di{" "}
                  <span className="underline decoration-dotted">{eventTempat}</span> pada tanggal {eventTanggal}.
                </p>
              </div>
            </div>

            {/* Footer Signatures Section */}
            <div className="flex justify-between items-end px-10 text-xs font-sans text-slate-700 z-10">
              <div className="text-center flex flex-col items-center">
                <p className="text-slate-500 mb-1">Mengesahkan,</p>
                <p className="font-bold uppercase tracking-wider mb-12">Koordinator Event</p>
                <div className="w-40 border-t border-slate-400 pt-1 text-center font-semibold">
                  {koordinatorNama}
                </div>
              </div>

              <div className="text-center flex flex-col items-center">
                <p className="text-slate-500 mb-1">{event.event_kota || "Bandung"}, {eventTanggal}</p>
                <p className="font-bold uppercase tracking-wider mb-12">Penyelenggara</p>
                <div className="w-40 border-t border-slate-400 pt-1 text-center font-semibold">
                  {penyelenggara}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

CertificateLayout.displayName = "CertificateLayout";

export default CertificateLayout;
