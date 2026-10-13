const axios = require("axios");
const crypto = require("crypto");
const { logAktivitas } = require("./logService");

// Ambil Konfigurasi DOKU dari Environment Variables
const getDokuConfig = () => {
  const baseUrl =
    process.env.DOKU_BASE_URL ||
    process.env.DOKU_BASE_URL_SANDBOX ||
    "https://api-sandbox.doku.com";

  return {
    baseUrl,
    clientId: process.env.DOKU_CLIENT_ID,
    secretKey: process.env.DOKU_SECRET_KEY,
    accountId: process.env.DOKU_ACCOUNT_ID,
    callbackUrl: process.env.DOKU_CALLBACK_URL,
  };
};

/**
 * Generate Digest untuk DOKU Signature (SHA-256 base64 dari JSON string body)
 * Persis sesuai Postman Pre-request:
 * CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(jsonBody)))
 */
const generateDigest = (jsonBody) => {
  const bodyString =
    typeof jsonBody === "string" ? jsonBody : JSON.stringify(jsonBody);
  return crypto.createHash("sha256").update(bodyString, "utf8").digest("base64");
};

/**
 * Generate HMAC-SHA256 Signature untuk DOKU Checkout V1
 * Persis sesuai Postman Pre-request Script:
 * Signature Components:
 * Client-Id:<client_id>
 * Request-Id:<request_id>
 * Request-Timestamp:<request_timestamp>
 * Request-Target:/checkout/v1/payment
 * Digest:<digestBase64>
 */
const generateSignature = (
  clientId,
  requestId,
  timestamp,
  requestTarget,
  digestBase64,
  secretKey,
) => {
  const signatureComponents =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${requestTarget}\n` +
    `Digest:${digestBase64}`;

  const signatureHmacSha256 = crypto
    .createHmac("sha256", secretKey)
    .update(signatureComponents, "utf8")
    .digest("base64");

  return `HMACSHA256=${signatureHmacSha256}`;
};

/**
 * Request Payment Checkout V1 ke DOKU
 * @param {Object} params
 * @param {Object} params.order - { amount, invoice_number, currency, callback_url }
 * @param {Object} params.customer - { name, email, phone, address, country }
 * @param {Object} [params.payment] - { payment_due_date } (dalam menit)
 * @param {Object} [params.additional_info] - { override_notification_url, account }
 */
const createPayment = async (params) => {
  const config = getDokuConfig();
  const requestTarget = "/checkout/v1/payment";
  const url = `${config.baseUrl}${requestTarget}`;

  // Generate Request-Id (UUID v4)
  const requestId = params.request_id || crypto.randomUUID();

  // Timestamp format ISO UTC: YYYY-MM-DDTHH:mm:ssZ (19 char + Z)
  const timestamp = new Date().toISOString().slice(0, 19) + "Z";

  // Susun payload request sesuai format Postman / DOKU Checkout V1
  const body = {
    order: {
      amount: params.order?.amount,
      invoice_number: params.order?.invoice_number,
      currency: params.order?.currency || "IDR",
      callback_url:
        params.order?.callback_url || config.callbackUrl || "https://palindo.id",
    },
    payment: {
      payment_due_date: params.payment?.payment_due_date || 30,
    },
    customer: {
      name: params.customer?.name || "palindo",
      email: params.customer?.email || "sys.dev@palindo.id",
      phone: params.customer?.phone || "+6289618643138",
      address: params.customer?.address || "Jl. Tuparev. 11 Soho Patra Park Blok B.5",
      country: params.customer?.country || "ID",
    },
    additional_info: {
      override_notification_url:
        params.additional_info?.override_notification_url ||
        process.env.DOKU_CALLBACK_URL ||
        undefined,
      account: {
        id: params.additional_info?.account?.id || config.accountId,
      },
    },
  };

  // Bersihkan properti undefined dari additional_info jika kosong
  if (!body.additional_info.override_notification_url) {
    delete body.additional_info.override_notification_url;
  }

  // Hitung Digest dan Signature dari Stringify JSON Body
  const jsonBodyString = JSON.stringify(body);
  const digestBase64 = generateDigest(jsonBodyString);
  const signature = generateSignature(
    config.clientId,
    requestId,
    timestamp,
    requestTarget,
    digestBase64,
    config.secretKey,
  );

  const headers = {
    "Client-Id": config.clientId,
    "Request-Id": requestId,
    "Request-Timestamp": timestamp,
    Signature: signature,
    "Content-Type": "application/json",
  };

  // Print Request Debugging
  console.log("\n================ [DEBUG DOKU REQUEST] ================");
  console.log("URL:", url);
  console.log("Config:", JSON.stringify({ clientId: config.clientId, baseUrl: config.baseUrl, isProduction: process.env.DOKU_ENV === "production" }, null, 2));
  console.log("Headers:", JSON.stringify(headers, null, 2));
  console.log("Body:", JSON.stringify(body, null, 2));
  console.log("Digest (Base64):", digestBase64);
  console.log("Signature:", signature);
  console.log("======================================================\n");

  let responseData = null;
  let httpCode = 500;
  let status = "FAILED";

  try {
    const response = await axios.post(url, body, { headers });
    responseData = response.data;
    httpCode = response.status;
    status =
      response.status === 200 || response.status === 201
        ? "SUCCESS"
        : "PENDING";

    console.log("\n================ [DEBUG DOKU SUCCESS RESPONSE] ================");
    console.log("HTTP Status:", httpCode);
    console.log("Response Data:", JSON.stringify(responseData, null, 2));
    console.log("===============================================================\n");

    return responseData;
  } catch (error) {
    responseData = error.response?.data || { error: error.message };
    httpCode = error.response?.status || 500;
    status = "FAILED";

    console.log("\n================ [DEBUG DOKU ERROR RESPONSE] ================");
    console.log("HTTP Status:", httpCode);
    console.log("Error Response Data:", JSON.stringify(responseData, null, 2));
    console.log("=============================================================\n");

    throw error;
  } finally {
    await logAktivitas({
      target: "DOKU API - Checkout Payment",
      action: status === "SUCCESS" ? "API_SUCCESS" : "API_ERROR",
      detail: `Checkout V1 Payment - Invoice: ${params.order?.invoice_number || "-"}`,
      data: {
        reference_id: params.order?.invoice_number || null,
        doku_id:
          responseData?.response?.payment?.token_id ||
          responseData?.response?.payment?.invoice_number ||
          responseData?.order?.invoice_number ||
          null,
        request_payload: body,
        response_payload: responseData,
        http_code: httpCode,
        status: status,
      },
      owner: "System",
    });
  }
};

/**
 * Generate QRIS Code dari token_id Checkout V1 DOKU
 * @param {string} tokenId - token_id yang didapat dari response checkout payment ['response']['payment']['token_id']
 * @param {string} [referenceId] - optional internal transaction_id untuk logging
 */
const generateQris = async (tokenId, referenceId = null) => {
  if (!tokenId) {
    throw new Error("token_id is required to generate QRIS");
  }

  const checkoutBaseUrl =
    process.env.DOKU_BASE_URL ||
    process.env.DOKU_BASE_URL_SANDBOX ||
    "https://api-sandbox.doku.com";

  const url = `${checkoutBaseUrl}/checkout/v1/payment/${tokenId}/generate-qris`;
  const body = {
    token_id: tokenId,
    bank: "qris",
  };

  const headers = {
    "Content-Type": "application/json",
  };

  console.log("\n================ [DEBUG QRIS REQUEST] ================");
  console.log("URL:", url);
  console.log("Headers:", JSON.stringify(headers, null, 2));
  console.log("Body:", JSON.stringify(body, null, 2));
  console.log("=====================================================\n");

  let responseData = null;
  let httpCode = 500;
  let status = "FAILED";

  try {
    const response = await axios.post(url, body, { headers });
    responseData = response.data;
    httpCode = response.status;
    status =
      response.status === 200 || response.status === 201
        ? "SUCCESS"
        : "PENDING";

    console.log("\n================ [DEBUG QRIS SUCCESS RESPONSE] ================");
    console.log("HTTP Status:", httpCode);
    console.log("Response Data:", JSON.stringify(responseData, null, 2));
    console.log("==============================================================\n");

    return responseData;
  } catch (error) {
    responseData = error.response?.data || { error: error.message };
    httpCode = error.response?.status || 500;
    status = "FAILED";

    console.log("\n================ [DEBUG QRIS ERROR RESPONSE] ================");
    console.log("HTTP Status:", httpCode);
    console.log("Error Response Data:", JSON.stringify(responseData, null, 2));
    console.log("============================================================\n");

    throw error;
  } finally {
    await logAktivitas({
      target: "DOKU API - Generate QRIS",
      action: status === "SUCCESS" ? "API_SUCCESS" : "API_ERROR",
      detail: `Generate QRIS - Token ID: ${tokenId}`,
      data: {
        reference_id: referenceId || null,
        doku_id: tokenId,
        request_payload: body,
        response_payload: responseData,
        http_code: httpCode,
        status: status,
      },
      owner: "System",
    });
  }
};

/**
 * Check Status Pembayaran Checkout V1 DOKU
 * @param {string} tokenId - token_id dari Checkout Payment DOKU
 */
const checkDokuPaymentStatus = async (tokenId) => {
  if (!tokenId) {
    throw new Error("token_id is required to check payment status");
  }

  const checkoutBaseUrl = "https://checkout.doku.com";

  const url = `${checkoutBaseUrl}/checkout/v1/payment/${tokenId}/check-status`;
  const body = {
    token_id: tokenId,
  };

  const headers = {
    "Content-Type": "application/json",
  };

  console.log("\n================ [DEBUG CHECK STATUS REQUEST] ================");
  console.log("URL:", url);
  console.log("Headers:", JSON.stringify(headers, null, 2));
  console.log("Body:", JSON.stringify(body, null, 2));
  console.log("==============================================================\n");

  let responseData = null;
  let httpCode = 500;
  let status = "FAILED";

  try {
    const response = await axios.post(url, body, { headers });
    responseData = response.data;
    httpCode = response.status;
    status = responseData?.status || "PENDING";

    console.log("\n================ [DEBUG CHECK STATUS SUCCESS RESPONSE] ================");
    console.log("HTTP Status:", httpCode);
    console.log("Response Data:", JSON.stringify(responseData, null, 2));
    console.log("=======================================================================\n");

    return responseData;
  } catch (error) {
    responseData = error.response?.data || { error: error.message };
    httpCode = error.response?.status || 500;
    status = "FAILED";

    console.log("\n================ [DEBUG CHECK STATUS ERROR RESPONSE] ================");
    console.log("HTTP Status:", httpCode);
    console.log("Error Response Data:", JSON.stringify(responseData, null, 2));
    console.log("=====================================================================\n");

    throw error;
  } finally {
    await logAktivitas({
      target: "DOKU API - Check Status",
      action: status === "SUCCESS" ? "API_SUCCESS" : "API_ERROR",
      detail: `Check Payment Status - Token ID: ${tokenId}`,
      data: {
        doku_id: tokenId,
        request_payload: body,
        response_payload: responseData,
        http_code: httpCode,
        status: status,
      },
      owner: "System",
    });
  }
};

module.exports = {
  createPayment,
  generateQris,
  checkDokuPaymentStatus,
  generateDigest,
  generateSignature,
};