const express = require("express");
const { fetchWeather } = require("../controllers/weatherController");
const router = express.Router();

router.get("/", fetchWeather);

module.exports = router;
