
let events = [];
let feedInterval = 3.5 * 60 * 60 * 1000;  // 3 ч 30 мин
let sleepInterval = 2 * 60 * 60 * 1000;   // 2 ч 00 мин

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

function updateNextTimes() {
    const nextFeedEl = document.getElementById("nextFeed");
    const nextSleepEl = document.getElementById("nextSleep");

    const now = Date.now();

    const lastFeed = [...events].filter(e => e.type.toLowerCase().includes("кормление")).sort((a,b) => b.timestamp - a.timestamp)[0];
    const lastSleep = [...events].filter(e => e.type.toLowerCase().includes("проснулся")).sort((a,b) => b.timestamp - a.timestamp)[0];

    let nextFeedStr = "–";
    let nextSleepStr = "–";

    if (lastFeed) {
        const nextFeedTime = lastFeed.timestamp + feedInterval - now;
        if (nextFeedTime > 0) {
            nextFeedStr = formatMs(nextFeedTime);
        } else {
            nextFeedStr = "уже пора!";
        }
    }

    if (lastSleep) {
        const nextSleepTime = lastSleep.timestamp + sleepInterval - now;
        if (nextSleepTime > 0) {
            nextSleepStr = formatMs(nextSleepTime);
        } else {
            nextSleepStr = "уже пора!";
        }
    }

    nextFeedEl.textContent = nextFeedStr;
    nextSleepEl.textContent = nextSleepStr;
}

function formatMs(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} ч ${minutes} мин`;
}


function changeSettings() {
    const feed = prompt("Интервал между кормлениями (в минутах):", "210");
    const sleep = prompt("Интервал между снами (в минутах):", "120");

    if (feed && !isNaN(feed)) {
        feedInterval = parseInt(feed) * 60 * 1000;
    }
    if (sleep && !isNaN(sleep)) {
        sleepInterval = parseInt(sleep) * 60 * 1000;
    }

    updateNextTimes();
}
