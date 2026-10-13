import React, { forwardRef } from "react";

const PDFLayoutEVoting = forwardRef(({ event }, ref) => {
  if (!event || !event.Event_teams) return null;

  const teamsWithBalance = event.Event_teams.map((t) => ({
    nama: t.Team?.team_name || "-",
    instansi: t.Team?.team_sekolah_instansi || "-",
    nomor: t.nomor_tampil || "-",
    balance: Number(t.balance) || 0,
  })).sort((a, b) => b.balance - a.balance);

  const totalBalance = teamsWithBalance.reduce((sum, t) => sum + t.balance, 0);
  const teamsWithDonation = teamsWithBalance.filter((t) => t.balance > 0).length;
  const teamsWithoutDonation = teamsWithBalance.filter((t) => t.balance === 0).length;

  return (
    <div
      ref={ref}
      className="w-full bg-white text-black p-10 font-sans print:p-8"
    >
      {/* Header Print */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
          Rekapitulasi E-Voting
        </h1>
        <h2 className="text-lg font-semibold text-gray-800">
          {event.event_name}
        </h2>
      </div>

      {/* Table Data */}
      <table className="w-full border-collapse border border-gray-800 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-800 px-3 py-2 text-center w-16">
              Peringkat
            </th>
            <th className="border border-gray-800 px-3 py-2 text-center w-24">
              No. Tampil
            </th>
            <th className="border border-gray-800 px-3 py-2 text-left">
              Nama Tim
            </th>
            <th className="border border-gray-800 px-3 py-2 text-left">
              Asal Sekolah / Instansi
            </th>
            <th className="border border-gray-800 px-3 py-2 text-right">
              Total E-Voting
            </th>
          </tr>
        </thead>
        <tbody>
          {teamsWithBalance.map((t, idx) => (
            <tr key={idx}>
              <td className="border border-gray-800 px-3 py-2 text-center font-bold">
                {idx + 1}
              </td>
              <td className="border border-gray-800 px-3 py-2 text-center font-semibold">
                {t.nomor}
              </td>
              <td className="border border-gray-800 px-3 py-2">{t.nama}</td>
              <td className="border border-gray-800 px-3 py-2">{t.instansi}</td>
              <td className="border border-gray-800 px-3 py-2 text-right font-bold text-green-700">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(t.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="mt-6 flex justify-between items-start text-sm border-t-2 border-gray-800 pt-4">
        <div>
          <p className="font-bold mb-2 text-gray-800">Ringkasan E-Voting:</p>
          <table className="text-left text-sm">
            <tbody>
              <tr>
                <td className="pr-4 py-1">Tim Mendapat Voting</td>
                <td className="font-bold">: {teamsWithDonation} Tim</td>
              </tr>
              <tr>
                <td className="pr-4 py-1">Tim Tidak Mendapat Voting</td>
                <td className="font-bold">: {teamsWithoutDonation} Tim</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800 mb-2">Total Keseluruhan E-Voting</p>
          <p className="text-xl font-bold text-green-700">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalBalance)}
          </p>
        </div>
      </div>

      <div className="mt-8 text-right text-xs text-gray-500 italic">
        Dicetak pada: {new Date().toLocaleString("id-ID")}
      </div>
    </div>
  );
});

PDFLayoutEVoting.displayName = "PDFLayoutEVoting";

export default PDFLayoutEVoting;
