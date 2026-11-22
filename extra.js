
let selectedMySkinIndex = null;
let selectedTargetSkin = null;

function selectMySkin() {
    if (inventory.length === 0) {
        showAlert("У вас нет скинов в инвентаре!");
        return;
    }

    // При повторном нажатии выбирается следующий предмет
    if (selectedMySkinIndex === null) {
        selectedMySkinIndex = 0;
    } else {
        selectedMySkinIndex =
            (selectedMySkinIndex + 1) % inventory.length;
    }

    const skin = inventory[selectedMySkinIndex];

    document.getElementById("my-skin-img").innerHTML =
        `<img src="${skin.img}" alt="${skin.name}">`;

    document.getElementById("my-skin-name").innerText =
        `${skin.name} · ${skin.price} ♦`;

    updateUpgradeChance();
}

function selectTargetSkin() {
    const targets = casesData.Dune;

    if (!targets || targets.length === 0) {
        showAlert("Нет доступных целей!");
        return;
    }

    selectedTargetSkin =
        { ...targets[Math.floor(Math.random() * targets.length)] };

    document.getElementById("target-skin-img").innerHTML =
        `<img src="${selectedTargetSkin.img}" alt="${selectedTargetSkin.name}">`;

    document.getElementById("target-skin-name").innerText =
        `${selectedTargetSkin.name} · ${selectedTargetSkin.price} ♦`;

    updateUpgradeChance();
}

function updateUpgradeChance() {
    const chanceElement = document.getElementById("upgrade-chance");

    if (selectedMySkinIndex === null || !selectedTargetSkin) {
        chanceElement.innerText = "0%";
        return;
    }

    const mySkin = inventory[selectedMySkinIndex];

    if (!mySkin || !selectedTargetSkin.price) {
        chanceElement.innerText = "0%";
        return;
    }

    let chance =
        (mySkin.price / selectedTargetSkin.price) * 100;

    chance = Math.min(90, Math.max(1, chance));

    chanceElement.innerText = chance.toFixed(2) + "%";
}

function doUpgrade() {
    if (selectedMySkinIndex === null || !selectedTargetSkin) {
        showAlert("Сначала выберите свой скин и цель!");
        return;
    }

    const mySkin = inventory[selectedMySkinIndex];

    if (!mySkin) {
        showAlert("Предмет не найден в инвентаре!");
        resetUpgrade();
        return;
    }

    const chance = Math.min(
        90,
        Math.max(1, (mySkin.price / selectedTargetSkin.price) * 100)
    );

    const success = Math.random() * 100 < chance;

    if (success) {
        inventory[selectedMySkinIndex] = { ...selectedTargetSkin };

        showAlert(
            `Успех! Получен ${selectedTargetSkin.name} за ${selectedTargetSkin.price} ♦`
        );
    } else {
        // В демо-режиме исходный предмет сохраняется
        showAlert("Не получилось! Твой исходный скин сохранён.");
    }

    saveProgress();
    updateInventoryUI();
    resetUpgrade();
}

function resetUpgrade() {
    selectedMySkinIndex = null;
    selectedTargetSkin = null;

    document.getElementById("my-skin-img").innerHTML = "+";
    document.getElementById("my-skin-name").innerText =
        "Выбрать мой скин";

    document.getElementById("target-skin-img").innerHTML = "?";
    document.getElementById("target-skin-name").innerText =
        "Выбрать цель";

    document.getElementById("upgrade-chance").innerText = "0%";
}

function updateFreeCaseTimer() {
    const cooldown = 24 * 60 * 60 * 1000;
    const timeLeft =
        cooldown - (Date.now() - lastFreeCaseTime);

    const btn = document.getElementById("btn-free-case");
    const timerText = document.getElementById("free-timer-text");

    if (!btn || !timerText) return;

    if (timeLeft <= 0) {
        btn.disabled = false;
        btn.innerText = "Открыть бесплатно";
        timerText.innerText = "Доступен!";
        return;
    }

    btn.disabled = true;

    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor(
        (timeLeft % 3600000) / 60000
    );

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

    runRoulette("FreeCase");
}

updateFreeCaseTimer();
