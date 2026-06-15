/*************************************************
 * GLOBAL STATE
 *************************************************/
let activePlotId = null;
let currentPlotNumber = null;

let selectedLanguage = "en";
let audioPlaying = false;
let speech = null;

/*************************************************
 * VENTURE AUDIO CONTENT
 *************************************************/
const ventureAudioText = {
  en: "This venture offers premium plotted development with modern amenities and excellent connectivity.",
  te: "ఈ వెంచర్ ఆధునిక సదుపాయాలతో కూడిన ప్రీమియం ప్లాట్లను అందిస్తుంది.",
  hi: "यह वेंचर आधुनिक सुविधाओं के साथ प्रीमियम प्लॉट्स प्रदान करता है।",
  ta: "இந்த திட்டம் நவீன வசதிகளுடன் சிறந்த வீட்டு மனை வளர்ச்சியை வழங்குகிறது.",
};

/*************************************************
 * EXCEL CONFIG
 *************************************************/
const EXCEL_URL =
  "https://docs.google.com/spreadsheets/d/1oiDI1WderM6diE5-K8E_UxjNufO2JpIkOWvUDGlETQc/export?format=xlsx&t=" +
  Date.now();

/*************************************************
 * LOAD EXCEL & SYNC DATA
 *************************************************/
async function loadExcelData() {
  try {
    const response = await fetch(EXCEL_URL, { cache: "no-store" });
    const buffer = await response.arrayBuffer();

    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    rows.forEach((row) => {
      const plot = polygonsData.find(
        (p) => p.id.toLowerCase() === row.plotId?.toString().toLowerCase(),
      );
      if (!plot) return;

      plot.data.availability = row.availability?.toLowerCase();
      plot.data.area = row.area;
      plot.data.cost = row.cost;
      plot.data.facing = row.facing?.toLowerCase();
      plot.data.sizes = row.sizes;
      plot.data.type = row.type;
    });

    drawPolygons();

    if (activePlotId) {
      const activePlot = polygonsData.find(
        (p) => p.id.toLowerCase() === activePlotId.toLowerCase(),
      );
      if (activePlot) updatePlotInfoPanel(activePlot);
    }
  } catch (err) {
    console.error("Excel sync failed", err);
  }
}

/*************************************************
 * DRAW POLYGONS
 *************************************************/
function drawPolygons() {
  svgContainer.innerHTML = "";

  polygonsData.forEach((plot) => {
    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );

    polygon.setAttribute(
      "points",
      plot.coordinates.map((p) => `${p.x},${p.y}`).join(" "),
    );

    let fill = "rgba(240,86,86,0.7)";
    if (plot.data.availability === "available") fill = "rgba(148,232,151,0.7)";
    if (plot.data.availability === "mortgage") fill = "rgba(189,197,132,0.7)";

    polygon.setAttribute("fill", fill);
    polygon.setAttribute("stroke", "#fff");
    polygon.setAttribute("stroke-width", "1");
    polygon.setAttribute("data-id", plot.id);

    svgContainer.appendChild(polygon);
  });

  addPolygonInteractions();
}

/*************************************************
 * POLYGON INTERACTIONS
 *************************************************/
function addPolygonInteractions() {
  const polygons = svgContainer.querySelectorAll("polygon");
  const hoverTooltip = document.getElementById("plot-hover-tooltip");

  polygons.forEach((polygon) => {
    polygon.addEventListener("mousemove", (e) => {
      const id = polygon.getAttribute("data-id");
      hoverTooltip.innerText = `Plot ${id}`;
      hoverTooltip.style.left = e.clientX + 12 + "px";
      hoverTooltip.style.top = e.clientY + 12 + "px";
      hoverTooltip.style.display = "block";
    });

    polygon.addEventListener("mouseleave", () => {
      hoverTooltip.style.display = "none";
    });

    polygon.addEventListener("click", () => {
      const id = polygon.getAttribute("data-id");
      activePlotId = id;

      const plotData = polygonsData.find(
        (p) => p.id.toLowerCase() === id.toLowerCase(),
      );

      if (plotData) updatePlotInfoPanel(plotData);
    });
  });
}

/*************************************************
 * UPDATE INFO PANEL
 *************************************************/
function updatePlotInfoPanel(plotData) {
  const panel = document.getElementById("plot-info-panel");
  panel.style.display = "block";

  currentPlotNumber = plotData.data.plotNumber;

  document.getElementById("info-plot-number").innerText =
    plotData.data.plotNumber || "—";
  document.getElementById("info-sizes").innerText = plotData.data.sizes || "—";
  document.getElementById("info-area").innerText = plotData.data.area || "—";
  document.getElementById("info-facing").innerText =
    plotData.data.facing?.toUpperCase() || "—";
  document.getElementById("info-type").innerText =
    plotData.data.type || "NORMAL";

  const status = document.getElementById("info-status");
  status.className = "status-pill " + plotData.data.availability;
  status.innerText = plotData.data.availability;

  // Hide language buttons initially
  document.getElementById("lang-selector").style.display = "none";
  stopAudio();
}

/*************************************************
 * LANGUAGE SELECTOR (ONLY SHOWS + SWITCHES AUDIO)
 *************************************************/
document.querySelectorAll("#lang-selector button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedLanguage = btn.dataset.lang;

    document
      .querySelectorAll("#lang-selector button")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    // Restart audio in selected language
    stopAudio();
    playAudio(currentPlotNumber, selectedLanguage);
  });
});

/*************************************************
 * AUDIO BUTTON
 *************************************************/
document.getElementById("audio-btn").addEventListener("click", () => {
  const langBox = document.getElementById("lang-selector");

  if (!currentPlotNumber) return;

  // Toggle OFF
  if (audioPlaying) {
    stopAudio();
    langBox.style.display = "none";
    return;
  }

  // Toggle ON
  langBox.style.display = "flex";
  playAudio(currentPlotNumber, selectedLanguage);
});

/*************************************************
 * AUDIO CORE
 *************************************************/
function playAudio(plotNumber, lang) {
  if (!window.speechSynthesis || !plotNumber) return;

  const text = getAudioText(plotNumber, lang);

  speech = new SpeechSynthesisUtterance(text);
  speech.lang = getSpeechLang(lang);
  speech.rate = 0.9;

  speech.onend = stopAudio;
  speech.onerror = stopAudio;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);

  audioPlaying = true;
}

function stopAudio() {
  window.speechSynthesis.cancel();
  audioPlaying = false;
}

/*************************************************
 * HELPERS
 *************************************************/
function getAudioText(plotNumber, lang) {
  switch (lang) {
    case "te":
      return `ప్లాట్ నంబర్ ${plotNumber}. ${ventureAudioText.te}`;
    case "hi":
      return `प्लॉट नंबर ${plotNumber}. ${ventureAudioText.hi}`;
    case "ta":
      return `பிளாட் எண் ${plotNumber}. ${ventureAudioText.ta}`;
    default:
      return `Plot number ${plotNumber}. ${ventureAudioText.en}`;
  }
}

function getSpeechLang(lang) {
  if (lang === "te") return "te-IN";
  if (lang === "hi") return "hi-IN";
  if (lang === "ta") return "ta-IN";
  return "en-IN";
}

/*************************************************
 * INIT
 *************************************************/
window.addEventListener("load", () => {
  loadExcelData();
  setInterval(loadExcelData, 30000);
});
