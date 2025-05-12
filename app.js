let manualEventType = 'Кормление';

let events = [];
let feedInterval = 210 * 60 * 1000;
let sleepInterval = 120 * 60 * 1000;

function logEvent(type) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestamp = now.getTime();
    addEvent(type, timeStr, timestamp);
}

function manualEntry() {
    const type = prompt("Тип события (Кормление / Заснул / Проснулся):");
    if (!type) return;
    const timeInput = prompt("Время (напр. 14:30):");
    if (!timeInput) return;
    const [hours, minutes] = timeInput.split(':');
    const now = new Date();
    now.setHours(parseInt(hours));
    now.setMinutes(parseInt(minutes));
    now.setSeconds(0);
    const timestamp = now.getTime();
    addEvent(type, timeInput, timestamp);
}

function addEvent(type, timeStr, timestamp) {
    const id = Date.now() + Math.random();
    events.push({ id, type, timeStr, timestamp });
    renderEvents();
    updateNextTimes();
}

function renderEvents() {
    const historyList = document.getElementById('eventHistory');
    historyList.innerHTML = '';
    const sorted = [...events].sort((a, b) => b.timestamp - a.timestamp);
    sorted.forEach(event => {
        const item = document.createElement('li');
        item.textContent = `${event.type} — ${event.timeStr}`;
        item.onclick = () => {
            if (confirm("Удалить это событие?")) {
                events = events.filter(e => e.id !== event.id);
                renderEvents();
                updateNextTimes();
            }
        };
        historyList.appendChild(item);
    });
}

function formatMs(ms, baseTimestamp = null, past = false) {
    const totalMinutes = Math.floor(Math.abs(ms) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let timeStr = hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
    if (baseTimestamp) {
        const target = new Date(baseTimestamp);
        timeStr += ` (${target.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
    }
    return past ? `${timeStr} назад` : timeStr;
}

function updateNextTimes() {
    const nextFeedEl = document.getElementById("nextFeed");
    const nextSleepEl = document.getElementById("nextSleep");
    const now = Date.now();

    let feedTime = null;
    let sleepTime = null;

    const lastFeed = [...events].filter(e => e.type.toLowerCase().includes("кормление")).sort((a,b) => b.timestamp - a.timestamp)[0];
    if (lastFeed) {
        feedTime = lastFeed.timestamp + feedInterval;
    }

    const lastSleep = [...events].filter(e => e.type.toLowerCase().includes("проснулся")).sort((a,b) => b.timestamp - a.timestamp)[0];
    if (lastSleep) {
        sleepTime = lastSleep.timestamp + sleepInterval;
    }

    nextFeedEl.textContent = feedTime
        ? (feedTime - now > 0
            ? formatMs(feedTime - now, feedTime)
            : `уже пора! ${formatMs(feedTime - now, feedTime, true)}`
        )
        : "–";

    nextSleepEl.textContent = sleepTime
        ? (sleepTime - now > 0
            ? formatMs(sleepTime - now, sleepTime)
            : `уже пора! ${formatMs(sleepTime - now, sleepTime, true)}`
        )
        : "–";
}

function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function changeSettings() {
    const feedMins = feedInterval / 60000;
    const sleepMins = sleepInterval / 60000;
    document.getElementById("feedHours").value = Math.floor(feedMins / 60);
    document.getElementById("feedMinutes").value = feedMins % 60;
    document.getElementById("sleepHours").value = Math.floor(sleepMins / 60);
    document.getElementById("sleepMinutes").value = sleepMins % 60;
    openModal("settingsModal");
}


function saveIntervalSettings() {
    const fh = parseInt(document.getElementById("feedHours").value) || 0;
    const fm = parseInt(document.getElementById("feedMinutes").value) || 0;
    const sh = parseInt(document.getElementById("sleepHours").value) || 0;
    const sm = parseInt(document.getElementById("sleepMinutes").value) || 0;

    feedInterval = (fh * 60 + fm) * 60000;
    sleepInterval = (sh * 60 + sm) * 60000;

    updateNextTimes();
    closeModal("settingsModal");
}





function openManualModal() {
    manualEventType = "Кормление"; selectEventType("Кормление");
    openModal("manualModal");
}

function toggleManualFields() {
    const type = manualEventType;
    document.getElementById("feedTimeBlock").classList.toggle("hidden", type !== "Кормление");
    document.getElementById("sleepTimeBlock").classList.toggle("hidden", type !== "Сон");
}

function saveManualEvent() {
    const type = manualEventType;

    if (type === "Кормление") {
        const timeStr = document.getElementById("feedTimeInputManual").value;
        if (!timeStr) return alert("Укажите время кормления");
        const [h, m] = timeStr.split(":");
        const d = new Date();
        d.setHours(h, m, 0, 0);
        addEvent("Кормление", timeStr, d.getTime());
    } else if (type === "Сон") {
        const sleepStart = document.getElementById("sleepStartInput").value;
        const sleepEnd = document.getElementById("sleepEndInput").value;
        if (!sleepStart || !sleepEnd) return alert("Укажите оба времени сна");
        const now = new Date();
        const start = new Date(now); const end = new Date(now);
        const [sh, sm] = sleepStart.split(":"); start.setHours(sh, sm, 0, 0);
        const [eh, em] = sleepEnd.split(":"); end.setHours(eh, em, 0, 0);
        addEvent("Заснул", sleepStart, start.getTime());
        addEvent("Проснулся", sleepEnd, end.getTime());
    }

    closeModal("manualModal");
}



function selectEventType(type) {
  const slider = document.getElementById("eventSlider");
  if (slider) {
    slider.style.left = type === "Кормление" ? "0%" : "50%";
  }

  manualEventType = type;
  document.getElementById("typeFeed").classList.toggle("active", type === "Кормление");
  document.getElementById("typeSleep").classList.toggle("active", type === "Сон");
  toggleManualFields();
}
