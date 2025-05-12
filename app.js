
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 86400000);

    let currentDateLabel = null;

    sorted.forEach(event => {
        const eventDate = new Date(event.timestamp);
        eventDate.setHours(0, 0, 0, 0);

        let dateLabel;
        if (eventDate.getTime() === today.getTime()) {
            dateLabel = null;
        } else if (eventDate.getTime() === yesterday.getTime()) {
            dateLabel = 'Вчера';
        } else {
            dateLabel = eventDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        if (dateLabel && dateLabel !== currentDateLabel) {
            const labelEl = document.createElement('li');
            labelEl.textContent = dateLabel;
            labelEl.classList.add('date-label');
            historyList.appendChild(labelEl);
            currentDateLabel = dateLabel;
        }

        const item = document.createElement('li');
        item.classList.add('event-item');
        const spanText = document.createElement('span');
        spanText.textContent = `${event.type} — ${event.timeStr}`;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✖';
        removeBtn.className = 'remove-button';
        removeBtn.onclick = () => {
            if (confirm("Удалить это событие?")) {
                events = events.filter(e => e.id !== event.id);
                renderEvents();
                updateNextTimes();
            }
        };
        item.appendChild(spanText);
        item.appendChild(removeBtn);
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
    document.getElementById("feedHoursVal").textContent = Math.floor(feedMins / 60);
    document.getElementById("feedMinutesVal").textContent = feedMins % 60;
    document.getElementById("sleepHoursVal").textContent = Math.floor(sleepMins / 60);
    document.getElementById("sleepMinutesVal").textContent = sleepMins % 60;
    openModal("settingsModal");
}

function saveIntervalSettings() {
    const fh = parseInt(document.getElementById("feedHoursVal").textContent) || 0;
    const fm = parseInt(document.getElementById("feedMinutesVal").textContent) || 0;
    const sh = parseInt(document.getElementById("sleepHoursVal").textContent) || 0;
    const sm = parseInt(document.getElementById("sleepMinutesVal").textContent) || 0;

    feedInterval = (fh * 60 + fm) * 60000;
    sleepInterval = (sh * 60 + sm) * 60000;

    localStorage.setItem("feedInterval", feedInterval);
    localStorage.setItem("sleepInterval", sleepInterval);

    updateNextTimes();
    closeModal("settingsModal");
}

function updateDisplayValue(id, delta) {
    const el = document.getElementById(id);
    if (!el) return;
    let val = parseInt(el.textContent) || 0;
    val = Math.max(0, val + delta);
    el.textContent = val;
}

window.addEventListener("load", () => {
    const savedFeed = localStorage.getItem("feedInterval");
    const savedSleep = localStorage.getItem("sleepInterval");
    if (savedFeed) feedInterval = parseInt(savedFeed);
    if (savedSleep) sleepInterval = parseInt(savedSleep);
    updateNextTimes();
});
