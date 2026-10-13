const { Users } = require("../models");
const { Op } = require("sequelize");

/**
 * Mendapatkan prefix ID berdasarkan role user
 */
const getRolePrefix = (user_role) => {
  if (user_role === "admin" || user_role === "superadmin") return "ADM";
  if (user_role === "koordinator_team") return "KOT";
  if (user_role === "koordinator_event") return "KOE";
  if (user_role === "asisten_juri") return "ASJ";
  if (user_role === "juri") return "JRI";
  if (user_role === "tmp") return "TMP";
  return user_role || "JRI";
};

/**
 * Generate user_id baru yang dijamin unik berdasarkan role / prefix
 * @param {string} userRoleOrPrefix - Role user (misal: 'koordinator_team') atau prefix langsung (misal: 'KOT', 'TMP')
 * @param {object|null} transaction - Transaksi Sequelize (opsional)
 * @returns {Promise<string>} user_id baru yang unik (misal: 'KOT0197')
 */
const generateNextUserId = async (userRoleOrPrefix, transaction = null) => {
  let prefix = getRolePrefix(userRoleOrPrefix);

  const usersWithPrefix = await Users.findAll({
    where: {
      user_id: { [Op.like]: `${prefix}%` },
    },
    attributes: ["user_id"],
    transaction,
    raw: true,
  });

  let maxNum = 0;
  for (const u of usersWithPrefix) {
    if (u.user_id) {
      const match = u.user_id.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  let nextNum = maxNum + 1;
  let candidateId = `${prefix}${String(nextNum).padStart(4, "0")}`;

  while (
    await Users.findOne({ where: { user_id: candidateId }, transaction })
  ) {
    nextNum++;
    candidateId = `${prefix}${String(nextNum).padStart(4, "0")}`;
  }

  return candidateId;
};

module.exports = {
  getRolePrefix,
  generateNextUserId,
};
