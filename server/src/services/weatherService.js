const axios = require("axios");

const getWeather = async (lat, lon) => {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    // Return mock data if no API key is provided
    return {
      temp: 28,
      condition: "Sunny",
      icon: "sunny-outline",
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: getWeatherIcon(data.weather[0].main),
    };
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    return { temp: 28, condition: "Partly Cloudy", icon: "cloud-outline" };
  }
};

const getWeatherIcon = (condition) => {
  const map = {
    Clear: "sunny-outline",
    Clouds: "cloud-outline",
    Rain: "rainy-outline",
    Snow: "snow-outline",
    Drizzle: "rainy-outline",
    Thunderstorm: "thunderstorm-outline",
  };
  return map[condition] || "cloud-outline";
};

module.exports = { getWeather };
