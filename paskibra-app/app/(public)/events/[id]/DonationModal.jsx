"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Heart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/service/api";

export default function DonationModal({ eventId, teamId, teamName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [qrisData, setQrisData] = useState(null);
  const [referenceId, setReferenceId] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerateQris = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/events/public/qris", {
        event_id: eventId,
        team_id: teamId,
        amount: Number(amount),
      });
      const data = response.data;
      setQrisData(data.qris);
      setReferenceId(data.referenceId);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal memproses E-Voting",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (referenceId && !isSuccess) {
      interval = setInterval(async () => {
        try {
          const response = await api.get(
            `/events/public/donations/${referenceId}/status`,
          );
          if (response.data.status === "PAID") {
            setIsSuccess(true);
            clearInterval(interval);
            router.refresh(); // Refresh data halaman untuk update poin di tabel secara realtime
          }
        } catch (error) {
          console.error(
            "Gagal mengecek status donasi:",
            error.response?.data?.message || error.message,
          );
        }
      }, 3000); // Polling pengecekan status setiap 3 detik
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [referenceId, isSuccess, router]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setQrisData(null);
          setAmount("");
          setReferenceId(null);
          setIsSuccess(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-pink-600 hover:bg-pink-700 text-white shadow-sm cursor-pointer"
        >
          <Heart className="mr-2 h-4 w-4" /> E-Voting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>E-Voting untuk {teamName}</DialogTitle>
        </DialogHeader>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-500 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pembayaran Berhasil!
            </h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 px-4">
              Terima kasih atas dukungan E-Voting Anda untuk <b>{teamName}</b>.
            </p>
            <Button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Tutup
            </Button>
          </div>
        ) : !qrisData ? (
          <form onSubmit={handleGenerateQris} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nominal E-Voting (Rp)
              </label>
              <Input
                type="number"
                min="1000"
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <div className="flex gap-2 pt-2">
                {[10000, 50000, 100000].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant={amount === String(val) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(String(val))}
                    className="flex-1 text-xs"
                  >
                    Rp {val.toLocaleString("id-ID")}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !amount}
            >
              {loading ? "Memuat..." : "Lanjut Pembayaran"}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              Scan QRIS Berikut
            </h3>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              E-Voting Donasi untuk <b>{teamName}</b> sebesar{" "}
              <b className="text-pink-600 font-bold">
                Rp {Number(amount).toLocaleString("id-ID")}
              </b>
            </p>
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
              {(() => {
                const qrString =
                  typeof qrisData === "string"
                    ? qrisData
                    : qrisData?.qr_string || qrisData?.qr_code || "";
                return (
                  <>
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrString)}&size=250x250`}
                      alt="QRIS E-Voting"
                      width={220}
                      height={220}
                      className="rounded-md"
                    />
                    {/* {qrisData?.nmid && (
                      <p className="text-[11px] text-gray-600 mt-2 font-mono font-medium">
                        NMID: {qrisData.nmid}
                      </p>
                    )} */}
                  </>
                );
              })()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Menunggu pembayaran... (Otomatis terverifikasi)</span>
            </div>
            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 max-w-xs">
              Dapat di-scan menggunakan M-Banking (BCA, Mandiri, BRI, BNI, dll) atau E-Wallet (Gopay, OVO, Dana, ShopeePay, LinkAja).
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setQrisData(null);
                setAmount("");
                setReferenceId(null);
              }}
              className="mt-2 w-full text-xs"
            >
              Kembali / Ulangi E-Voting
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
