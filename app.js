/*
  But Did I?
  Copyright (C) 2026 Maxim Tam

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const STORAGE_KEY = "but_did_i";

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load state:", e);
  }
  return { timers: [], log: [] };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state:", e);
  }
}

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatAbsolute(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${month}/${day} ${hours}:${mins}${ampm}`;
}

function addTimer(name, category, color) {
  const now = Date.now();
  state.timers.push({ id: now, name, category, color, resetTime: now });
  saveState();
  render();
}

function resetTimer(id) {
  const timer = state.timers.find((t) => t.id === id);
  if (!timer) return;
  const now = Date.now();
  const elapsed = formatElapsed(now - timer.resetTime);
  state.log.unshift({
    name: timer.name,
    color: timer.color,
    elapsed,
    time: now,
  });
  timer.resetTime = now;
  if (state.log.length > 200) state.log.length = 200;
  saveState();
  render();
}

function deleteTimer(id) {
  const timer = state.timers.find((t) => t.id === id);
  const name = timer ? timer.name : "this timer";
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  state.timers = state.timers.filter((t) => t.id !== id);
  saveState();
  render();
}

function render() {
  const container = document.getElementById("timers-container");
  const logList = document.getElementById("log-list");
  const datalist = document.getElementById("category-list");

  // Group timers by category
  const groups = {};
  for (const t of state.timers) {
    const cat = t.category || "Uncategorized";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(t);
  }

  // Update category datalist
  datalist.innerHTML = "";
  for (const cat of Object.keys(groups)) {
    const opt = document.createElement("option");
    opt.value = cat;
    datalist.appendChild(opt);
  }

  // Render timer cards
  if (state.timers.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No timers yet. Add one above.</div>';
  } else {
    let html = "";
    for (const [cat, timers] of Object.entries(groups)) {
      html += `<div class="category-group"><h2>${esc(cat)}</h2><div class="timers-grid">`;
      for (const t of timers) {
        const elapsed = Date.now() - t.resetTime;
        const color = sanitizeColor(t.color);
        html += `
          <div class="timer-card" style="--card-color:${esc(t.color)}" data-id="${t.id}">
            <button class="delete-btn" onclick="deleteTimer(${t.id})" title="Delete">&times;</button>
            <div class="timer-name">${esc(t.name)}</div>
            <div class="timer-elapsed">${formatElapsed(elapsed)}</div>
            <div class="timer-reset-time">${formatAbsolute(t.resetTime)}</div>
            <button class="reset-btn" style="--card-color:${color}" onclick="resetTimer(${t.id})">reset</button>
          </div>`;
      }
      html += "</div></div>";
    }
    container.innerHTML = html;
  }

  // Render log
  if (state.log.length === 0) {
    logList.innerHTML = '<li class="empty-state">No resets yet.</li>';
  } else {
    logList.innerHTML = state.log
      .map(
        (entry) => `
      <li>
        <span class="log-dot" style="background:${sanitizeColor(entry.color)}"></span>
        <span><strong>${esc(entry.name)}</strong> after ${esc(entry.elapsed)}</span>
        <span class="log-time">${formatAbsolute(entry.time)}</span>
      </li>`,
      )
      .join("");
  }
}

function esc(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

// Add timer handler
document.getElementById("btn-add").addEventListener("click", () => {
  const name = document.getElementById("inp-name").value.trim();
  const category = document.getElementById("inp-category").value.trim();
  const color = document.getElementById("inp-color").value;
  if (!name) {
    document.getElementById("inp-name").focus();
    return;
  }
  addTimer(name, category || "Uncategorized", color);
  document.getElementById("inp-name").value = "";
});

document.getElementById("btn-clear-log").addEventListener("click", () => {
  if (state.log.length === 0) return;
  if (!confirm("Clear the entire reset log? This cannot be undone.")) return;
  state.log = [];
  saveState();
  render();
});

document.getElementById("inp-name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btn-add").click();
});

// Tick every second to update elapsed times
setInterval(() => {
  document.querySelectorAll(".timer-card").forEach((card) => {
    const id = Number(card.dataset.id);
    const timer = state.timers.find((t) => t.id === id);
    if (!timer) return;
    const elapsedEl = card.querySelector(".timer-elapsed");
    if (!elapsedEl) return;
    elapsedEl.textContent = formatElapsed(Date.now() - timer.resetTime);
  });
}, 1000);

render();
