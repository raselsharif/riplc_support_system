const BrandBarService = require("../services/BrandBarService");
const https = require("https");

class BrandBarController {
  static async getSettings(req, res) {
    try {
      const settings = await BrandBarService.getSettings();
      res.json(settings || {
        logo_url: "",
        logo_public_id: "",
        company_name: "Republic Insurance",
        subtitle: "Support & IT Service Desk",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateSettings(req, res) {
    try {
      const { logo_url, logo_public_id, company_name, subtitle } = req.body;
      const settings = await BrandBarService.updateSettings({
        logo_url,
        logo_public_id,
        company_name,
        subtitle,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getWeather(req, res) {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.json({ enabled: false });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.json({ enabled: false });
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      https.get(url, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => { data += chunk; });
        apiRes.on("end", () => {
          try {
            const weather = JSON.parse(data);
            if (weather.cod !== 200) {
              return res.json({ enabled: true, error: weather.message });
            }
            res.json({
              enabled: true,
              temp: Math.round(weather.main.temp),
              description: weather.weather[0].description,
              icon: weather.weather[0].icon,
              city: weather.name,
              humidity: weather.main.humidity,
              feelsLike: Math.round(weather.main.feels_like),
            });
          } catch {
            res.status(500).json({ enabled: true, error: "Failed to parse weather data" });
          }
        });
      }).on("error", (err) => {
        res.status(500).json({ enabled: true, error: err.message });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = BrandBarController;
