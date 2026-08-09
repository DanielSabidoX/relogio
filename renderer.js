// =====================================================
// TRADUÇÕES
// =====================================================

const TRANSLATIONS = {
  "pt-br": {
    docTitle: "Relógio Desktop",
    brand: "RELÓGIO DESKTOP",
    pinTitle: "Sempre visível",
    minTitle: "Minimizar",
    closeTitle: "Fechar",
    settingsTitle: "CONFIGURAÇÕES",
    settingsCloseTitle: "Fechar",
    startup: "Iniciar com o Windows",
    opacity: "Opacidade do fundo",
    activeColor: "Cor dos textos ativos",
    language: "Idioma",
    weatherBtn: "TEMPO",
    days: ["DOM","SEG","TER","QUA","QUI","SEX","SAB"],
    tempUnit: "°C",
    weatherUnitParam: "celsius"
  },
  "en-us": {
    docTitle: "Desktop Clock",
    brand: "DESKTOP CLOCK",
    pinTitle: "Always on top",
    minTitle: "Minimize",
    closeTitle: "Close",
    settingsTitle: "SETTINGS",
    settingsCloseTitle: "Close",
    startup: "Start with Windows",
    opacity: "Background opacity",
    activeColor: "Active text color",
    language: "Language",
    weatherBtn: "WEATHER",
    days: ["SUN","MON","TUE","WED","THU","FRI","SAT"],
    tempUnit: "°F",
    weatherUnitParam: "fahrenheit"
  }
};

let currentLang = localStorage.getItem("appLanguage") || "pt-br";

function t() {
  return TRANSLATIONS[currentLang] || TRANSLATIONS["pt-br"];
}

function formatDate(now) {
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  // pt-br: dd/mm/aaaa   |   en-us: mm/dd/aaaa
  return currentLang === "en-us" ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
}

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
    
  document.querySelectorAll("#days span").forEach((el, i) => {
    el.classList.toggle("active", i === now.getDay());
  });

  document.getElementById("date").textContent = formatDate(now);
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
      "&temperature_unit=" + t().weatherUnitParam +
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
      temperature + t().tempUnit
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

const settingsCloseBtn =
  document.getElementById("settingsCloseBtn");

// Mantém o painel sempre visível dentro da janela: mesmo que a janela
// encolha ou o painel seja arrastado pra fora, ele é puxado de volta.
function clampSettingsPanel() {
  if (!settingsPanel.classList.contains("open")) return;

  const rect = settingsPanel.getBoundingClientRect();

  // deixa o painel ser arrastado livremente; só o traz de volta se uma
  // parte mínima dele (KEEP px) deixar de aparecer na janela
  const KEEP = 40;

  const minLeft = KEEP - rect.width;
  const maxLeft = window.innerWidth - KEEP;
  const minTop  = 0;
  const maxTop  = window.innerHeight - KEEP;

  const left = Math.min(Math.max(rect.left, minLeft), Math.max(minLeft, maxLeft));
  const top  = Math.min(Math.max(rect.top,  minTop),  Math.max(minTop,  maxTop));

  settingsPanel.style.left  = left + "px";
  settingsPanel.style.top   = top + "px";
  settingsPanel.style.right = "auto";
}

function openSettings() {
  settingsPanel.classList.add("open");
  requestAnimationFrame(updateUiScale);
  window.electronAPI.notifySettingsOpen();
  // a janela cresce logo depois; reposiciona quando isso acontecer
  requestAnimationFrame(clampSettingsPanel);
  setTimeout(clampSettingsPanel, 120);
}

function closeSettings() {
  if (!settingsPanel.classList.contains("open")) return;
  settingsPanel.classList.remove("open");
  requestAnimationFrame(updateUiScale);
  window.electronAPI.notifySettingsClose();
}

settingsBtn.addEventListener("click", async () => {

  if (settingsPanel.classList.contains("open")) {
    closeSettings();
    return;
  }

  openSettings();

  const startup =
    await window.electronAPI.getStartupState();

  document.getElementById("startupCheck").checked =
    startup;

});

// botão "×" no cabeçalho do painel
settingsCloseBtn.addEventListener("click", closeSettings);

// clique fora do painel (e fora do botão de engrenagem) fecha
document.addEventListener("click", (event) => {

  if (!settingsPanel.classList.contains("open")) return;

  const clickedInsidePanel = settingsPanel.contains(event.target);
  const clickedGearButton = settingsBtn.contains(event.target);

  if (!clickedInsidePanel && !clickedGearButton) {
    closeSettings();
  }

});

// tecla Esc também fecha
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSettings();
});

// =====================================================
// ARRASTAR O PAINEL DE CONFIGURAÇÕES PELO CABEÇALHO
// =====================================================

(function makeSettingsPanelDraggable() {

  const handle = document.querySelector(".settings-title-row");
  let dragging = false;
  let startX = 0, startY = 0, originLeft = 0, originTop = 0;

  function savePosition() {
    try {
      localStorage.setItem("settingsPanelPos", JSON.stringify({
        left: parseFloat(settingsPanel.style.left) || 0,
        top:  parseFloat(settingsPanel.style.top)  || 0
      }));
    } catch (e) {}
  }

  handle.addEventListener("pointerdown", (event) => {
    if (settingsCloseBtn.contains(event.target)) return;

    const rect = settingsPanel.getBoundingClientRect();
    settingsPanel.style.left = rect.left + "px";
    settingsPanel.style.top  = rect.top + "px";
    settingsPanel.style.right = "auto";

    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    originLeft = rect.left;
    originTop  = rect.top;

    handle.classList.add("dragging");
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    settingsPanel.style.left = (originLeft + dx) + "px";
    settingsPanel.style.top  = (originTop + dy) + "px";
  });

  function stopDrag() {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove("dragging");
    clampSettingsPanel();
    savePosition();
  }

  handle.addEventListener("pointerup", stopDrag);
  handle.addEventListener("pointercancel", stopDrag);

  // restaura a última posição em que o painel foi arrastado
  try {
    const saved = JSON.parse(localStorage.getItem("settingsPanelPos"));
    if (saved && typeof saved.left === "number") {
      settingsPanel.style.left = saved.left + "px";
      settingsPanel.style.top  = saved.top + "px";
      settingsPanel.style.right = "auto";
    }
  } catch (e) {}

})();

document
  .getElementById("startupCheck")
  .addEventListener("change", (event) => {

    window.electronAPI.setStartup(
      event.target.checked
    );

  });

// =====================================================
// OPACIDADE DO FUNDO DO PAINEL
// =====================================================

const opacityRange = document.getElementById("opacityRange");
const opacityValue  = document.getElementById("opacityValue");

function applyPanelOpacity(value) {
  document.documentElement.style.setProperty(
    "--panel-opacity",
    value / 100
  );
  opacityValue.textContent = value + "%";
}

opacityRange.addEventListener("input", (event) => {
  const value = Number(event.target.value);
  applyPanelOpacity(value);
  localStorage.setItem("panelOpacity", value);
});

// restaura a preferência salva (se houver) ao abrir o app
const savedOpacity = localStorage.getItem("panelOpacity");
const initialOpacity = savedOpacity !== null ? Number(savedOpacity) : 100;
opacityRange.value = initialOpacity;
applyPanelOpacity(initialOpacity);

// =====================================================
// COR DOS TEXTOS ATIVOS (branco / verde / vermelho / azul)
// =====================================================

// mapa chave -> variável CSS correspondente (definidas em :root no style.css).
// Pra trocar as cores disponíveis, basta editar os valores de --color-* no CSS.
const ACTIVE_COLOR_VAR = {
  pink: "--color-pink",
  green: "--color-green",
  red:   "--color-red",
  blue:  "--color-blue"
};

const colorRadios = document.querySelectorAll('input[name="activeColor"]');

function applyActiveColor(key) {
  const varName = ACTIVE_COLOR_VAR[key] || ACTIVE_COLOR_VAR.pink;
  document.documentElement.style.setProperty("--active-color", `var(${varName})`);
}

colorRadios.forEach((radio) => {
  radio.addEventListener("change", (event) => {
    if (!event.target.checked) return;
    applyActiveColor(event.target.value);
    localStorage.setItem("activeColorKey", event.target.value);
  });
});

const savedColorKey = localStorage.getItem("activeColorKey") || "pink";
const savedColorRadio = document.querySelector(
  `input[name="activeColor"][value="${savedColorKey}"]`
);
if (savedColorRadio) savedColorRadio.checked = true;
applyActiveColor(savedColorKey);

// =====================================================
// IDIOMA (PT-BR / EN-US)
// =====================================================

function applyLanguage(lang) {
  currentLang = lang;
  const dict = t();

  document.title = dict.docTitle;
  document.documentElement.lang = lang === "en-us" ? "en" : "pt-BR";

  document.getElementById("brandText").textContent = dict.brand;
  document.getElementById("pinBtn").title = dict.pinTitle;
  document.getElementById("minBtn").title = dict.minTitle;
  document.getElementById("closeBtn").title = dict.closeTitle;

  document.getElementById("settingsTitleText").textContent = dict.settingsTitle;
  settingsCloseBtn.title = dict.settingsCloseTitle;

  document.getElementById("startupLabelText").textContent = dict.startup;
  document.getElementById("opacityLabelText").textContent = dict.opacity;
  document.getElementById("colorLabelText").textContent = dict.activeColor;
  document.getElementById("langLabelText").textContent = dict.language;

  document.getElementById("weatherBtn").textContent = dict.weatherBtn;
  document.getElementById("tempUnit").textContent = dict.tempUnit;

  document.querySelectorAll("#days span").forEach((el, i) => {
    el.textContent = dict.days[i];
  });

  updateClock();
  updateWeather();
}

const langRadios = document.querySelectorAll('input[name="appLanguage"]');

langRadios.forEach((radio) => {
  radio.addEventListener("change", (event) => {
    if (!event.target.checked) return;
    applyLanguage(event.target.value);
    localStorage.setItem("appLanguage", event.target.value);
  });
});

const savedLangRadio = document.querySelector(
  `input[name="appLanguage"][value="${currentLang}"]`
);
if (savedLangRadio) savedLangRadio.checked = true;
applyLanguage(currentLang);

// =====================================================
// REDIMENSIONAR MANUALMENTE PELA ALÇA NO CANTO
// =====================================================

(function makeWindowResizable() {

  const handle = document.getElementById("resizeHandle");
  if (!handle) return;

  let resizing = false;
  let startX = 0, startY = 0, startW = 0, startH = 0;
  let pending = null;

  function tick() {
    if (pending) {
      window.electronAPI.resizeWindow(pending.w, pending.h);
      pending = null;
    }
    if (resizing) requestAnimationFrame(tick);
  }

  handle.addEventListener("pointerdown", (event) => {
    resizing = true;
    startX = event.clientX;
    startY = event.clientY;
    startW = window.innerWidth;
    startH = window.innerHeight;
    handle.classList.add("resizing");
    handle.setPointerCapture(event.pointerId);
    requestAnimationFrame(tick);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!resizing) return;
    pending = {
      w: startW + (event.clientX - startX),
      h: startH + (event.clientY - startY)
    };
  });

  function stopResize() {
    if (!resizing) return;
    resizing = false;
    handle.classList.remove("resizing");
  }

  handle.addEventListener("pointerup", stopResize);
  handle.addEventListener("pointercancel", stopResize);

})();
// =====================================================
// ESCALA ÚNICA DA INTERFACE (--ui-scale)
// =====================================================
// Em vez de cada elemento ter seu próprio clamp()/vw (o que fazia uns
// baterem no limite antes dos outros e saírem de proporção), existe um
// único fator: --ui-scale. Todo tamanho em style.css é
// calc(var(--ui-scale) * base_px), então tudo cresce/encolhe junto.
//
// Detalhe importante: quando o painel de configurações abre, o processo
// principal aumenta a altura da janela em SETTINGS_EXTRA_HEIGHT. Esse
// crescimento é temporário e não deve mudar o tamanho do relógio — por
// isso descontamos esse extra da altura usada no cálculo.

const UI_BASE_WIDTH  = 540;
const UI_BASE_HEIGHT = 215;
const SETTINGS_EXTRA_HEIGHT = 220;

function updateUiScale() {

  const settingsOpen =
    settingsPanel.classList.contains("open");

  const usableHeight =
    window.innerHeight - (settingsOpen ? SETTINGS_EXTRA_HEIGHT : 0);

  const scale = Math.min(
    window.innerWidth / UI_BASE_WIDTH,
    Math.max(1, usableHeight) / UI_BASE_HEIGHT
  );

  document.documentElement.style.setProperty(
    "--ui-scale",
    String(Math.max(0.5, Math.min(3, scale)))
  );
}

window.addEventListener("resize", () => {
  updateUiScale();
  clampSettingsPanel();
});
updateUiScale();
