"use client";

import { useState, Fragment, useEffect } from "react";
import Image from "next/image";
import { Users, ChevronDown, X } from "lucide-react";
import DonationModal from "./DonationModal";
import { createPortal } from "react-dom";

export default function TeamList({ sortedTeams, hasActiveDonation, event }) {
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [photoModal, setPhotoModal] = useState({
    isOpen: false,
    url: "",
    alt: "",
  });
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === "Escape" && photoModal.isOpen) {
        setPhotoModal((prev) => ({ ...prev, isOpen: false }));
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [photoModal.isOpen]);

  // Portal mounting
  useEffect(() => {
    setMounted(true);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Kalkulasi status donasi dengan menggabungkan tanggal dan jam secara akurat
  const isDonationActive = (() => {
    if (!event || !event.donasi_mulai || !event.donasi_selesai) return false;
    const startDate = new Date(event.donasi_mulai);
    const endDate = new Date(event.donasi_selesai);
    return currentTime >= startDate && currentTime <= endDate;
  })();

  if (sortedTeams.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
        Belum ada tim peserta yang terdaftar.
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Table Layout */}
      <div className="hidden md:block overflow-auto max-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
            <tr className="border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
              <th className="py-3 px-4 font-medium text-center w-12">#</th>
              <th className="py-3 px-4 font-medium text-center w-28 whitespace-nowrap">
                No. Tampil
              </th>
              <th className="py-3 px-4 font-medium text-left">Tim Peserta</th>
              {hasActiveDonation && event.xenplatform_id && (
                <th className="py-3 px-4 font-medium text-right">Poin</th>
              )}
              <th className="py-3 px-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedTeams.map((item, index) => {
              const displayNomor =
                item.nomor_tampil !== undefined && item.nomor_tampil !== null
                  ? String(item.nomor_tampil).padStart(2, "0")
                  : "-";

              return (
                <Fragment key={item.team_id}>
                  <tr
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer group"
                    onClick={(e) => {
                      if (
                        e.target.tagName === "BUTTON" ||
                        e.target.closest("button")
                      )
                        return;
                      setExpandedTeamId(
                        expandedTeamId === item.team_id ? null : item.team_id,
                      );
                    }}
                    title="Klik untuk melihat foto tim"
                  >
                    <td className="py-4 px-4 text-center font-medium text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-gray-700 dark:text-gray-300">
                      {displayNomor}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        {item.Team.team_logo && (
                          <div className="flex-shrink-0 relative w-12 h-12">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}${item.Team.team_logo}`}
                              alt={`${item.Team.team_name} Logo`}
                              fill
                              className="rounded-full ring-2 ring-gray-100 dark:ring-gray-800 object-cover bg-white"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {item.Team.team_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                            {item.Team.team_sekolah_instansi}
                          </p>
                        </div>
                      </div>
                    </td>
                    {hasActiveDonation && event.xenplatform_id && (
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 font-bold text-sm text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 px-2.5 py-1 rounded-lg shadow-sm">
                          {Math.floor(
                            (Number(item.balance) || 0) / 1000,
                          ).toLocaleString("id-ID")}{" "}
                          Poin
                        </span>
                      </td>
                    )}
                    <td className="py-4 px-4 text-right">
                      {getActionComponent(
                        hasActiveDonation,
                        event,
                        isDonationActive,
                        item,
                      )}
                    </td>
                  </tr>
                  {/* Expandable Photo Row - Desktop */}
                  {expandedTeamId === item.team_id && (
                    <tr className="bg-gray-50/30 dark:bg-gray-800/10">
                      <td
                        colSpan={
                          hasActiveDonation && event.xenplatform_id ? 5 : 4
                        }
                        className="p-0 border-b border-gray-100 dark:border-gray-800"
                      >
                        <ExpandablePhotoContent
                          item={item}
                          setPhotoModal={setPhotoModal}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-4">
        {sortedTeams.map((item, index) => {
          const displayNomor =
            item.nomor_tampil !== undefined && item.nomor_tampil !== null
              ? String(item.nomor_tampil).padStart(2, "0")
              : null;

          return (
            <Fragment key={item.team_id}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Card Header - Clickable to toggle expandable section */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() =>
                    setExpandedTeamId(
                      expandedTeamId === item.team_id ? null : item.team_id,
                    )
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left Section: Logo + Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Index Badge */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
                        {index + 1}
                      </div>

                      {/* Logo */}
                      {item.Team.team_logo && (
                        <div className="flex-shrink-0 relative w-14 h-14">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}${item.Team.team_logo}`}
                            alt={`${item.Team.team_name} Logo`}
                            fill
                            className="rounded-lg ring-2 ring-gray-100 dark:ring-gray-700 object-cover bg-white"
                          />
                        </div>
                      )}

                      {/* Team Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {displayNomor && (
                            <span className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-700 dark:text-gray-300">
                              No. {displayNomor}
                            </span>
                          )}
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2">
                            {item.Team.team_name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                          {item.Team.team_sekolah_instansi}
                        </p>

                        {/* Points Badge - Mobile */}
                        {hasActiveDonation && event.xenplatform_id && (
                          <div className="mt-2 inline-flex items-center gap-1 font-bold text-xs text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 px-2 py-1 rounded-md">
                            {Math.floor(
                              (Number(item.balance) || 0) / 1000,
                            ).toLocaleString("id-ID")}{" "}
                            Poin
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section: Chevron */}
                    <div className="flex-shrink-0">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                          expandedTeamId === item.team_id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Content - Expandable (Photo Only) */}
                {expandedTeamId === item.team_id && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50">
                    {/* Photo Section */}
                    <ExpandablePhotoContentMobile
                      item={item}
                      setPhotoModal={setPhotoModal}
                    />
                  </div>
                )}

                {/* Card Footer - Always Visible on Mobile with Action */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                    {getDonationStatusLabel(
                      hasActiveDonation,
                      event,
                      isDonationActive,
                    )}
                  </p>
                  {getActionComponent(
                    hasActiveDonation,
                    event,
                    isDonationActive,
                    item,
                  )}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* Modal Foto Full Screen */}
      {mounted &&
        photoModal.isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
            onClick={() =>
              setPhotoModal((prev) => ({ ...prev, isOpen: false }))
            }
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {photoModal.url && (
                <>
                  <img
                    src={photoModal.url}
                    alt={photoModal.alt}
                    className="max-w-full max-h-screen w-auto h-auto object-contain"
                  />
                  {/* Close Button */}
                  <button
                    onClick={() =>
                      setPhotoModal((prev) => ({ ...prev, isOpen: false }))
                    }
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-10"
                    title="Tutup (ESC)"
                    aria-label="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// Helper Components
function ExpandablePhotoContent({ item, setPhotoModal }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border-t border-dashed border-gray-200 dark:border-gray-800">
      {item.Team.foto_all_team ? (
        <div className="w-full max-w-2xl">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${item.Team.foto_all_team}`}
            alt={`Foto Tim ${item.Team.team_name}`}
            width={800}
            height={400}
            className="w-full h-auto rounded-xl object-contain shadow-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setPhotoModal({
                isOpen: true,
                url: `${process.env.NEXT_PUBLIC_API_URL}${item.Team.foto_all_team}`,
                alt: `Foto Tim ${item.Team.team_name}`,
              });
            }}
            title="Klik untuk memperbesar foto"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-8">
          <Users className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Belum ada foto keseluruhan tim</p>
        </div>
      )}
    </div>
  );
}

function ExpandablePhotoContentMobile({ item, setPhotoModal }) {
  return (
    <div className="flex flex-col items-center justify-center">
      {item.Team.foto_all_team ? (
        <div className="w-full">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${item.Team.foto_all_team}`}
            alt={`Foto Tim ${item.Team.team_name}`}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg object-contain shadow-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setPhotoModal({
                isOpen: true,
                url: `${process.env.NEXT_PUBLIC_API_URL}${item.Team.foto_all_team}`,
                alt: `Foto Tim ${item.Team.team_name}`,
              });
            }}
            title="Ketuk untuk memperbesar foto"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-6">
          <Users className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-xs font-medium">Belum ada foto tim</p>
        </div>
      )}
    </div>
  );
}

// Helper function untuk render action component
function getActionComponent(hasActiveDonation, event, isDonationActive, item) {
  if (!hasActiveDonation || !event.xenplatform_id) {
    return (
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
        -
      </span>
    );
  }

  if (isDonationActive) {
    return (
      <DonationModal
        eventId={event.event_id}
        teamId={item.team_id}
        teamName={item.Team.team_name}
      />
    );
  }

  if (!isDonationActive) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 whitespace-nowrap">
        Ditutup
      </span>
    );
  }

  return (
    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
      Belum Aktif
    </span>
  );
}

// Helper function untuk donation status label
function getDonationStatusLabel(hasActiveDonation, event, isDonationActive) {
  if (!hasActiveDonation || !event.xenplatform_id) {
    return "Status";
  }

  if (isDonationActive) {
    return "Voting sekarang";
  }

  if (!isDonationActive) {
    return "Voting ditutup";
  }

  return "Belum aktif";
}
