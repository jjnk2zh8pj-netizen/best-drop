let selectedMySkinIndex = null;
let selectedTargetSkin = null;

function selectMySkin() {
    if (inventory.length === 0) {
        showAlert("У вас нет скинов в инвентаре для апгрейда!");
        return;
    }
    selectedMySkinIndex = 0; 
    const mySkin = inventory[0];
    document.getElementById('my-skin-img').innerHTML = `<img src="${mySkin.img}">`;
    document.getElementById('my-skin-name').innerText = mySkin.name;
    updateUpgradeChance();
}

function selectTargetSkin() {
    const targets = casesData["Dune"];
    selectedTargetSkin = targets[Math.floor(Math.random() * targets.length)];
    document.getElementById('target-skin-img').innerHTML = `<img src="${selectedTargetSkin.img}">`;
    document.getElementById('target-skin-name').innerText = selectedTargetSkin.name;
    updateUpgradeChance();
}

function updateUpgradeChance() {
    if (selectedMySkinIndex === null || selectedTargetSkin === null) {
        document.getElementById('upgrade-chance').innerText = "0%";
        return;
    }
    const mySkin = inventory[selectedMySkinIndex];
    let chance = (mySkin.price / selectedTargetSkin.price) * 100;
    if (chance > 90) chance = 90;
    if (chance < 1) chance = 1;
    document.getElementById('upgrade-chance').innerText = chance.toFixed(1) + "%";
}

function doUpgrade() {
    if (selectedMySkinIndex === null || selectedTargetSkin === null) {
        showAlert("Выберите скин для обмена и цель!");
        return;
    }
    const mySkin = inventory[selectedMySkinIndex];
    let chance = (mySkin.price / selectedTargetSkin.price) * 100;
    if (chance > 90) chance = 90;
    
    const randomRoll = Math.random() * 100;
    
    if (randomRoll <= chance) {
        inventory.splice(selectedMySkinIndex, 1); 
        inventory.push(selectedTargetSkin); 
        saveProgress();
        updateInventoryUI();
        showAlert(`УСПЕХ! Вы получили ${selectedTargetSkin.name}!`);
    } else {
        inventory.splice(selectedMySkinIndex, 1); 
        saveProgress();
        updateInventoryUI();
        showAlert("ПРОВАЛ! Ваш скин сгорел.");
    }
    
    selectedMySkinIndex = null;
    selectedTargetSkin = null;
    document.getElementById('my-skin-img').innerHTML = "+";
    document.getElementById('my-skin-name').innerText = "Выбрать мой скин";
    document.getElementById('target-skin-img').innerHTML = "?";
    document.getElementById('target-skin-name').innerText = "Выбрать цель";
    document.getElementById('upgrade-chance').innerText = "0%";
}

let lastFreeCaseTime = 0;
if (savedData) {
    const parsed = JSON.parse(savedData);
    lastFreeCaseTime = parsed.lastFreeCaseTime || 0;
}

function updateFreeCaseTimer() {
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;
    const timePassed = now - lastFreeCaseTime;
    
    const btn = document.getElementById('btn-free-case');
    const timerText = document.getElementById('free-timer-text');

    if (!btn || !timerText) return;

    if (timePassed >= cooldown) {
        btn.disabled = false;
        btn.innerText = "Открыть бесплатно";
        timerText.innerText = "Доступен каждые 24 часа";
    } else {
        btn.disabled = true;
        const timeLeft = cooldown - timePassed;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        btn.innerText = "Недоступно";
        timerText.innerText = `Следующий через: ${hours} ч ${minutes} мин`;
    }
}

function openFreeCase() {
    lastFreeCaseTime = Date.now();
    const data = JSON.parse(localStorage.getItem('bestdrop_user_' + user.id)) || {};
    data.lastFreeCaseTime = lastFreeCaseTime;
    localStorage.setItem('bestdrop_user_' + user.id, JSON.stringify(data));
    
    updateFreeCaseTimer();
    runRoulette('FreeCase'); 
}
