let selectedMySkinIndex = null;
let selectedTargetSkin = null;

function selectMySkin() {
    if (inventory.length === 0) {
        showAlert("У вас нет скинов в инвентаре!");
        return;
    }

    selectedMySkinIndex = 0;
    const mySkin = inventory[0];

    document.getElementById('my-skin-img').innerHTML =
        `<img src="${mySkin.img}">`;

    document.getElementById('my-skin-name').innerText = mySkin.name;

    updateUpgradeChance();
}

function selectTargetSkin() {
    const targets = casesData["Dune"];

    selectedTargetSkin =
        targets[Math.floor(Math.random() * targets.length)];

    document.getElementById('target-skin-img').innerHTML =
        `<img src="${selectedTargetSkin.img}">`;

    document.getElementById('target-skin-name').innerText =
        selectedTargetSkin.name;

    updateUpgradeChance();
}

function updateUpgradeChance() {
    if (selectedMySkinIndex === null || !selectedTargetSkin) {
        document.getElementById('upgrade-chance').innerText = "0%";
        return;
    }

    const mySkin = inventory[selectedMySkinIndex];

    if (!mySkin) return;

    let chance = (mySkin.price / selectedTargetSkin.price) * 100;
    chance = Math.min(90, Math.max(1, chance));

    document.getElementById('upgrade-chance').innerText =
        chance.toFixed(1) + "%";
}

function doUpgrade() {
    if (selectedMySkinIndex === null || !selectedTargetSkin) {
        showAlert("Выберите скин и цель!");
        return;
    }

    showAlert("Выбран апгрейд. Для его завершения нужна отдельная настройка механики обмена.");
}

function resetUpgrade() {
    selectedMySkinIndex = null;
    selectedTargetSkin = null;

    document.getElementById('my-skin-img').innerHTML = "+";
    document.getElementById('my-skin-name').innerText = "Выбрать мой скин";
    document.getElementById('target-skin-img').innerHTML = "?";
    document.getElementById('target-skin-name').innerText = "Выбрать цель";
    document.getElementById('upgrade-chance').innerText = "0%";
}

function updateFreeCaseTimer() {
    const cooldown = 24 * 60 * 60 * 1000;
    const timeLeft = cooldown - (Date.now() - lastFreeCaseTime);

    const btn = document.getElementById('btn-free-case');
    const timerText = document.getElementById('free-timer-text');

    if (!btn || !timerText) return;

    if (timeLeft <= 0) {
        btn.disabled = false;
        btn.innerText = "Открыть бесплатно";
        timerText.innerText = "Доступен!";
        return;
    }

    btn.disabled = true;

    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);

    btn.innerText = "Недоступно";
    timerText.innerText =
        `Следующий через: ${hours} ч ${minutes} мин`;
}

function openFreeCase() {
    const cooldown = 24 * 60 * 60 * 1000;

    if (Date.now() - lastFreeCaseTime < cooldown) {
        updateFreeCaseTimer();
        return;
    }

    lastFreeCaseTime = Date.now();
    saveProgress();

    updateFreeCaseTimer();
    runRoulette('FreeCase');
}

updateFreeCaseTimer();
