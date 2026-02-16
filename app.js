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

function editTimer(id) {
  const timer = state.timers.find((t) => t.id === id);
  if (!timer) return;
  const card = document.querySelector(`.timer-card[data-id="${id}"]`);
  if (!card) return;
  card.innerHTML = `
    <div class="edit-form">
      <label>Name<input type="text" class="edit-name" value="${esc(timer.name)}"></label>
      <label>Category<input type="text" class="edit-category" value="${esc(timer.category)}" list="category-list"></label>
      <label>Color<input type="color" class="edit-color" value="${esc(timer.color)}"></label>
      <div class="edit-actions">
        <button class="edit-save-btn" onclick="saveEdit(${id})">save</button>
        <button class="edit-cancel-btn" onclick="render()">cancel</button>
      </div>
    </div>`;
  card.querySelector(".edit-name").focus();
}

function saveEdit(id) {
  const timer = state.timers.find((t) => t.id === id);
  if (!timer) return;
  const card = document.querySelector(`.timer-card[data-id="${id}"]`);
  if (!card) return;
  const name = card.querySelector(".edit-name").value.trim();
  if (!name) {
    card.querySelector(".edit-name").focus();
    return;
  }
  timer.name = name;
  timer.category = card.querySelector(".edit-category").value.trim() || "Uncategorized";
  timer.color = card.querySelector(".edit-color").value;
  saveState();
  render();
}

function moveTimer(id, direction) {
  const idx = state.timers.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= state.timers.length) return;
  const [moved] = state.timers.splice(idx, 1);
  state.timers.splice(newIdx, 0, moved);
  saveState();
  render();
  const card = document.querySelector(`.timer-card[data-id="${id}"]`);
  if (card) card.focus();
}

function onTimerKeydown(e) {
  if (!e.altKey) return;
  const id = Number(e.currentTarget.dataset.id);
  if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
    e.preventDefault();
    moveTimer(id, -1);
  } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
    e.preventDefault();
    moveTimer(id, 1);
  }
}

function sanitizeColor(c) {
  return /^#[0-9a-f]{6}$/i.test(c) ? c : "#e53935";
}

let dragId = null;

function onDragStart(e) {
  dragId = Number(e.currentTarget.dataset.id);
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const card = e.currentTarget;
  if (Number(card.dataset.id) !== dragId) {
    card.classList.add("drag-over");
  }
}

function onDrop(e) {
  e.preventDefault();
  const targetId = Number(e.currentTarget.dataset.id);
  e.currentTarget.classList.remove("drag-over");
  if (dragId === null || dragId === targetId) return;
  const fromIdx = state.timers.findIndex((t) => t.id === dragId);
  const toIdx = state.timers.findIndex((t) => t.id === targetId);
  if (fromIdx === -1 || toIdx === -1) return;
  const [moved] = state.timers.splice(fromIdx, 1);
  state.timers.splice(toIdx, 0, moved);
  saveState();
  render();
}

function onDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function onDragEnd(e) {
  dragId = null;
  document.querySelectorAll(".dragging, .drag-over").forEach((el) => {
    el.classList.remove("dragging", "drag-over");
  });
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
          <div class="timer-card" style="--card-color:${color}" data-id="${t.id}" tabindex="0" draggable="true" ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondragleave="onDragLeave(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)" onkeydown="onTimerKeydown(event)">
            <button class="delete-btn" onclick="deleteTimer(${t.id})" title="Delete" aria-label="Delete ${esc(t.name)}">&times;</button>
            <button class="edit-btn" onclick="editTimer(${t.id})" title="Edit" aria-label="Edit ${esc(t.name)}">&#9998;</button>
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

// Dark mode
const DARK_KEY = "but_did_i_dark";

function applyDarkMode(dark) {
  document.body.classList.toggle("dark", dark);
  document.getElementById("btn-dark-mode").textContent = dark ? "light" : "dark";
}

function initDarkMode() {
  const stored = localStorage.getItem(DARK_KEY);
  if (stored !== null) {
    applyDarkMode(stored === "1");
  } else {
    applyDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
}

document.getElementById("btn-dark-mode").addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");
  localStorage.setItem(DARK_KEY, isDark ? "1" : "0");
  applyDarkMode(isDark);
});

initDarkMode();

// Fullscreen
const btnFullscreen = document.getElementById("btn-fullscreen");

function updateFullscreenBtn() {
  btnFullscreen.textContent = document.fullscreenElement ? "exit" : "fullscreen";
}

btnFullscreen.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});

document.addEventListener("fullscreenchange", updateFullscreenBtn);

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
