"use client";

import { useState } from "react";
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
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function DonationModal({ eventId, teamId, teamName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [qrisData, setQrisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQris = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/public/qris`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: eventId,
            team_id: teamId,
            amount: Number(amount),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setQrisData(data.qris);
    } catch (error) {
      toast.error(error.message || "Gagal memproses donasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setQrisData(null);
          setAmount("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-pink-600 hover:bg-pink-700 text-white shadow-sm"
        >
          <Heart className="mr-2 h-4 w-4" /> Donasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donasi untuk {teamName}</DialogTitle>
        </DialogHeader>
        {!qrisData ? (
          <form onSubmit={handleGenerateQris} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nominal Donasi (Rp)</label>
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
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <h3 className="font-semibold text-lg">Scan QRIS Berikut</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              {/* Render QRIS string menjadi QRCode secara on-the-fly melalui pihak ke-3 atau library image */}
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrisData.qr_string)}&size=250x250`}
                alt="QRIS Donasi"
                width={250}
                height={250}
                className="rounded-md"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setQrisData(null)}
              className="mt-4"
            >
              Selesai / Donasi Lagi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
