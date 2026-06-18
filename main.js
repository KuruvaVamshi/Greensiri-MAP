/*************************************************
 * GLOBAL STATE
 *************************************************/
let activePlotId = null;
let currentPlotNumber = null;
let filtersActive = false;
const comparedPlots = [];

/*************************************************
 * EXCEL CONFIG
 *************************************************/
const EXCEL_URL =
  "https://docs.google.com/spreadsheets/d/1oM3LzlnMnVJ0YWTgPkA9yCfK-a-JIRYE2IqTe2M8doM/export?format=csv&t=" +
  Date.now();


/*************************************************
 * LOAD EXCEL & SYNC DATA
 *************************************************/
async function loadExcelData() {
  try {
    const response = await fetch(EXCEL_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Convert sheet rows into lookup map (faster than find inside loop)
    const sheetMap = {};
    rows.forEach((row) => {
      sheetMap[row.plotId?.toString().toLowerCase()] = row;
    });

    polygonsData.forEach((plot) => {
      const row = sheetMap[plot.id.toLowerCase()];
      if (!row) return;

      plot.data = {
        ...plot.data,
        availability: row.availability
          ? row.availability.toString().trim().toLowerCase()
          : "",

        area: row.area ? parseInt(row.area.toString().replace(/,/g, "")) : 0,

        facing: row.facing ? row.facing.toString().trim().toLowerCase() : "",

        sizes: row.sizes ? row.sizes.toString().trim() : "",

        type: row.type
          ? row.type.toString().replace(/\s+/g, " ").trim().toLowerCase()
          : "",

        cost: row.cost || "",
      };
    });

    drawPolygons();

    if (activePlotId) {
      const activePlot = polygonsData.find(
        (p) => p.id.toLowerCase() === activePlotId.toLowerCase(),
      );
      if (activePlot) updatePlotInfoPanel(activePlot);
    }
  } catch (err) {
    console.error("Excel sync failed:", err);
  }
}

/*************************************************
 * DRAW POLYGONS
 *************************************************/
const img = document.getElementById("layout-image");
const svg = document.getElementById("svg-map");

function setupSvg() {
  if (img.naturalWidth && img.naturalHeight) {
    svg.setAttribute("viewBox", `0 0 ${img.naturalWidth} ${img.naturalHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    drawPolygons();
  }
}

if (img.complete) {
  setupSvg();
} else {
  img.addEventListener("load", setupSvg);
}

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

    // Always use green for hover, no more red
    let hoverFill = "rgba(148,232,151,0.7)";

    // Default state → transparent
    polygon.setAttribute("fill", "transparent");
    polygon.setAttribute("stroke", "#fff");
    polygon.setAttribute("stroke-width", "1");
    polygon.setAttribute("data-id", plot.id);

    // Hover effect — always work, even if filters are active
    polygon.addEventListener("mouseenter", () => {
      polygon.setAttribute("fill", hoverFill);
    });

    polygon.addEventListener("mouseleave", () => {
      // If filters are active, restore the state based on match
      if (filtersActive) {
        const id = polygon.getAttribute("data-id");
        const plot = polygonsData.find(p => String(p.id).toLowerCase() === String(id).toLowerCase());

        // Re-run the filter logic check or just check current transparency/color
        // For simplicity, we can check if it currently has the filter highlight
        // or check its opacity. But it's safer to check the match again.
        // Actually, we can store the 'isMatch' state on the element.
        if (polygon.getAttribute("data-is-match") === "true") {
          polygon.setAttribute("fill", "rgba(0, 200, 255, 0.7)");
        } else {
          polygon.setAttribute("fill", "transparent");
        }
      } else {
        polygon.setAttribute("fill", "transparent");
      }
    });

    svgContainer.appendChild(polygon);
  });

  addPolygonInteractions();
}

/*************************************************
 * POLYGON INTERACTIONS
 *************************************************/
function addPolygonInteractions() {
  const polygons = svgContainer.querySelectorAll("polygon");

  polygons.forEach((polygon) => {
    polygon.addEventListener("click", () => {
      const id = polygon.getAttribute("data-id");
      activePlotId = id;

      const plotData = polygonsData.find(
        (p) => p.id.toLowerCase() === id.toLowerCase(),
      );

      if (!plotData) return;

      updatePlotInfoPanel(plotData);
    });
  });
}

/*************************************************
 * UPDATE INFO PANEL (audio & availability removed)
 *************************************************/
function updatePlotInfoPanel(plotData) {
  currentPlotNumber = plotData.data.plotNumber;

  // Update all instances of plot info (desktop and mobile panels)
  const plotNumberEls = document.querySelectorAll(".info-plot-number");
  const areaEls = document.querySelectorAll(".info-area");
  const facingEls = document.querySelectorAll(".info-facing");
  const typeEls = document.querySelectorAll(".info-type");
  const sizesContainers = document.querySelectorAll(".info-sizes");
  const panels = document.querySelectorAll(".plot-info-panel");

  panels.forEach((p) => (p.style.display = "block"));

  const detailsContent = document.getElementById("plot-details-content");
  if (detailsContent) {
    detailsContent.style.visibility = "visible";
    detailsContent.style.display = "block";
  }

  plotNumberEls.forEach((el) => (el.innerText = plotData.data.plotNumber || "—"));
  areaEls.forEach((el) => (el.innerText = plotData.data.area || "—"));
  facingEls.forEach((el) => (el.innerText = plotData.data.facing?.toUpperCase() || "—"));
  typeEls.forEach((el) => {
    let type = plotData.data.type?.toUpperCase() || "";
    type = type.replace(/\bPLOT\b/g, "").replace(/\s+/g, " ").trim();
    el.innerText = type || "—";
  });

  sizesContainers.forEach((container) => {
    // We'll reuse the renderPlotSizes logic but update specific containers
    renderPlotSizesInContainer(plotData.data.sizes, container);
  });
}

function renderPlotSizesInContainer(sizesStr, container) {
  container.innerHTML = "";
  if (!sizesStr || sizesStr === "—") {
    container.innerText = "—";
    return;
  }

  // Clean up formatting issues from the data source
  sizesStr = sizesStr.replace(/[\r\n]+/g, " "); // Remove newlines
  sizesStr = sizesStr.replace(/([NSEW])\s+[-=]/gi, "$1-"); // Fix "N -", "E ="
  sizesStr = sizesStr.replace(/([NSEW])-\s+/gi, "$1-"); // Fix "N- ", "S- "
  sizesStr = sizesStr.replace(/E=/gi, "E-"); // Fix "E="
  sizesStr = sizesStr.replace(/N-103\s+103/gi, "N-103 S-103"); // Fix Plot 21
  sizesStr = sizesStr.replace(/([0-9]+)([A-Za-z]+)/g, "$1 $2"); // Fix merged text like "S-80CORNER"

  // Handle 'x', ',', and spaces as separators
  let parts = sizesStr.split(/[x,\s]+/).map((s) => s.trim()).filter(s => s !== "");

  // Detect orientation labels (N-, S-, E-, W-)
  let n = "—", s = "—", e = "—", w = "—";
  parts.forEach(p => {
    if (/^N-/i.test(p)) n = p.replace(/^N-/i, "");
    else if (/^S-/i.test(p)) s = p.replace(/^S-/i, "");
    else if (/^E-/i.test(p)) e = p.replace(/^E-/i, "");
    else if (/^W-/i.test(p)) w = p.replace(/^W-/i, "");
  });

  // Fallback if no labels were found
  if (n === "—" && s === "—" && e === "—" && w === "—") {
    if (parts.length >= 4) {
      n = parts[0]; s = parts[1]; e = parts[2]; w = parts[3];
    } else if (parts.length >= 2) {
      n = parts[0]; s = parts[0]; e = parts[1]; w = parts[1];
    } else {
      n = parts[0]; s = parts[0]; e = parts[0]; w = parts[0];
    }
  }

  // ALWAYS create the plot-box HTML
  container.innerHTML = `
    <div class="plot-box">
      <span class="plot-label north">N-${n}</span>
      <span class="plot-label south">S-${s}</span>
      <span class="plot-label west">W-${w}</span>
      <span class="plot-label east">E-${e}</span>
      <div class="labell"></div>
    </div>
  `;
}


/*************************************************
 * COMPARE BUTTON
 *************************************************/
const addCompareBtn = document.getElementById("add-compare-btn");
const viewCompareBtn = document.getElementById("view-compare-btn");
const compareCountEl = document.getElementById("compare-count");

function updateCompareUI() {
  compareCountEl.innerText = comparedPlots.length;

  // Enable view button only if ≥ 2
  viewCompareBtn.disabled = comparedPlots.length < 2;

  // Disable add button if already 3
  addCompareBtn.disabled = comparedPlots.length >= 3;
}

addCompareBtn.addEventListener("click", () => {
  if (!activePlotId) return;

  // Already added
  if (comparedPlots.includes(activePlotId)) {
    alert("Plot already added for comparison");
    return;
  }

  // Max 3
  if (comparedPlots.length >= 3) {
    alert("You can compare maximum 3 plots only");
    return;
  }

  comparedPlots.push(activePlotId);
  updateCompareUI();
});

viewCompareBtn.addEventListener("click", () => {
  if (comparedPlots.length < 2) {
    alert("Please add at least 2 plots to compare");
    return;
  }

  openCompareModal();
});

/*************************************************
 * COMPARE MODAL (with reset & individual remove)
 *************************************************/
function openCompareModal() {
  const modal = document.getElementById("compare-modal");
  const content = document.getElementById("compare-content");

  content.innerHTML = "";

  comparedPlots.forEach((id) => {
    const plot = polygonsData.find((p) => p.id === id);
    if (!plot) return;

    const card = document.createElement("div");
    card.className = "compare-card";

    card.innerHTML = `
      <div class="compare-card-header">
        <h4>Plot ${plot.data.plotNumber}</h4>
        <button class="remove-compare-plot" data-id="${id}" title="Remove plot">✕</button>
      </div>

      <div class="compare-row">
        <span>Sizes:</span> ${plot.data.sizes || "—"}
      </div>

      <div class="compare-row">
        <span>Area:</span> ${plot.data.area || "—"}
      </div>

      <div class="compare-row">
        <span>Facing:</span> ${plot.data.facing?.toUpperCase() || "—"}
      </div>

      <div class="compare-row">
        <span>Type:</span> ${plot.data.type || "NORMAL"}
      </div>
    `;

    content.appendChild(card);
  });

  // Add remove button listeners for individual plots
  content.querySelectorAll(".remove-compare-plot").forEach((btn) => {
    btn.addEventListener("click", () => {
      const removeId = btn.getAttribute("data-id");
      const idx = comparedPlots.indexOf(removeId);
      if (idx > -1) comparedPlots.splice(idx, 1);
      updateCompareUI();
      if (comparedPlots.length === 0) {
        closeCompare();
      } else {
        openCompareModal(); // re-render
      }
    });
  });

  modal.style.display = "block";
}

document
  .getElementById("close-compare")
  .addEventListener("click", closeCompare);
document
  .querySelector(".compare-overlay")
  .addEventListener("click", closeCompare);

// Reset all compared plots
document.getElementById("reset-compare").addEventListener("click", () => {
  comparedPlots.length = 0;
  updateCompareUI();
  closeCompare();
});

function closeCompare() {
  document.getElementById("compare-modal").style.display = "none";
}

updateCompareUI();



/*************************************************
 * FILTER MODAL
 *************************************************/
const filterBtn = document.getElementById("filter-btn");
const filterModal = document.getElementById("filter-modal");
const filterOverlay = document.querySelector(".filter-overlay");
const filterDialog = document.querySelector(".filter-dialog");
const closeFilterBtn = document.getElementById("close-filter");

// OPEN MODAL
filterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  filterModal.style.display = "block";
});

// CLOSE MODAL (overlay click only)
filterOverlay.addEventListener("click", () => {
  filterModal.style.display = "none";
});

// PREVENT CLOSE when clicking inside dialog
filterDialog.addEventListener("click", (e) => {
  e.stopPropagation();
});

// CLOSE via X button
closeFilterBtn.addEventListener("click", () => {
  filterModal.style.display = "none";
});

/*************************************************
 * APPLY FILTER (with Special Package for plots 75-79)
 *************************************************/
document.getElementById("apply-filter").addEventListener("click", () => {
  const facing = document
    .getElementById("filter-facing")
    .value.trim()
    .toLowerCase();
  const selectedType = document
    .getElementById("filter-type")
    .value.trim()
    .toLowerCase();

  svgContainer.querySelectorAll("polygon").forEach((polygon) => {
    const id = polygon.getAttribute("data-id");

    const plot = polygonsData.find(
      (p) =>
        String(p.id).trim().toLowerCase() === String(id).trim().toLowerCase(),
    );

    if (!plot || !plot.data) return;

    const plotFacing = plot.data.facing || "";
    const plotTypeRaw = plot.data.type || "";
    const plotNumber = parseInt(plot.data.plotNumber);

    let plotCategory = "";

    // Categorize properly
    if (plotTypeRaw.includes("corner") && plotTypeRaw.includes("water")) {
      plotCategory = "corner waterstream";
    } else if (plotTypeRaw.includes("water")) {
      plotCategory = "waterstream";
    } else if (plotTypeRaw.includes("corner")) {
      plotCategory = "corner";
    } else {
      plotCategory = "normal";
    }

    let match = true;

    if (facing && plotFacing !== facing) match = false;

    // Special Package: only plots 75–79
    if (selectedType === "special_package") {
      if (isNaN(plotNumber) || plotNumber < 75 || plotNumber > 79) match = false;
    } else if (selectedType && plotCategory !== selectedType) {
      match = false;
    }

    if (match) {
      polygon.setAttribute("fill", "rgba(0, 200, 255, 0.7)");
      polygon.setAttribute("data-is-match", "true");
      polygon.style.opacity = "1";
    } else {
      polygon.setAttribute("fill", "transparent");
      polygon.setAttribute("data-is-match", "false");
      polygon.style.opacity = "0.25"; // Dimmed but still visible
    }
    polygon.style.pointerEvents = "auto";
  });

  // Mark filters as active so hover doesn't clear highlights
  filtersActive = true;
  filterModal.style.display = "none";
});

/*************************************************
 * RESET FILTER
 *************************************************/
document.getElementById("reset-filter").addEventListener("click", () => {
  document.getElementById("filter-facing").value = "";
  document.getElementById("filter-type").value = "";

  // Clear filter-active flag so hover works normally again
  filtersActive = false;

  svgContainer.querySelectorAll("polygon").forEach((polygon) => {
    polygon.setAttribute("fill", "transparent");
    polygon.style.opacity = "1";
    polygon.style.pointerEvents = "auto";
  });
});

/*************************************************
 * INIT
 *************************************************/
window.addEventListener("load", () => {
  loadExcelData();
  setInterval(loadExcelData, 3600000);
});
