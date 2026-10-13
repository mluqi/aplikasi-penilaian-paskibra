const { Donations, Events, Teams, Event_teams } = require("../models");
const { logAktivitas } = require("../services/logService");

const handleXenditWebhook = async (req, res) => {
  const payload = req.body;

  if (payload.event === "qr.payment") {
    const paymentData = payload.data;

    const orderId = paymentData.reference_id;
    const status = paymentData.status;
    const amount = paymentData.amount;
    const source = paymentData.payment_detail?.source || "QRIS";

    console.log(
      `Log: Order ${orderId} statusnya adalah ${status} via ${source}`,
    );

    // 1. Catat Log secara universal (semua status: SUCCEEDED, FAILED, EXPIRED)
    await logAktivitas({
      target: orderId || "Unknown",
      action: `Webhook Xendit - ${status}`,
      detail: `Menerima callback qr.payment dengan status: ${status}`,
      query: JSON.stringify(payload, null, 2),
      owner: "System",
    });

    try {
      const data = await Donations.findOne({
        where: { donation_id: orderId },
      });

      if (!data) {
        console.error(`Order dengan ID ${orderId} tidak ditemukan.`);
        return res.status(404).send("Order Not Found");
      }

      if (status === "SUCCEEDED") {
        await Donations.update(
          {
            amount: amount,
            xendit_transaction_id: paymentData.id,
            payment_status: "PAID",
            payment_method: source,
            webhook_data: JSON.stringify(payload),
          },
          { where: { donation_id: orderId } },
        );

        // Update saldo/balance tim secara real-time
        const eventTeam = await Event_teams.findOne({
          where: { event_id: data.event_id, team_id: data.team_id },
        });
        if (eventTeam) {
          await eventTeam.update({
            balance: Number(eventTeam.balance || 0) + Number(amount),
          });
        }
        console.log(`✅ Pembayaran Berhasil Diperoses untuk Order: ${orderId}`);
      } else if (status === "FAILED" || status === "EXPIRED") {
        await Donations.update(
          {
            xendit_transaction_id: paymentData.id,
            payment_status: status,
            payment_method: source,
            webhook_data: JSON.stringify(payload),
          },
          { where: { donation_id: orderId } },
        );
        console.log(`❌ Pembayaran ${status} untuk Order: ${orderId}`);
      }
    } catch (err) {
      console.error("Gagal update database:", err);
      return res.status(500).send("Database Error");
    }
  } else {
    // 2. Log fallback jika event webhook selain "qr.payment" (misal invoice, dsb) masuk
    await logAktivitas({
      target: payload.id || "Unknown",
      action: `Webhook Xendit - ${payload.event || "UNKNOWN_EVENT"}`,
      detail: "Menerima event webhook lain yang tidak ditangani spesifik",
      query: JSON.stringify(payload, null, 2),
      owner: "System",
    });
  }

  res.status(200).send("OK");
};

module.exports = handleXenditWebhook;
