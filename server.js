import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static("public"));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});


app.get("/api/user", async (req, res) => {
  try {

    const userRes = await axios.get("https://randomuser.me/api/");
    const u = userRes.data.results[0];

    const user = {
      firstName: u.name.first,
      lastName: u.name.last,
      gender: u.gender,
      age: u.dob.age,
      dob: u.dob.date,
      picture: u.picture.large,
      city: u.location.city,
      country: u.location.country,
      address: `${u.location.street.name}, ${u.location.street.number}`
    };


    const countryRes = await axios.get(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(user.country)}`
    );
    const c = countryRes.data[0];

    const country = {
      name: c.name.common,
      capital: c.capital ? c.capital[0] : "N/A",
      region: c.region || "N/A",
      currency: c.currencies ? Object.keys(c.currencies)[0] : "USD",
      languages: c.languages ? Object.values(c.languages).join(", ") : "N/A",
      flag: c.flags?.png || ""
    };

    
    let exchange = { USD: 1, KZT: 495 }; // fallback

try {
  const rateRes = await axios.get(
    `https://api.exchangerate.host/latest?base=${country.currency}&symbols=USD,KZT`
  );

  exchange.USD = rateRes.data.rates.USD ?? 1;
  exchange.KZT = rateRes.data.rates.KZT ?? 495;
} catch (err) {
  console.warn(`Exchange rate fetch failed for ${country.currency}: ${err.message}`);
}


    let news = [];
    if (process.env.NEWS_API_KEY) {
      try {
        const newsRes = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: country.name,
            language: "en",
            pageSize: 5,
            source:"bbc.news",
            apiKey: process.env.NEWS_API_KEY
          }
        });

        if (newsRes.data.status === "ok") {
          news = newsRes.data.articles.map(a => ({
            title: a.title,
            description: a.description,
            image: a.urlToImage,
            url: a.url
          }));
        }
      } catch {
        console.warn("News API failed");
      }
    }


    res.json({ user, country, exchange, news });

  } catch (err) {
    console.error("FATAL ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});