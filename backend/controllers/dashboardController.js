const { Users, Teams, Events, sequelize } = require("../models");

exports.getSummary = async (req, res) => {
  try {
    // Hanya admin yang bisa mengakses ini, jadi kita hitung semua data
    const userCount = await Users.count();
    const teamCount = await Teams.count();
    const eventCount = await Events.count();

    res.status(200).json({
      summary: {
        users: userCount,
        teams: teamCount,
        events: eventCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getEventStats = async (req, res) => {
  try {
    const [statusStats, kategoriStats, tingkatStats] = await Promise.all([
      // Hitung event berdasarkan status
      Events.findAll({
        attributes: [
          "event_status",
          [sequelize.fn("COUNT", sequelize.col("event_id")), "count"],
        ],
        group: ["event_status"],
        raw: true,
      }),
      // Hitung event berdasarkan kategori
      Events.findAll({
        attributes: [
          "event_kategori",
          [sequelize.fn("COUNT", sequelize.col("event_id")), "count"],
        ],
        group: ["event_kategori"],
        raw: true,
      }),
      // Hitung event berdasarkan tingkat
      Events.findAll({
        attributes: [
          "event_tingkat",
          [sequelize.fn("COUNT", sequelize.col("event_id")), "count"],
        ],
        group: ["event_tingkat"],
        raw: true,
      }),
    ]);

    res.status(200).json({
      statusStats,
      kategoriStats,
      tingkatStats,
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
