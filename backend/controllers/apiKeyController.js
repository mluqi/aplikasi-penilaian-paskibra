const { apikey } = require("../models");
const { logAktivitas } = require("../services/logService");

const addApiKey = async (req, res) => {
  const { name, key } = req.body;

  if (!name || !key) {
    return res.status(400).json({ message: "Name and Key are required." });
  }

  // key diconvert ke base64 sebelum disimpan
  const encodedKey = Buffer.from(key).toString("base64");

  try {
    const newApiKey = await apikey.create({
      name,
      key: encodedKey,
      status: true,
    });

    await logAktivitas({
      target: newApiKey.id,
      action: "Create API Key",
      detail: `API key dengan nama ${name} berhasil dibuat.`,
      owner: req.user ? req.user.id : "System",
    });

    res.status(201).json(newApiKey);
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getAllApiKeys = async (req, res) => {
  try {
    const apiKeys = await apikey.findAll();
    res.status(200).json(apiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateApiKey = async (req, res) => {
  const { id } = req.params;
  const { name, key, status } = req.body;

  try {
    const updated = await apikey.update(
      { name, key, status },
      { where: { id } },
    );

    if (updated[0] === 1) {
      res.status(200).json({ message: "API key updated successfully." });
    } else {
      res.status(404).json({ message: "API key not found." });
    }
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteApiKey = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await apikey.destroy({ where: { id } });

    if (deleted) {
      res.status(200).json({ message: "API key deleted successfully." });
    } else {
      res.status(404).json({ message: "API key not found." });
    }
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  addApiKey,
  getAllApiKeys,
  updateApiKey,
  deleteApiKey,
};
