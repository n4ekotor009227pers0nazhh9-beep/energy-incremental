// === ИГРОВЫЕ ДАННЫЕ ===
const BASE_INTERVAL = 1000;                // начальный интервал в мс
const DECREASE_PER_UPGRADE = BASE_INTERVAL * 0.05; // 50 мс за покупку

const game = {
    energy: 0.0,
    baseProduction: 0.1,
    productionMultiplier: 1,
    interval: BASE_INTERVAL,               // текущий интервал
    prodPrice: 1,
    prodPriceMultiplier: 15,
    intervalUpgradeCount: 0,
    intervalPrice: 5,
    intervalPriceMultiplier: 20,
    maxIntervalUpgrades: 10,
};

// === DOM ===
const energyDisplay = document.getElementById('energy-amount');
const prodBtn = document.getElementById('prod-upgrade-btn');
const prodPriceSpan = document.getElementById('prod-price');
const prodNextPriceSpan = document.getElementById('prod-next-price');
const intervalBtn = document.getElementById('interval-upgrade-btn');
const intervalCountSpan = document.getElementById('interval-count');
const intervalPriceSpan = document.getElementById('interval-price');
const intervalNextPriceSpan = document.getElementById('interval-next-price');
const autoTextSpan = document.getElementById('auto-text');

// === ВСПОМОГАТЕЛЬНЫЕ ===
function getActiveTab() {
    const energyPanel = document.getElementById('tab-energy');
    const autoPanel = document.getElementById('tab-automation');
    if (energyPanel.classList.contains('active')) return 'energy';
    if (autoPanel.classList.contains('active')) return 'automation';
    return 'energy';
}

// === НОВАЯ ФУНКЦИЯ ФОРМАТИРОВАНИЯ ЧИСЕЛ ===
function formatNumber(value) {
    // Для отрицательных или нуля – сразу возвращаем строку
    if (value < 0) return '-' + formatNumber(-value);
    if (value === 0) return '0';

    // Экспоненциальная нотация для >= 1e9
    if (value >= 1e9) {
        let exp = Math.floor(Math.log10(value));
        let mantissa = value / Math.pow(10, exp);
        mantissa = Math.round(mantissa * 100) / 100; // две значащие цифры после запятой
        return mantissa + 'e' + exp;
    }

    // Для чисел >= 100 000 – с пробелами, целые
    if (value >= 100000) {
        let intPart = Math.floor(value);
        return intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Для чисел меньше 100 000 – оставляем как раньше
    if (value >= 1000) {
        return Math.floor(value).toString();
    } else {
        return value.toFixed(1);
    }
}

// === ОБНОВЛЕНИЕ UI ===
function updateUI() {
    const active = getActiveTab();
    // всегда обновляем счётчик энергии
    energyDisplay.textContent = formatNumber(game.energy);

    if (active === 'energy') {
        // Производство
        prodPriceSpan.textContent = formatNumber(game.prodPrice);
        prodNextPriceSpan.textContent = formatNumber(game.prodPrice * game.prodPriceMultiplier);
        prodBtn.disabled = (game.energy < game.prodPrice);

        // Интервал
        intervalCountSpan.textContent = game.intervalUpgradeCount; // счётчик не форматируем
        intervalPriceSpan.textContent = formatNumber(game.intervalPrice);
        intervalNextPriceSpan.textContent = formatNumber(game.intervalPrice * game.intervalPriceMultiplier);
        if (game.intervalUpgradeCount >= game.maxIntervalUpgrades) {
            intervalBtn.disabled = true;
            intervalBtn.textContent = `Уменьшить интервал на 5% (${game.intervalUpgradeCount}/10) [МАКС]`;
        } else {
            intervalBtn.disabled = (game.energy < game.intervalPrice);
            intervalBtn.textContent = `Уменьшить интервал на 5% (${game.intervalUpgradeCount}/10)`;
        }
    }

    if (active === 'automation') {
        // Производство за один тик (за текущий интервал)
        const productionPerTick = game.baseProduction * game.productionMultiplier;
        // Интервал в секундах или миллисекундах
        let intervalDisplay;
        if (game.interval >= 1000) {
            intervalDisplay = (game.interval / 1000).toFixed(1) + ' с';
        } else {
            intervalDisplay = Math.round(game.interval) + ' мс';
        }
        autoTextSpan.innerHTML = `вы получаете <span class="energy-gold">+${formatNumber(productionPerTick)} Э</span> / ${intervalDisplay}`;
    }
}

// === ПОКУПКИ ===
function buyProductionUpgrade() {
    if (game.energy < game.prodPrice) {
        alert('Не хватает энергии!');
        return;
    }
    game.energy -= game.prodPrice;
    game.productionMultiplier *= 10;
    game.prodPrice *= game.prodPriceMultiplier;
    updateUI();
}

function buyIntervalUpgrade() {
    if (game.intervalUpgradeCount >= game.maxIntervalUpgrades) {
        alert('Достигнут лимит улучшений интервала!');
        return;
    }
    if (game.energy < game.intervalPrice) {
        alert('Не хватает энергии!');
        return;
    }
    game.energy -= game.intervalPrice;
    game.intervalUpgradeCount++;
    // Глобальное уменьшение: вычитаем фиксированное количество миллисекунд
    game.interval = Math.round(BASE_INTERVAL - game.intervalUpgradeCount * DECREASE_PER_UPGRADE);
    // Не даём уйти ниже 0 (но при 10 покупках будет 500 мс)
    if (game.interval < 0) game.interval = 0;
    game.intervalPrice *= game.intervalPriceMultiplier;
    startGameLoop();
    updateUI();
}

// === ТАЙМЕР ===
let timer = null;

function startGameLoop() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        const production = game.baseProduction * game.productionMultiplier;
        game.energy += production;
        updateUI();
    }, game.interval);
}

// === ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ===
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-button');
    const panels = {
        energy: document.getElementById('tab-energy'),
        automation: document.getElementById('tab-automation')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            Object.values(panels).forEach(p => p.classList.remove('active'));
            const tabId = this.dataset.tab;
            if (panels[tabId]) panels[tabId].classList.add('active');

            updateUI();
        });
    });

    prodBtn.addEventListener('click', buyProductionUpgrade);
    intervalBtn.addEventListener('click', buyIntervalUpgrade);

    updateUI();
    startGameLoop();
});
