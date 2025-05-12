
let events = [];

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

    // Преобразуем время в timestamp
    const [hours, minutes] = timeInput.split(':');
    const now = new Date();
    now.setHours(parseInt(hours));
    now.setMinutes(parseInt(minutes));
    now.setSeconds(0);
    const timestamp = now.getTime();

    addEvent(type, timeInput, timestamp);
}

function addEvent(type, timeStr, timestamp) {
    const id = Date.now() + Math.random(); // уникальный id
    events.push({ id, type, timeStr, timestamp });
    renderEvents();
}

function renderEvents() {
    const historyList = document.getElementById('eventHistory');
    historyList.innerHTML = '';
    // Сортировка по timestamp по возрастанию
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    sorted.forEach(event => {
        const item = document.createElement('li');
        item.textContent = `${event.type} — ${event.timeStr}`;
        item.onclick = () => {
            if (confirm("Удалить это событие?")) {
                events = events.filter(e => e.id !== event.id);
                renderEvents();
            }
        };
        historyList.appendChild(item);
    });
}
