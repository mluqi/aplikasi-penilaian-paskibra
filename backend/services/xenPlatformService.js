const axios = require("axios");

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
  try {
    const response = await axios.post(
      `${url}/v2/accounts`,
      {
        email,
        type: "OWNED",
        public_profile: {
          business_name: businessName,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating XenPlatform account:",
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
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
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching account:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const createQrCode = async (referenceId, forUserId, amount) => {
  try {
    const payload = {
      reference_id: referenceId,
      type: "DYNAMIC",
      currency: "IDR",
      amount: amount,
    };
    const response = await axios.post(`${url}/qr_codes`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
        "api-version": "2022-07-31",
        "for-user-id": forUserId, 
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error creating QR Code:",
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
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
    console.log("Xendit Balance Response:", JSON.stringify(response.data, null, 2)); // Debug: Lihat data balance yang diterima
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching balance:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

module.exports = {
  createXenPlatformAccount,
  createQrCode,
  getAccountById,
  getBalance,
};
