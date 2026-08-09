const segments = {
  0: ["a","b","c","d","e","f"],
  1: ["b","c"],
  2: ["a","b","g","e","d"],
  3: ["a","b","c","d","g"],
  4: ["f","g","b","c"],
  5: ["a","f","g","c","d"],
  6: ["a","f","g","e","c","d"],
  7: ["a","b","c"],
  8: ["a","b","c","d","e","f","g"],
  9: ["a","b","c","d","f","g"]
};

let is24h = true;

function makeDigit(value) {
  const digit = document.createElement("div");
  digit.className = "digit";

  ["a","b","c","d","e","f","g"].forEach(name => {
    const seg = document.createElement("div");
    seg.className = `seg ${name}`;
    digit.appendChild(seg);
  });

  const active = segments[value] || [];
  active.forEach(name => digit.querySelector("." + name).classList.add("on"));
  return digit;
}

function makeColon() {
  const colon = document.createElement("div");
  colon.className = "colon";
  colon.innerHTML = "<span></span><span></span>";
  return colon;
}

function renderRow(id, text) {
  const row = document.getElementById(id);
  row.innerHTML = "";

  [...text].forEach(char => {
    if (char === ":") row.appendChild(makeColon());
    else row.appendChild(makeDigit(Number(char)));
  });
}

function updateClock() {
  const now = new Date();

  let hour = now.getHours();
  const minute = now.getMinutes();

  const am = hour < 12;
  document.getElementById("am").classList.toggle("active", !is24h && am);
  document.getElementById("pm").classList.toggle("active", !is24h && !am);

  if (!is24h) {
    hour = hour % 12 || 12;
  }

  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");

  renderRow("hora", h);
  renderRow("minuto", m);
  renderRow("segundo", s);
    
  const dayNames = ["DOM","SEG","TER","QUA","QUI","SEX","SAB"];
  document.querySelectorAll("#days span").forEach((el, i) => {
    el.classList.toggle("active", i === now.getDay());
  });

  const date = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
  document.getElementById("date").textContent = date;
}

async function updateWeather() {
  const temperatureElement =
    document.getElementById("temperature");

  try {
    temperatureElement.textContent = "...";

    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=-3.7319" +
      "&longitude=-38.5267" +
      "&current=temperature_2m" +
      "&timezone=America%2FFortaleza";

    console.log("Consultando Open-Meteo...");

    const response = await fetch(url);

    console.log("Status:", response.status);

    if (!response.ok) {
      throw new Error(
        "Open-Meteo retornou HTTP " + response.status
      );
    }

    const data = await response.json();

    console.log("Resposta:", data);

    const temperature =
      Math.round(data.current.temperature_2m);

    temperatureElement.textContent = temperature;

    console.log(
      "Temperatura:",
      temperature + "°C"
    );

  } catch (error) {

    console.error(
      "ERRO AO OBTER TEMPERATURA:",
      error
    );

    temperatureElement.textContent = "--";
  }
}

document.getElementById("formatBtn").addEventListener("click", () => {
  is24h = !is24h;
  document.getElementById("formatBtn").textContent = is24h ? "24H" : "12H";
    
  updateClock();
});

document.getElementById("weatherBtn").addEventListener("click", updateWeather);

document.getElementById("minBtn").addEventListener("click", () => {
  window.electronAPI.minimize();
});

document.getElementById("closeBtn").addEventListener("click", () => {
  window.electronAPI.close();
});

document.getElementById("pinBtn").addEventListener("click", async () => {
  window.electronAPI.toggleAlwaysOnTop();
  const state = await window.electronAPI.getWindowState();
  document.getElementById("pinBtn").style.color =
    state.alwaysOnTop ? "#ff3333" : "#aaa";
});

updateClock();
updateWeather();
setInterval(updateClock, 1000);
setInterval(updateWeather, 10 * 60 * 1000);

const settingsBtn =
  document.getElementById("settingsBtn");

const settingsPanel =
  document.getElementById("settingsPanel");

settingsBtn.addEventListener("click", async () => {

  settingsPanel.classList.toggle("open");

  if (settingsPanel.classList.contains("open")) {

    const startup =
      await window.electronAPI.getStartupState();

    document.getElementById("startupCheck").checked =
      startup;

  }

});

document
  .getElementById("startupCheck")
  .addEventListener("change", (event) => {

    window.electronAPI.setStartup(
      event.target.checked
    );

  });