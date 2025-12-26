document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn");
  const output = document.getElementById("output");

  btn.addEventListener("click", async () => {
    output.innerHTML = "<p>Loading...</p>";

    try {
      // Получаем данные пользователя с сервера
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user data");

      const data = await res.json();
      const { user, country, exchange, news } = data;

      // Формируем HTML
      output.innerHTML = `
        <div class="profile">
          <img src="${user.picture}" alt="Profile Picture">
          <div>
            <h2>${user.firstName} ${user.lastName}</h2>
            <p><strong>Gender:</strong> ${user.gender}</p>
            <p><strong>Age:</strong> ${user.age}</p>
            <p><strong>City:</strong> ${user.city}</p>
            <p><strong>Country:</strong> ${user.country}</p>
            <p><strong>Address:</strong> ${user.address}</p>
          </div>
        </div>

        <div class="section">
          <h3>Country Info</h3>
          <div class="card">
            <p><strong>Capital:</strong> ${country.capital}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Languages:</strong> ${country.languages}</p>
            <p><strong>Currency:</strong> ${country.currency}</p>
            ${country.flag ? `<img src="${country.flag}" alt="Flag" width="120">` : ""}
          </div>
        </div>

        <div class="section">
          <h3>Exchange Rate</h3>
          <div class="card">
            <p>1 ${country.currency} = ${exchange.USD} USD</p>
            <p>1 ${country.currency} = ${exchange.KZT} KZT</p>
          </div>
        </div>

        <div class="section">
          <h3>News</h3>
          ${
            news && news.length > 0
              ? news.map(n => `
                <div class="news-card card">
                  <h4>${n.title}</h4>
                  ${n.image ? `<img src="${n.image}" alt="News Image">` : ""}
                  <p>${n.description || ""}</p>
                  <a href="${n.url}" target="_blank">Read more</a>
                </div>
              `).join("")
              : "<p>No news available</p>"
          }
        </div>
      `;
    } catch (err) {
      console.error(err);
      output.innerHTML = "<p>Error loading data. Please try again later.</p>";
    }
  });
});