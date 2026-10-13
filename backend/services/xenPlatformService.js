const axios = require("axios");
const { logAktivitas } = require("./logService");

const url = "https://api.xendit.co";

const getAuthHeader = () => {
  const apiKey = process.env.XENDIT_API_KEY || "";
  // Memastikan API Key berakhiran titik dua (:) sesuai dokumentasi Xendit Basic Auth
  // (Cek jika user sudah terlanjur menaruh ':' di file .env agar tidak dobel)
  const keyWithColon = apiKey.endsWith(":") ? apiKey : `${apiKey}:`;
  console.log("Xendit API Key (with colon):", keyWithColon); // Debug: Pastikan format API Key benar
  console.log(
    "Xendit Auth Header:",
    `Basic ${Buffer.from(keyWithColon).toString("base64")}`,
  ); // Debug: Lihat hasil header otorisasi
  return `Basic ${Buffer.from(keyWithColon).toString("base64")}`;
};

const createXenPlatformAccount = async (email, businessName) => {
  const payload = {
    email,
    type: "OWNED",
    public_profile: {
      business_name: businessName,
    },
  };
  try {
    const response = await axios.post(`${url}/v2/accounts`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
    });

    logAktivitas({
      target: "Xendit API - Create Account",
      action: "API_SUCCESS",
      detail: `POST /v2/accounts - ${email}`,
      query: JSON.stringify({ payload, response: response.data }, null, 2),
      owner: "System",
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error creating XenPlatform account:",
      JSON.stringify(error.response?.data || error.message, null, 2),
    );

    logAktivitas({
      target: "Xendit API - Create Account",
      action: "API_ERROR",
      detail: `POST /v2/accounts - ${email}`,
      query: JSON.stringify(
        { payload, error: error.response?.data || error.message },
        null,
        2,
      ),
      owner: "System",
    });

    throw error;
  }
};

const getAccountById = async (accountId) => {
  try {
    const response = await axios.get(`${url}/v2/accounts/${accountId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
    });

    logAktivitas({
      target: "Xendit API - Get Account",
      action: "API_SUCCESS",
      detail: `GET /v2/accounts/${accountId}`,
      query: JSON.stringify({ response: response.data }, null, 2),
      owner: "System",
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching account:",
      error.response?.data || error.message,
    );

    logAktivitas({
      target: "Xendit API - Get Account",
      action: "API_ERROR",
      detail: `GET /v2/accounts/${accountId}`,
      query: JSON.stringify(
        { error: error.response?.data || error.message },
        null,
        2,
      ),
      owner: "System",
    });

    throw error;
  }
};

const createQrCode = async (referenceId, forUserId, amount) => {
  const payload = {
    reference_id: referenceId,
    type: "DYNAMIC",
    currency: "IDR",
    amount: amount,
  };
  try {
    const response = await axios.post(`${url}/qr_codes`, payload, {
      headers: {
        "Content-Type": "application/json",
        "webhook-url": process.env.XENDIT_WEBHOOK_URL || "",
        Authorization: getAuthHeader(),
        "api-version": "2022-07-31",
        "for-user-id": forUserId,
      },
    });
    console.log(
      "Xendit QR Code Headers:",
      JSON.stringify(response.config.headers, null, 2),
    ); // Debug: Lihat header yang dikirim
    console.log("Xendit QR Code Payload:", JSON.stringify(payload, null, 2)); // Debug: Lihat payload yang dikirim
    console.log(
      "Xendit QR Code Response:",
      JSON.stringify(response.data, null, 2),
    ); // Debug: Lihat data QR Code yang diterima

    logAktivitas({
      target: "Xendit API - Create QR Code",
      action: "API_SUCCESS",
      detail: `POST /qr_codes - ${referenceId}`,
      query: JSON.stringify({ payload, response: response.data }, null, 2),
      owner: "System",
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error creating QR Code:",
      JSON.stringify(error.response?.data || error.message, null, 2),
    );

    logAktivitas({
      target: "Xendit API - Create QR Code",
      action: "API_ERROR",
      detail: `POST /qr_codes - ${referenceId}`,
      query: JSON.stringify(
        { payload, error: error.response?.data || error.message },
        null,
        2,
      ),
      owner: "System",
    });

    throw error;
  }
};

const getBalance = async (accountId) => {
  try {
    const response = await axios.get(
      `${url}/balance?account_type=CASH&currency=IDR`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
          "for-user-id": accountId,
        },
      },
    );
    console.log(
      "Xendit Balance Response:",
      JSON.stringify(response.data, null, 2),
    ); // Debug: Lihat data balance yang diterima

    logAktivitas({
      target: "Xendit API - Get Balance",
      action: "API_SUCCESS",
      detail: `GET /balance - ${accountId}`,
      query: JSON.stringify({ response: response.data }, null, 2),
      owner: "System",
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching balance:",
      error.response?.data || error.message,
    );

    logAktivitas({
      target: "Xendit API - Get Balance",
      action: "API_ERROR",
      detail: `GET /balance - ${accountId}`,
      query: JSON.stringify(
        { error: error.response?.data || error.message },
        null,
        2,
      ),
      owner: "System",
    });

    throw error;
  }
};

module.exports = {
  createXenPlatformAccount,
  createQrCode,
  getAccountById,
  getBalance,
};
