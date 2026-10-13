const axios = require("axios");
const { Events, Event_teams } = require("../models");
const { getBalance } = require("../services/xenPlatformService");

const syncSaldo = async () => {
  try {
    const accoundData = await Event_teams.findAll({
      include: [
        {
          model: Events,
          attributes: ["event_id", "event_name"],
        },
      ],
    });

    for (const team of accoundData) {
      const balance = await getBalance(team.xenplatform_id);
      team.saldo = balance;
      await team.save();
    }

    console.log("Saldo synchronization completed successfully.");
  } catch (error) {
    console.error("Error during saldo synchronization:", error);
  }
};

module.exports = {
  syncSaldo,
};
