const { getWeather } = require("../services/weatherService");

const fetchWeather = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: "Latitude and Longitude are required." });
  }

  try {
    const weatherData = await getWeather(lat, lon);
    res.json({ success: true, data: weatherData });
  } catch (error) {
    console.error("fetchWeather error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch weather data." });
  }
};

module.exports = { fetchWeather };
