
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


function formatDateLabel(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Сегодня";
    if (date.toDateString() === yesterday.toDateString()) return "Вчера";

    return date.toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderEvents() {
    const historyList = document.getElementById('eventHistory');
    historyList.innerHTML = '';

    const sorted = [...events].sort((a, b) => b.timestamp - a.timestamp);

    const grouped = {};
    sorted.forEach(event => {
        const d = new Date(event.timestamp);
        const label = formatDateLabel(d);
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(event);
    });

    Object.entries(grouped).forEach(([label, items]) => {
        const dateHeader = document.createElement('li');
        dateHeader.textContent = label;
        dateHeader.className = 'event-date-label';
        historyList.appendChild(dateHeader);

        items.forEach(event => {
            const item = document.createElement('li');
            const timeStr = new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
            item.classList.add('event-item');

            const textSpan = document.createElement('span');
            textSpan.textContent = `${event.type} — ${timeStr}`;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '✖';
            deleteBtn.onclick = () => {
                if (confirm("Удалить это событие?")) {
                    events = events.filter(e => e.id !== event.id);
                    renderEvents();
                    updateNextTimes();
                }
            };

            item.appendChild(textSpan);
            item.appendChild(deleteBtn);
            historyList.appendChild(item);
        });
    });

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
    document.getElementById("feedIntervalInput").value = Math.floor(feedInterval / 60000);
    document.getElementById("sleepIntervalInput").value = Math.floor(sleepInterval / 60000);
    openModal("settingsModal");
}
function saveIntervalSettings() {
    const feed = parseInt(document.getElementById("feedIntervalInput").value);
    const sleep = parseInt(document.getElementById("sleepIntervalInput").value);
    if (!isNaN(feed)) feedInterval = feed * 60000;
    if (!isNaN(sleep)) sleepInterval = sleep * 60000;
    updateNextTimes();
    closeModal("settingsModal");
}


let manualEventType = 'Кормление';

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
