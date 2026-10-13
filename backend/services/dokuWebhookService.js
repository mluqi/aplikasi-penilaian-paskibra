const crypto = require("crypto");
const { Donations, Event_teams } = require("../models");
const { logAktivitas } = require("./logService");

/**
 * Verify HTTP Notification Authenticity (Signature Check)
 * Signature Components:
 * Client-Id:<client_id>
 * Request-Id:<request_id>
 * Request-Timestamp:<request_timestamp>
 * Request-Target:<request_target>
 * Digest:<digestBase64>
 */
const verifyDokuSignature = (req) => {
  const secretKey = process.env.DOKU_SECRET_KEY;
  if (!secretKey) return true; // Skip if secret key not configured

  const headers = req.headers;
  const clientId = headers["client-id"] || headers["Client-Id"];
  const requestId = headers["request-id"] || headers["Request-Id"];
  const requestTimestamp =
    headers["request-timestamp"] || headers["Request-Timestamp"];
  const signatureHeader = headers["signature"] || headers["Signature"];

  if (!signatureHeader || !clientId || !requestId || !requestTimestamp) {
    return false;
  }

  // Target path e.g. /api/webhook/doku
  const requestTarget = (req.originalUrl || req.path).split("?")[0];

  // Generate Digest (SHA-256 base64 of JSON Body)
  const bodyString =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
  const digest = crypto
    .createHash("sha256")
    .update(bodyString, "utf8")
    .digest("base64");

  // Construct raw signature string
  const signatureComponents =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestTarget}\n` +
    `Digest:${digest}`;

  const signatureHmacSha256 = crypto
    .createHmac("sha256", secretKey)
    .update(signatureComponents, "utf8")
    .digest("base64");

  const expectedSignature = `HMACSHA256=${signatureHmacSha256}`;

  return (
    signatureHeader === expectedSignature || signatureHeader === signatureHmacSha256
  );
};

/**
 * Memproses notifikasi callback / webhook dari DOKU
 * @param {Object} payload - Object JSON payload dari DOKU notification
 * @param {Object} [req] - Express request object (optional, untuk verifikasi signature)
 */
const processDokuNotification = async (payload, req = null) => {
  const invoiceNumber =
    payload.order?.invoice_number ||
    payload.response?.payment?.invoice_number ||
    payload.invoice_number;

  const status = (
    payload.transaction?.status ||
    payload.response?.payment?.status ||
    payload.status ||
    ""
  ).toUpperCase();

  const amount =
    payload.order?.amount ||
    payload.transaction?.amount ||
    payload.response?.payment?.amount;

  const approvalCode =
    payload.emoney_payment?.approval_code ||
    payload.virtual_account_info?.virtual_account_number ||
    payload.transaction?.original_request_id ||
    null;

  const donorName =
    payload.customer?.name?.trim() ||
    payload.customer?.email ||
    null;

  const paymentChannel =
    payload.channel?.name ||
    payload.channel?.id ||
    payload.service?.name ||
    payload.service?.id ||
    payload.acquirer?.name ||
    "DOKU QRIS";

  // 1. Selalu catat log aktivitas webhook
  await logAktivitas({
    target: invoiceNumber || "Unknown",
    action: `Webhook DOKU - ${status || "NOTIFICATION"}`,
    detail: `Menerima notification DOKU [${payload.service?.name || payload.service?.id || "QRIS"}] dengan status: ${status}`,
    query: JSON.stringify(payload, null, 2),
    data: {
      reference_id: invoiceNumber || null,
      doku_id: approvalCode || invoiceNumber || null,
      amount,
      status: status || "RECEIVED",
    },
    owner: "System",
  });

  if (!invoiceNumber) {
    console.error("[DOKU Webhook] Payload missing order.invoice_number");
    return { success: false, code: 400, message: "Missing order invoice_number" };
  }

  // 2. Cari transaksi di database berdasarkan invoice_number (donation_id)
  const donation = await Donations.findOne({
    where: { donation_id: invoiceNumber },
  });

  if (!donation) {
    console.error(
      `[DOKU Webhook] Donation with invoice_number ${invoiceNumber} not found.`,
    );
    return { success: false, code: 404, message: "Donation Not Found" };
  }

  // 3. Hindari proses berulang jika transaksi sudah PAID (Idempotency)
  if (donation.payment_status === "PAID") {
    console.log(
      `[DOKU Webhook] Donation ${invoiceNumber} already in state (PAID). Skipping duplicate update.`,
    );
    return { success: true, code: 200, message: "Already Paid" };
  }

  // 4. Update status transaksi jika pembayaran SUKSES
  if (status === "SUCCESS" || status === "SUCCESSFUL") {
    const finalAmount = Number(amount) || Number(donation.amount);

    console.log(`✅ [DOKU Webhook] Payment SUCCESS for donation ${invoiceNumber}. Amount: ${finalAmount}`);

    await Donations.update(
      {
        amount: finalAmount,
        payment_status: "PAID",
        xendit_transaction_id: approvalCode || donation.xendit_transaction_id,
        payment_method: paymentChannel,
        webhook_data: JSON.stringify(payload),
      },
      { where: { donation_id: invoiceNumber } },
    );

    // Update saldo / poin tim secara real-time di tabel Event_teams
    const eventTeam = await Event_teams.findOne({
      where: { event_id: donation.event_id, team_id: donation.team_id },
    });

    if (eventTeam) {
      await eventTeam.update({
        balance: Number(eventTeam.balance || 0) + finalAmount,
      });
      console.log(
        `✅ [DOKU Webhook] Saldo tim ${donation.team_id} berhasil ditambah: +${finalAmount} (Total: ${Number(eventTeam.balance || 0) + finalAmount})`,
      );
    }

    return { success: true, code: 200, message: "Payment Processed Successfully" };
  } else if (status === "FAILED" || status === "EXPIRED") {
    console.log(`❌ [DOKU Webhook] Payment ${status} for donation ${invoiceNumber}.`);
    await Donations.update(
      {
        payment_status: status,
        webhook_data: JSON.stringify(payload),
      },
      { where: { donation_id: invoiceNumber } },
    );
    return { success: true, code: 200, message: `Status updated to ${status}` };
  }

  return { success: true, code: 200, message: "Notification Handled" };
};

/**
 * Controller Express untuk Endpoint Callback / Webhook DOKU
 */
const handleDokuWebhook = async (req, res) => {
  const payload = req.body || {};

  // 1. Verify Authenticity jika di production
  const isValidSignature = verifyDokuSignature(req);
  if (!isValidSignature && process.env.DOKU_ENV === "production") {
    const invoiceNumber =
      payload.order?.invoice_number ||
      payload.response?.payment?.invoice_number ||
      payload.invoice_number;

    console.warn(`[DOKU Webhook] Invalid Signature for order: ${invoiceNumber}`);
    await logAktivitas({
      target: invoiceNumber || "Unknown",
      action: "Webhook DOKU - INVALID_SIGNATURE",
      detail: "Gagal memverifikasi signature webhook DOKU",
      query: JSON.stringify({ headers: req.headers, body: payload }, null, 2),
      owner: "System",
    });
    return res.status(401).json({ message: "Invalid Signature" });
  }

  try {
    const result = await processDokuNotification(payload, req);
    return res.status(result.code || 200).json({ message: result.message || "SUCCESS" });
  } catch (error) {
    console.error("[DOKU Webhook] Error processing notification:", error.message);
    await logAktivitas({
      target: payload.order?.invoice_number || "Unknown",
      action: "Webhook DOKU - PROCESSING_ERROR",
      detail: `Terjadi error saat memproses webhook: ${error.message}`,
      query: JSON.stringify(payload, null, 2),
      owner: "System",
    });
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = handleDokuWebhook;