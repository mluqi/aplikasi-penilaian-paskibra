const { log_aktivitas, log_akses, Donations } = require("../models");
const { Op } = require("sequelize");

/**
 * Helper function for pagination
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} - offset and limit for Sequelize query
 */
const getPagination = (page, limit) => {
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

/**
 * Helper function to format paginated data
 * @param {object} data - Data from Sequelize findAndCountAll
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} - Formatted paginated response
 */
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, data: rows, totalPages, currentPage };
};

/**
 * Get Activity Logs with filtering and pagination
 */
exports.getAktivitasLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      target,
      action,
      owner,
      startDate,
      endDate,
    } = req.query;

    const whereClause = {};
    if (target) whereClause.log_target = { [Op.like]: `%${target}%` };
    if (action) whereClause.log_action = { [Op.like]: `%${action}%` };
    if (owner) whereClause.log_owner = { [Op.like]: `%${owner}%` };
    if (startDate && endDate) {
      whereClause.log_record = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { limit: queryLimit, offset } = getPagination(page, parseInt(limit));

    const logs = await log_aktivitas.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      order: [["log_record", "DESC"]],
    });

    const response = getPagingData(logs, page, queryLimit);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Get Access Logs with filtering and pagination
 */
exports.getAksesLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      user,
      status,
      ip,
      startDate,
      endDate,
    } = req.query;

    const whereClause = {};
    if (user) whereClause.akses_user = { [Op.like]: `%${user}%` };
    if (status) whereClause.akses_status = status;
    if (ip) whereClause.akses_ip = { [Op.like]: `%${ip}%` };
    if (startDate && endDate) {
      whereClause.akses_record = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { limit: queryLimit, offset } = getPagination(page, parseInt(limit));

    const logs = await log_akses.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      order: [["akses_record", "DESC"]],
    });

    const response = getPagingData(logs, page, queryLimit);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching access logs:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Get API Logs with filtering and pagination
 */
exports.getApiLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      target,
      search,
      status,
      provider,
      type,
      startDate,
      endDate,
    } = req.query;

    const andConditions = [];

    if (type === "WEBHOOK") {
      andConditions.push({ log_action: { [Op.like]: "%Webhook%" } });
    } else if (type === "API") {
      if (status && status !== "all") {
        andConditions.push({ log_action: status });
      } else {
        andConditions.push({
          log_action: {
            [Op.in]: ["API_SUCCESS", "API_ERROR", "API_CALL"],
          },
        });
      }
    } else {
      andConditions.push({
        log_action: {
          [Op.or]: [
            "API_SUCCESS",
            "API_ERROR",
            "API_CALL",
            { [Op.like]: "%Webhook%" },
          ],
        },
      });
    }

    if (provider && provider !== "all") {
      if (provider === "DOKU") {
        andConditions.push({
          [Op.or]: [
            { log_target: { [Op.like]: "%DOKU%" } },
            { log_action: { [Op.like]: "%DOKU%" } },
            { log_target: "doku_logs" },
          ],
        });
      } else if (provider === "XENDIT") {
        andConditions.push({
          [Op.or]: [
            { log_target: { [Op.like]: "%Xendit%" } },
            { log_action: { [Op.like]: "%Xendit%" } },
          ],
        });
      }
    }

    const searchQuery = target || search;
    if (searchQuery) {
      andConditions.push({
        [Op.or]: [
          { log_target: { [Op.like]: `%${searchQuery}%` } },
          { log_detail: { [Op.like]: `%${searchQuery}%` } },
        ],
      });
    }

    if (startDate && endDate) {
      andConditions.push({
        log_record: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      });
    }

    const whereClause =
      andConditions.length > 0 ? { [Op.and]: andConditions } : {};

    const { limit: queryLimit, offset } = getPagination(page, parseInt(limit));

    const logs = await log_aktivitas.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      order: [["log_record", "DESC"]],
    });

    // Mengumpulkan semua log_target (Reference ID) yang merupakan event webhook DOKU/Xendit
    const donationIds = logs.rows
      .filter(
        (log) =>
          log.log_action &&
          log.log_action.includes("Webhook") &&
          log.log_target &&
          log.log_target !== "Unknown",
      )
      .map((log) => log.log_target);

    // Mencari data di tabel Donasi berdasarkan ID yang ditemukan
    let donationsMap = {};
    if (donationIds.length > 0) {
      const donations = await Donations.findAll({
        where: { donation_id: { [Op.in]: donationIds } },
      });
      donations.forEach((d) => {
        donationsMap[d.donation_id] = d;
      });
    }

    // Menyisipkan data Donasi dan Provider ke dalam source base64 (payload JSON)
    const modifiedRows = logs.rows.map((log) => {
      const logData = log.toJSON();

      const isDoku =
        (logData.log_action && logData.log_action.includes("DOKU")) ||
        (logData.log_target && logData.log_target.includes("DOKU")) ||
        logData.log_target === "doku_logs";

      const isXendit =
        (logData.log_action && logData.log_action.includes("Xendit")) ||
        (logData.log_target && logData.log_target.includes("Xendit"));

      logData.provider = isDoku ? "DOKU" : isXendit ? "XENDIT" : "SYSTEM";

      if (logData.log_target === "doku_logs") {
        if (
          logData.log_detail?.includes("qris") ||
          logData.log_detail?.includes("QRIS") ||
          logData.log_detail?.includes("generate_qris")
        ) {
          logData.log_target = "/checkout/v1/payment/generate-qris";
        } else if (
          logData.log_detail?.includes("check") ||
          logData.log_detail?.includes("Check") ||
          logData.log_detail?.includes("check_payment_status")
        ) {
          logData.log_target = "/checkout/v1/payment/check-status";
        } else {
          logData.log_target = "/checkout/v1/payment";
        }
      }

      if (logData.log_action && logData.log_action.includes("Webhook")) {
        logData.target_endpoint = isXendit
          ? "api/webhook/xendit"
          : "api/webhook/doku";

        if (donationsMap[logData.log_target]) {
          const donation = donationsMap[logData.log_target];
          logData.donation_id = donation.donation_id;
          logData.payment_status = donation.payment_status;
          logData.amount = donation.amount;

          if (donation.webhook_data) {
            logData.log_source = Buffer.from(donation.webhook_data).toString(
              "base64",
            );
          } else if (logData.log_query) {
            logData.log_source = Buffer.from(logData.log_query).toString(
              "base64",
            );
          } else {
            logData.log_source = "";
          }
        } else {
          logData.donation_id = logData.log_target;
          logData.payment_status = "UNKNOWN";
          logData.amount = 0;
          if (logData.log_query) {
            logData.log_source = Buffer.from(logData.log_query).toString(
              "base64",
            );
          }
        }
      }

      return logData;
    });

    const response = getPagingData(
      { count: logs.count, rows: modifiedRows },
      page,
      queryLimit,
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching API logs:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
