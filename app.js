
let events = [];
let feedInterval = 3.5 * 60 * 60 * 1000;
let sleepInterval = 2 * 60 * 60 * 1000;
let nextFeedManual = null;
let nextSleepManual = null;

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

    let feedTime = nextFeedManual;
    let sleepTime = nextSleepManual;

    if (!feedTime) {
        const lastFeed = [...events].filter(e => e.type.toLowerCase().includes("кормление")).sort((a,b) => b.timestamp - a.timestamp)[0];
        if (lastFeed) feedTime = lastFeed.timestamp + feedInterval;
    }

    if (!sleepTime) {
        const lastSleep = [...events].filter(e => e.type.toLowerCase().includes("проснулся")).sort((a,b) => b.timestamp - a.timestamp)[0];
        if (lastSleep) sleepTime = lastSleep.timestamp + sleepInterval;
    }

    nextFeedEl.textContent = feedTime ? (feedTime - now > 0 ? formatMs(feedTime - now, feedTime) : `уже пора! ${formatMs(feedTime - now, feedTime, true)}`) : "–";
    nextSleepEl.textContent = sleepTime ? (sleepTime - now > 0 ? formatMs(sleepTime - now, sleepTime) : `уже пора! ${formatMs(sleepTime - now, sleepTime, true)}`) : "–";
}

function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}
function changeSettings() {
    openModal("settingsModal");
}
function saveTimeSettings() {
    const feedTime = document.getElementById("feedTimeInput").value;
    const sleepTime = document.getElementById("sleepTimeInput").value;
    if (feedTime) {
        const [h, m] = feedTime.split(":");
        const d = new Date();
        d.setHours(h, m, 0, 0);
        nextFeedManual = d.getTime();
    }
    if (sleepTime) {
        const [h, m] = sleepTime.split(":");
        const d = new Date();
        d.setHours(h, m, 0, 0);
        nextSleepManual = d.getTime();
    }
    updateNextTimes();
    closeModal("settingsModal");
}
