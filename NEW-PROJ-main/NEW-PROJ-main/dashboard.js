// ================================
// Helpers
// ================================
function parseTime(timeStr) {
  if (!timeStr) return null;
  let [h, m] = timeStr.split(":").map(Number);
  return new Date(2000, 0, 1, h, m); // fixed date for comparison
}

function classifyIn(timeIn) {
  if (!timeIn) return "No In";
  let t = parseTime(timeIn);
  let early = parseTime("09:00");
  let late = parseTime("09:15");

  if (t < early) return "Early In";
  if (t > late) return "Late";
  return "On Time";
}

function classifyOut(timeOut) {
  if (!timeOut) return "No Out";
  let t = parseTime(timeOut);
  let earlyOut = parseTime("17:59");
  let normalOut = parseTime("18:00");
  let ot = parseTime("19:00");

  if (t <= earlyOut) return "Early Out";
  if (t.getHours() === normalOut.getHours() && t.getMinutes() === normalOut.getMinutes()) return "Out";
  if (t >= ot) return "Overtime";
  return "Out";
}

// ================================
// Show / Hide Sections
// ================================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => (sec.style.display = "none"));
  document.getElementById(sectionId).style.display = "block";
  if (sectionId === "dashboard") updateDashboard();
}

// ================================
// OJT Form
// ================================
document.getElementById("ojtForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let name = document.getElementById("ojtName").value.trim();
  let timeIn = document.getElementById("timeIn").value;
  let timeOut = document.getElementById("timeOut").value;
  if (!name || !timeIn) return;

  let ojtList = JSON.parse(localStorage.getItem("ojtList") || "[]");
  ojtList.push({ name, date: new Date().toLocaleDateString(), timeIn, timeOut });
  localStorage.setItem("ojtList", JSON.stringify(ojtList));

  alert("OJT record added successfully!");
  this.reset();
  updateDashboard();
});

// ================================
// Dashboard
// ================================
function updateDashboard() {
  let ojtList = JSON.parse(localStorage.getItem("ojtList") || "[]");
  let select = document.getElementById("ojtSelect");

  // Populate dropdown
  let names = [...new Set(ojtList.map(r => r.name))];
  select.innerHTML = names.map(n => `<option value="${n}">${n}</option>`).join("");

  if (names.length > 0) showReport(names[0]);
  select.onchange = () => showReport(select.value);
}

function showReport(name) {
  let ojtList = JSON.parse(localStorage.getItem("ojtList") || "[]");
  let filtered = ojtList.filter(r => r.name === name);

  let totalHours = 0;
  let tbody = document.querySelector("#reportTable tbody");
  tbody.innerHTML = "";

  filtered.forEach(r => {
    let hours = 0;
    if (r.timeIn && r.timeOut) {
      let start = parseTime(r.timeIn);
      let end = parseTime(r.timeOut);
      hours = (end - start) / (1000 * 60 * 60);
      totalHours += hours;
    }

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.timeIn || "-"}</td>
      <td>${classifyIn(r.timeIn)}</td>
      <td>${r.timeOut || "-"}</td>
      <td>${classifyOut(r.timeOut)}</td>
      <td>${hours.toFixed(2)} hrs</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalHours").innerText = totalHours.toFixed(2) + " hrs";

  document.getElementById("downloadBtn").onclick = function () {
    let data = filtered.map(r => ({
      Name: r.name,
      Date: r.date,
      "Time In": r.timeIn,
      "Status In": classifyIn(r.timeIn),
      "Time Out": r.timeOut,
      "Status Out": classifyOut(r.timeOut),
      "Total Hours": r.timeIn && r.timeOut ? ((parseTime(r.timeOut) - parseTime(r.timeIn)) / (1000 * 60 * 60)).toFixed(2) : "0"
    }));

    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${name}_report.xlsx`);
  };
}

// ================================
// Sidebar Toggle
// ================================
const toggleBtn = document.getElementById("toggleMenu");
const arrowIcon = toggleBtn.querySelector(".arrow");
const sidebarLinks = document.getElementById("sidebarLinks");

toggleBtn.addEventListener("click", function () {
  let links = sidebarLinks.querySelectorAll(".sidebar-link");
  let hidden = [...links].filter(link => link.classList.contains("hidden"));

  if (hidden.length > 0) {
    links.forEach(link => link.classList.remove("hidden"));
    arrowIcon.classList.add("down");
  } else {
    collapseToActive();
    arrowIcon.classList.remove("down");
  }
});

function setActive(element, sectionId) {
  sidebarLinks.querySelectorAll(".sidebar-link").forEach(link => link.classList.remove("active"));
  element.classList.add("active");
  collapseToActive();
  arrowIcon.classList.remove("down");
  showSection(sectionId);
}

function collapseToActive() {
  let links = sidebarLinks.querySelectorAll(".sidebar-link");
  let active = sidebarLinks.querySelector(".active");
  links.forEach(link => {
    if (link !== active) link.classList.add("hidden");
    else link.classList.remove("hidden");
  });
}

// Init
collapseToActive();
arrowIcon.classList.remove("down");
updateDashboard();
