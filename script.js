// === ИГРОВЫЕ ДАННЫЕ ===
const BASE_INTERVAL = 1000;
const DECREASE_PER_UPGRADE = BASE_INTERVAL * 0.05;

const game = {
    energy: 0.0,
    baseProduction: 0.1,
    productionMultiplier: 1,
    interval: BASE_INTERVAL,
    prodPrice: 1,
    prodPriceMultiplier: 15,
    intervalUpgradeCount: 0,
    intervalPrice: 5,
    intervalPriceMultiplier: 20,
    passiveCount: 0,
    passiveMaxCount: 5,
    passivePrice: 1000000,
    passivePriceExponent: 1.1,
    prestigeCount: 0,
    prestigePrice: 5e9,
    prestigePriceMultiplier: 10,
    prestigeMultiplier: 1,
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
const passiveBtn = document.getElementById('passive-upgrade-btn');
const passiveCountSpan = document.getElementById('passive-count');
const passiveMaxDisplaySpan = document.getElementById('passive-max-display');
const passivePriceSpan = document.getElementById('passive-price');
const passiveNextPriceSpan = document.getElementById('passive-next-price');
const prestigeItem = document.getElementById('prestige-item');
const prestigeBtn = document.getElementById('prestige-upgrade-btn');
const prestigePriceSpan = document.getElementById('prestige-price');
const prestigeNextPriceSpan = document.getElementById('prestige-next-price');
const prestigeDisplay = document.getElementById('prestige-display');
const prestigeMultiplierDisplay = document.getElementById('prestige-multiplier-display');
const autoTextSpan = document.getElementById('auto-text');
const autoPassiveTextSpan = document.getElementById('auto-passive-text');
const autoPassiveContainer = document.getElementById('automation-passive');
const debugBoostBtn = document.getElementById('debug-boost-btn');
const debugBoost1000Btn = document.getElementById('debug-boost-1000-btn');
const debugBoost1e6Btn = document.getElementById('debug-boost-1e6-btn');
const debugAddPrestigeBtn = document.getElementById('debug-add-prestige-btn');
const debugAdd10PrestigeBtn = document.getElementById('debug-add-10-prestige-btn');
const debugMultiplyPrestigeBtn = document.getElementById('debug-multiply-prestige-btn');

// === DOM ДЛЯ САЙДБАРА ===
const energyTabButton = document.getElementById('energy-tab-button');
const energyDropdownSidebar = document.getElementById('energy-dropdown-sidebar');
const dropdownHeader = document.getElementById('energy-dropdown-header');
const dropdownArrow = document.getElementById('dropdown-arrow');
const dropdownListSidebar = document.getElementById('dropdown-list-sidebar');
const dropdownItemsSidebar = document.querySelectorAll('#energy-dropdown-sidebar .dropdown-item');

// === ПАНЕЛИ ПОДВКЛАДОК ===
const subtabPanels = {
    columns: document.getElementById('subtab-columns'),
    dimensions: document.getElementById('subtab-dimensions')
};

const energyDisplayBlock = document.getElementById('energy-display');
const separatorLine = document.getElementById('separator');

let selectedSubtab = 'columns';
let isDropdownExpanded = true;

// === ВСПОМОГАТЕЛЬНЫЕ ===
function getActiveTab() {
    const energyPanel = document.getElementById('tab-energy');
    const autoPanel = document.getElementById('tab-automation');
    if (energyPanel.classList.contains('active')) return 'energy';
    if (autoPanel.classList.contains('active')) return 'automation';
    return 'energy';
}

function formatNumber(value) {
    if (value < 0) return '-' + formatNumber(-value);
    if (value === 0) return '0.00';
    if (value <= 1000) return value.toFixed(2);
    if (value >= 1e9) {
        let exp = Math.floor(Math.log10(value));
        let mantissa = value / Math.pow(10, exp);
        mantissa = Math.round(mantissa * 100) / 100;
        return mantissa + 'e' + exp;
    }
    if (value >= 100000) {
        let intPart = Math.floor(value);
        return intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return Math.floor(value).toString();
}

function formatInterval(ms) {
    if (ms >= 1000) return (ms / 1000).toFixed(1) + ' с';
    else return Math.round(ms) + ' мс';
}

function getProductionPerTick() {
    const base = game.baseProduction * game.productionMultiplier;
    const passiveBonus = base * 0.05 * game.passiveCount;
    return (base + passiveBonus) * game.prestigeMultiplier;
}

function getPrestigeWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'Престиж';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'Престижа';
    return 'Престижей';
}

function performPrestige() {
    game.energy = 0;
    game.productionMultiplier = 1;
    game.prodPrice = 1;
    game.interval = BASE_INTERVAL;
    game.intervalUpgradeCount = 0;
    game.intervalPrice = 5;
    game.passiveCount = 0;
    game.passivePrice = 1000000;
    game.passiveMaxCount += 1;
    game.prestigeCount++;
    game.prestigePrice *= game.prestigePriceMultiplier;
    game.prestigeMultiplier *= 1.03;
    startGameLoop();
    updateUI();
}

function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-button');
    const panels = {
        energy: document.getElementById('tab-energy'),
        automation: document.getElementById('tab-automation')
    };
    tabs.forEach(t => t.classList.remove('active'));
    const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (activeButton) activeButton.classList.add('active');
    Object.values(panels).forEach(p => p.classList.remove('active'));
    if (panels[tabId]) panels[tabId].classList.add('active');
    updateUI();
}

function updateUI() {
    const active = getActiveTab();
    energyDisplay.textContent = formatNumber(game.energy);
    passiveMaxDisplaySpan.textContent = game.passiveMaxCount;

    // Сайдбар
    const showDropdown = (game.prestigeCount >= 5);
    if (showDropdown) {
        energyTabButton.style.display = 'none';
        energyDropdownSidebar.style.display = 'block';
        if (active === 'energy') {
            dropdownHeader.classList.add('active');
        } else {
            dropdownHeader.classList.remove('active');
        }
        dropdownArrow.textContent = isDropdownExpanded ? '▾' : '▸';
        if (isDropdownExpanded) {
            dropdownListSidebar.classList.remove('collapsed');
        } else {
            dropdownListSidebar.classList.add('collapsed');
        }
        dropdownItemsSidebar.forEach(item => {
            item.classList.remove('active');
            if (active === 'energy' && item.dataset.subtab === selectedSubtab) {
                item.classList.add('active');
            }
        });
    } else {
        energyTabButton.style.display = 'block';
        energyDropdownSidebar.style.display = 'none';
        if (active === 'energy') {
            energyTabButton.classList.add('active');
        } else {
            energyTabButton.classList.remove('active');
        }
    }

    // Содержимое вкладки Энергия
    if (active === 'energy') {
        const isDimensions = (selectedSubtab === 'dimensions');
        if (isDimensions) {
            energyDisplayBlock.style.display = 'none';
            separatorLine.style.display = 'none';
        } else {
            energyDisplayBlock.style.display = 'block';
            separatorLine.style.display = 'block';
        }

        // Улучшение 1
        prodPriceSpan.textContent = formatNumber(game.prodPrice);
        prodNextPriceSpan.textContent = formatNumber(game.prodPrice * game.prodPriceMultiplier);
        prodBtn.disabled = (game.energy < game.prodPrice);

        // Улучшение 2
        intervalCountSpan.textContent = game.intervalUpgradeCount;
        intervalPriceSpan.textContent = formatNumber(game.intervalPrice);
        intervalNextPriceSpan.textContent = formatNumber(game.intervalPrice * game.intervalPriceMultiplier);
        if (game.intervalUpgradeCount >= 10) {
            intervalBtn.disabled = true;
            intervalBtn.textContent = `Уменьшить интервал на 5% (${game.intervalUpgradeCount}/10)`;
        } else {
            intervalBtn.disabled = (game.energy < game.intervalPrice);
            const currentInterval = game.interval;
            const nextInterval = Math.round(BASE_INTERVAL - (game.intervalUpgradeCount + 1) * DECREASE_PER_UPGRADE);
            const nextDisplay = nextInterval > 0 ? formatInterval(nextInterval) : '0 мс';
            intervalBtn.textContent = `Уменьшить интервал на 5% (${game.intervalUpgradeCount}/10) [${formatInterval(currentInterval)} → ${nextDisplay}]`;
        }

        // Улучшение 3
        passiveCountSpan.textContent = game.passiveCount;
        passivePriceSpan.textContent = formatNumber(game.passivePrice);
        const nextPassivePrice = Math.pow(game.passivePrice, game.passivePriceExponent);
        passiveNextPriceSpan.textContent = formatNumber(nextPassivePrice);

        const reachedLimit = (game.passiveCount >= game.passiveMaxCount);
        if (reachedLimit) {
            passiveBtn.disabled = true;
            passiveBtn.textContent = `Пассивная генерация +5% от роста Энергии (${game.passiveCount}/${game.passiveMaxCount})`;
        } else {
            passiveBtn.disabled = (game.energy < game.passivePrice);
            passiveBtn.textContent = `Пассивная генерация +5% от роста Энергии (${game.passiveCount}/${game.passiveMaxCount})`;
        }

        // Престиж
        const showPrestige = reachedLimit || (game.prestigeCount >= 1);
        if (showPrestige) {
            prestigeItem.style.display = 'flex';
            prestigePriceSpan.textContent = formatNumber(game.prestigePrice);
            prestigeNextPriceSpan.textContent = formatNumber(game.prestigePrice * game.prestigePriceMultiplier);
            const canPrestige = reachedLimit && (game.energy >= game.prestigePrice);
            prestigeBtn.disabled = !canPrestige;
            if (reachedLimit) {
                prestigeBtn.innerHTML = `Создать престиж<br>(сброс и +1 к лимиту)`;
            } else {
                prestigeBtn.innerHTML = `Престиж (нужно достичь лимита ${game.passiveMaxCount})<br>(сброс и +1 к лимиту)`;
            }
        } else {
            prestigeItem.style.display = 'none';
        }

        // Престижи и множитель
        if (game.prestigeCount >= 1) {
            const word = getPrestigeWord(game.prestigeCount);
            prestigeDisplay.style.display = 'block';
            prestigeDisplay.innerHTML = `У вас <span class="prestige-number">${game.prestigeCount}</span> ${word}`;
        } else {
            prestigeDisplay.style.display = 'none';
        }

        if (game.prestigeCount >= 1) {
            prestigeMultiplierDisplay.style.display = 'block';
            prestigeMultiplierDisplay.innerHTML = `Рост увеличен в 1.03<sup>${game.prestigeCount}</sup> раз`;
        } else {
            prestigeMultiplierDisplay.style.display = 'none';
        }

        // Переключение панелей подразделов
        Object.keys(subtabPanels).forEach(key => {
            subtabPanels[key].classList.remove('active');
        });
        if (subtabPanels[selectedSubtab]) {
            subtabPanels[selectedSubtab].classList.add('active');
        }
    }

    // Автоматика
    if (active === 'automation') {
        const productionPerTick = getProductionPerTick();
        let intervalDisplay;
        if (game.interval >= 1000) {
            intervalDisplay = (game.interval / 1000).toFixed(1) + ' с';
        } else {
            intervalDisplay = Math.round(game.interval) + ' мс';
        }
        autoTextSpan.innerHTML = `вы получаете <span class="energy-gold">+${formatNumber(productionPerTick)} Э</span> / ${intervalDisplay}`;

        const showPassive = (game.passiveCount > 0) || (game.prestigeCount >= 1);
        if (showPassive) {
            autoPassiveContainer.style.display = 'block';
            const passivePercent = game.passiveCount * 5;
            autoPassiveTextSpan.textContent = `вы пассивно получаете +${passivePercent}% к вашему росту`;
        } else {
            autoPassiveContainer.style.display = 'none';
        }
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
    if (game.intervalUpgradeCount >= 10) {
        alert('Достигнут лимит улучшений интервала!');
        return;
    }
    if (game.energy < game.intervalPrice) {
        alert('Не хватает энергии!');
        return;
    }
    game.energy -= game.intervalPrice;
    game.intervalUpgradeCount++;
    game.interval = Math.round(BASE_INTERVAL - game.intervalUpgradeCount * DECREASE_PER_UPGRADE);
    if (game.interval < 0) game.interval = 0;
    game.intervalPrice *= game.intervalPriceMultiplier;
    startGameLoop();
    updateUI();
}

function buyPassiveUpgrade() {
    if (game.passiveCount >= game.passiveMaxCount) {
        alert('Достигнут лимит пассивной автоматики!');
        return;
    }
    if (game.energy < game.passivePrice) {
        alert('Не хватает энергии!');
        return;
    }
    game.energy -= game.passivePrice;
    game.passiveCount++;
    game.passivePrice = Math.pow(game.passivePrice, game.passivePriceExponent);
    game.passivePrice = Math.round(game.passivePrice);
    updateUI();
}

function buyPrestige() {
    if (game.passiveCount < game.passiveMaxCount) {
        alert('Сначала достигните лимита пассивной автоматики!');
        return;
    }
    if (game.energy < game.prestigePrice) {
        alert('Не хватает энергии для престижа!');
        return;
    }
    game.energy -= game.prestigePrice;
    performPrestige();
}

// === DEBUG-БУСТЫ ===
function debugBoost(multiplier) {
    game.productionMultiplier *= multiplier;
    updateUI();
    console.log(`Debug: productionMultiplier умножен на ${multiplier}, теперь =`, game.productionMultiplier);
}

// === ТЕСТОВЫЕ ПРЕСТИЖИ (с полным сбросом) ===
function addPrestige(count) {
    // Выполняем обычный престиж (сброс и +1)
    performPrestige();
    // Добавляем (count - 1) дополнительных престижей без сброса
    for (let i = 0; i < count - 1; i++) {
        game.prestigeCount++;
        game.prestigeMultiplier *= 1.03;
        game.passiveMaxCount += 1;
        game.prestigePrice *= game.prestigePriceMultiplier;
    }
    updateUI();
    startGameLoop();
    console.log(`Debug: добавлено ${count} престижей (с полным сбросом), теперь prestigeCount = ${game.prestigeCount}`);
}

// === ТАЙМЕР ===
let timer = null;

function startGameLoop() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        const production = getProductionPerTick();
        game.energy += production;
        updateUI();
    }, game.interval);
}

// === УПРАВЛЕНИЕ СВОРАЧИВАНИЕМ ===
function toggleDropdown() {
    isDropdownExpanded = !isDropdownExpanded;
    updateUI();
}

// === ВЫБОР ПОДРАЗДЕЛА ===
function selectSubtab(subtabId) {
    selectedSubtab = subtabId;
    switchTab('energy');
    updateUI();
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            if (tabId) switchTab(tabId);
        });
    });

    dropdownHeader.addEventListener('click', toggleDropdown);

    dropdownItemsSidebar.forEach(item => {
        item.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            if (subtab) selectSubtab(subtab);
        });
    });

    prodBtn.addEventListener('click', buyProductionUpgrade);
    intervalBtn.addEventListener('click', buyIntervalUpgrade);
    passiveBtn.addEventListener('click', buyPassiveUpgrade);
    prestigeBtn.addEventListener('click', buyPrestige);

    debugBoostBtn.addEventListener('click', function() { debugBoost(10); });
    debugBoost1000Btn.addEventListener('click', function() { debugBoost(1000); });
    debugBoost1e6Btn.addEventListener('click', function() { debugBoost(1000000); });
    debugAddPrestigeBtn.addEventListener('click', function() { addPrestige(1); });
    debugAdd10PrestigeBtn.addEventListener('click', function() { addPrestige(10); });
    debugMultiplyPrestigeBtn.addEventListener('click', function() {
        if (game.prestigeCount === 0) {
            alert('Нет престижей для умножения!');
            return;
        }
        const currentCount = game.prestigeCount;
        // Сначала выполняем обычный престиж (сброс и +1)
        performPrestige();
        // Добавляем (currentCount * 10 - 1) дополнительных престижей
        const extra = currentCount * 10 - 1;
        for (let i = 0; i < extra; i++) {
            game.prestigeCount++;
            game.prestigeMultiplier *= 1.03;
            game.passiveMaxCount += 1;
            game.prestigePrice *= game.prestigePriceMultiplier;
        }
        updateUI();
        startGameLoop();
        console.log(`Debug: умножение престижей на 10, теперь prestigeCount = ${game.prestigeCount}`);
    });

    updateUI();
    startGameLoop();
});
