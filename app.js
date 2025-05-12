
// Шаг 1: Модифицируем `addEvent` и `renderEvents` для отображения событий по дате

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

// Шаг 2: Обновляем сохранение интервалов с часами и минутами
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

// Остальной код (logEvent, manualEntry, updateNextTimes и т.д.) остается без изменений
