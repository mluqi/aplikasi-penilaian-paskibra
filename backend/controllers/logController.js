const { log_aktivitas, log_akses } = require("../models");
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
