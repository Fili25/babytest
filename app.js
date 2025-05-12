
function logEvent(type) {
    const now = new Date();
    const time = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const entry = `${type} — ${time}`;
    const historyList = document.getElementById('eventHistory');
    const item = document.createElement('li');
    item.textContent = entry;
    historyList.prepend(item);
}

function manualEntry() {
    const type = prompt("Тип события (Кормление / Заснул / Проснулся):");
    if (!type) return;
    const time = prompt("Время (напр. 14:30):");
    if (!time) return;
    const entry = `${type} — ${time}`;
    const historyList = document.getElementById('eventHistory');
    const item = document.createElement('li');
    item.textContent = entry;
    historyList.prepend(item);
}
