import React, { forwardRef } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const getKejuaraanTitle = (rank, templateStr) => {
  const defaultTemplate = [
    { name: "UTAMA", numbered: true },
    { name: "HARAPAN UTAMA", numbered: true },
    { name: "MADYA", numbered: true },
    { name: "HARAPAN MADYA", numbered: true },
    { name: "BINA", numbered: true },
    { name: "HARAPAN BINA", numbered: true },
    { name: "MULA", numbered: true },
    { name: "HARAPAN MULA", numbered: true },
    { name: "PURWA", numbered: true },
    { name: "HARAPAN PURWA", numbered: true },
    { name: "CARAKA", numbered: true },
    { name: "POTENSIAL", numbered: false },
  ];

  let activeTemplate = defaultTemplate;

  if (templateStr) {
    try {
      const parsed =
        typeof templateStr === "string" ? JSON.parse(templateStr) : templateStr;
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeTemplate = parsed.map((item) =>
          typeof item === "string" ? { name: item, numbered: true } : item,
        );
      }
    } catch (e) {
      console.error("Gagal mem-parsing kejuaraan_template", e);
    }
  }

  const blockIndex = Math.floor((rank - 1) / 3);
  if (blockIndex < activeTemplate.length) {
    const templateItem = activeTemplate[blockIndex];
    if (templateItem.numbered) {
      return `${templateItem.name} ${((rank - 1) % 3) + 1}`;
    }
    return templateItem.name;
  }
  if (activeTemplate.length > 0) {
    const lastItem = activeTemplate[activeTemplate.length - 1];
    if (!lastItem.numbered) return lastItem.name;
    return `${lastItem.name} ${((rank - 1) % 3) + 1}`;
  }
  return "-";
};

const PDFLayoutKlasemenRefactored = forwardRef(
  (
    {
      event,
      klasemenData,
      aspekHeaders = [],
      kategoriName = "JUARA UMUM",
      tipePenilaian = "aspek",
      jenisJuara = null,
      isJuaraUmumProp = false,
      showPenalty = false,
      nomorTampilMap = new Map(),
      allCategoryKlasemen = [],
      judgeWinners = {}, // Objek yang berisi pemenang per kategori juara
      limitJuara = null,
    },
    ref,
  ) => {
    if (!event || !klasemenData) return null;

    const categoryRankings = Array.isArray(allCategoryKlasemen)
      ? allCategoryKlasemen
      : [];
    const isJuaraUmum = kategoriName === "JUARA UMUM" || isJuaraUmumProp;

    return (
      <div
        ref={ref}
        className="bg-white text-black w-full"
        style={{
          padding: "15mm",
          fontFamily: "Arial, sans-serif",
          minHeight: "297mm",
        }}
      >
        {/* --- HEADER KOP SURAT --- */}
        <div className="text-center mb-6 border-b-2 border-black pb-3">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">
            HASIL KLASEMEN AKHIR
          </h1>
          <h2 className="text-xl font-bold uppercase mb-2">
            {event.event_name}
          </h2>
          <p className="text-sm">
            {event.event_tempat} |{" "}
            {event.event_tanggal &&
              format(new Date(event.event_tanggal), "EEEE, d MMMM yyyy", {
                locale: id,
              })}
          </p>
        </div>

        {/* --- TABEL KLASEMEN UTAMA --- */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-3">
            {isJuaraUmum
              ? "KLASEMEN UMUM"
              : `KLASEMEN ${String(kategoriName).toUpperCase()}`}
          </h3>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black px-2 py-2 text-center w-8">
                  NO.
                </th>
                <th className="border border-black px-2 py-2 text-left flex-1">
                  NAMA SEKOLAH / TIM
                </th>
                <th className="border border-black px-2 py-2 text-center w-12">
                  NOMOR TAMPIL
                </th>
                {aspekHeaders.map((aspek, idx) => (
                  <th
                    key={idx}
                    className="border border-black px-2 py-2 text-center w-16"
                  >
                    {aspek.toUpperCase()}
                  </th>
                ))}
                {showPenalty && (
                  <th className="border border-black px-2 py-2 text-center w-12">
                    PENALTY
                  </th>
                )}
                <th className="border border-black px-2 py-2 text-center w-12">
                  JUMLAH
                </th>
                {!isJuaraUmum && (
                  <th className="border border-black px-2 py-2 text-center w-20">
                    KEJUARAAN
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {klasemenData.map((item, index) => {
                const rank = index + 1;
                const teamId = item.team_id || item.id || item.Team?.team_id;
                const nomorTampil = nomorTampilMap.get(teamId);
                const displayNomor = nomorTampil
                  ? String(nomorTampil).padStart(2, "0")
                  : "-";
                const teamName = item.Team?.team_name || item.team_name || "-";
                const teamSekolah =
                  item.Team?.team_sekolah_instansi ||
                  item.team_sekolah_instansi ||
                  "-";

                return (
                  <tr key={teamId || index}>
                    <td className="border border-black px-2 py-1.5 text-center font-bold">
                      {rank}
                    </td>
                    <td className="border border-black px-2 py-1.5 font-semibold">
                      <div>{teamName}</div>
                      <div className="text-xs font-normal text-gray-600">
                        {teamSekolah}
                      </div>
                    </td>
                    <td className="border border-black px-2 py-1.5 text-center font-mono">
                      {displayNomor}
                    </td>
                    {aspekHeaders.map((aspekName) => (
                      <td
                        key={aspekName}
                        className="border border-black px-2 py-1.5 text-center"
                      >
                        {item.scores?.[aspekName] || 0}
                      </td>
                    ))}
                    {showPenalty && (
                      <td className="border border-black px-2 py-1.5 text-center text-red-600 font-bold">
                        {item.penalty?.total_pengurangan > 0
                          ? item.penalty.total_pengurangan
                          : 0}
                      </td>
                    )}
                    <td className="border border-black px-2 py-1.5 text-center font-bold">
                      {item.nilai_akhir || item.total || 0}
                    </td>
                    {!isJuaraUmum && (
                      <td className="border border-black px-2 py-1.5 text-center font-bold uppercase text-xs">
                        {limitJuara && rank > limitJuara
                          ? "-"
                          : (jenisJuara === "juara_peringkat" || tipePenilaian === "global"
                              ? getKejuaraanTitle(rank, event?.kejuaraan_template)
                              : `${kategoriName} TERBAIK ${rank}`)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --- JUDUL BAGIAN JUARA KATEGORI --- */}
        {categoryRankings.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4 mt-8">
              <h3 className="text-base font-bold">JUARA UMUM</h3>
              <h3 className="text-base font-bold">JUARA KATEGORI</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categoryRankings.map((category) => {
                const categoryName =
                  category.kategori ||
                  category.nama_kategori ||
                  category.id ||
                  "Kategori";
                const limitJuara = category.limit_juara
                  ? parseInt(category.limit_juara, 10)
                  : null;
                const rawKlasemen = Array.isArray(category.klasemen)
                  ? category.klasemen
                  : [];
                const klasemen =
                  limitJuara && limitJuara > 0
                    ? rawKlasemen.slice(0, limitJuara)
                    : rawKlasemen;
                const hasPenalty = category.kurangi_penalty;

                return (
                  <div key={categoryName}>
                    <div className="mb-2 text-sm font-semibold uppercase">
                      {categoryName}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border border-black px-2 py-2 text-center w-8">
                              NO.
                            </th>
                            <th className="border border-black px-2 py-2 text-left flex-1">
                              NAMA SEKOLAH / TIM
                            </th>
                            <th className="border border-black px-2 py-2 text-center w-12">
                              NOMOR TAMPIL
                            </th>
                            {hasPenalty && (
                              <th className="border border-black px-2 py-2 text-center w-12">
                                PENALTY
                              </th>
                            )}
                            <th className="border border-black px-2 py-2 text-center w-16">
                              TOTAL NILAI
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {klasemen.map((item, index) => {
                            const rank = index + 1;
                            const teamId =
                              item.team_id || item.id || item.Team?.team_id;
                            const nomorTampil = nomorTampilMap.get(teamId);
                            const displayNomor = nomorTampil
                              ? String(nomorTampil).padStart(2, "0")
                              : "-";
                            const teamName =
                              item.Team?.team_name ||
                              item.team_name ||
                              item.teamName ||
                              "-";
                            const teamSekolah =
                              item.Team?.team_sekolah_instansi ||
                              item.team_sekolah_instansi ||
                              "-";
                            const totalValue =
                              item.nilai_akhir ?? item.total ?? item.nilai ?? 0;

                            return (
                              <tr key={teamId || index}>
                                <td className="border border-black px-2 py-1.5 text-center font-bold">
                                  {rank}
                                </td>
                                <td className="border border-black px-2 py-1.5 font-semibold">
                                  <div>{teamName}</div>
                                  <div className="text-xs font-normal text-gray-600">
                                    {teamSekolah}
                                  </div>
                                </td>
                                <td className="border border-black px-2 py-1.5 text-center font-mono">
                                  {displayNomor}
                                </td>
                                {hasPenalty && (
                                  <td className="border border-black px-2 py-1.5 text-center text-red-600 font-bold">
                                    {item.penalty?.total_pengurangan > 0
                                      ? item.penalty.total_pengurangan
                                      : 0}
                                  </td>
                                )}
                                <td className="border border-black px-2 py-1.5 text-center font-bold">
                                  {totalValue}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* --- FOOTER / TANDA TANGAN --- */}
        <div className="flex justify-between items-start mt-16 pt-8 border-t-2 border-black">
          <div className="text-center">
            <p className="mb-12 text-sm">Mengetahui,</p>
            <p className="font-bold underline text-sm">Koordinator Event</p>
          </div>
          <div className="text-center">
            <p className="mb-12 text-sm">
              {event.event_kota || ".................."},{" "}
              {format(new Date(), "d MMMM yyyy", { locale: id })}
            </p>
            <p className="font-bold underline text-sm">Ketua Dewan Juri</p>
          </div>
        </div>
      </div>
    );
  },
);

PDFLayoutKlasemenRefactored.displayName = "PDFLayoutKlasemenRefactored";
export default PDFLayoutKlasemenRefactored;
