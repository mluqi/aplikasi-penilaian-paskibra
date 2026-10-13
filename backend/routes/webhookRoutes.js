const express = require("express");
const router = express.Router();
const handleXenditWebhook = require("../services/webhookService");
const handleDokuWebhook = require("../services/dokuWebhookService");

router.post("/xendit", handleXenditWebhook);
router.post("/doku", handleDokuWebhook);

module.exports = router;
