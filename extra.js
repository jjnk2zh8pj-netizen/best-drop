
let selectedMySkinIndex = null;
let selectedTargetSkin = null;

// Telegram ID администратора
const BD_ADMIN_ID = "8072083995";
const BD_TG_USER = window.Telegram?.WebApp?.initDataUnsafe?.user;

if (BD_TG_USER?.id) {
    user.id = String(BD_TG_USER.id);
    user.name = BD_TG_USER.first_name || "Игрок";
    if (BD_TG_USER.photo_url) user.avatar = BD_TG_USER.photo_url;
}

const BD_CURRENT_USER_ID = String(BD_TG_USER?.id || user.id);
const BD_IS_ADMIN = BD_CURRENT_USER_ID === BD_ADMIN_ID;
const BD_PROMO_KEY = "bestdrop_admin_promos";
const BD_USED_KEY = "bestdrop_used_promos_" + BD_CURRENT_USER_ID;

// Показываем кнопку админки только администратору
const adminButton = document.getElementById("admin-entry");
if (adminButton) {
    adminButton.style.display = BD_IS_ADMIN ? "inline-block" : "none";
}

// Обновляем профиль Telegram
const nameElement = document.getElementById("user-name");
const avatarElement = document.getElementById("user-avatar");

if (nameElement) nameElement.innerText = user.name;
if (avatarElement) avatarElement.src = user.avatar;

// ---------------- UPGRADE ----------------

function selectMySkin() {
    if (!inventory.length) {
        showAlert("У вас нет скинов в инвентаре!");
        return;
    }

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

    if (!targets || !targets.length) {
        showAlert("Нет доступных целей!");
        return;
    }

    selectedTargetSkin = {
        ...targets[Math.floor(Math.random() * targets.length)]
    };

    document.getElementById("target-skin-img").innerHTML =
        `<img src="${selectedTargetSkin.img}" alt="${selectedTargetSkin.name}">`;

    document.getElementById("target-skin-name").innerText =
        `${selectedTargetSkin.name} · ${selectedTargetSkin.price} ♦`;

    updateUpgradeChance();
}

function updateUpgradeChance() {
    const element = document.getElementById("upgrade-chance");

    if (!element) return;

    if (selectedMySkinIndex === null || !selectedTargetSkin) {
        element.innerText = "0%";
        return;
    }

    const skin = inventory[selectedMySkinIndex];

    if (!skin || !selectedTargetSkin.price) {
        element.innerText = "0%";
        return;
    }

    const chance = Math.min(
        90,
        Math.max(1, skin.price / selectedTargetSkin.price * 100)
    );

    element.innerText = chance.toFixed(2) + "%";
}

function doUpgrade() {
    if (selectedMySkinIndex === null || !selectedTargetSkin) {
        showAlert("Сначала выберите свой скин и цель!");
        return;
    }

    const mySkin = inventory[selectedMySkinIndex];

    if (!mySkin) {
        showAlert("Предмет не найден!");
        resetUpgrade();
        return;
    }

    const chance = Math.min(
        90,
        Math.max(1, mySkin.price / selectedTargetSkin.price * 100)
    );

    const success = Math.random() * 100 < chance;

    if (success) {
        inventory[selectedMySkinIndex] = { ...selectedTargetSkin };
        showAlert(
            `Успех! Получен ${selectedTargetSkin.name}!`
        );
    } else {
        // При неудаче выбранный скин теряется
        inventory.splice(selectedMySkinIndex, 1);
        showAlert("Неудача! Скин потерян.");
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

// ---------------- FREE CASE ----------------

function updateFreeCaseTimer() {
    const cooldown = 24 * 60 * 60 * 1000;
    const timeLeft = cooldown - (Date.now() - lastFreeCaseTime);

    const btn = document.getElementById("btn-free-case");
    const timer = document.getElementById("free-timer-text");

    if (!btn || !timer) return;

    if (timeLeft <= 0) {
        btn.disabled = false;
        btn.innerText = "Открыть бесплатно";
        timer.innerText = "Доступен!";
        return;
    }

    btn.disabled = true;

    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor(
        (timeLeft % 3600000) / 60000
    );

    btn.innerText = "Недоступно";
    timer.innerText =
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

// ---------------- PROMO CODES ----------------

function bdGetPromos() {
    let promos;

    try {
        promos = JSON.parse(
            localStorage.getItem(BD_PROMO_KEY)
        );
    } catch {
        promos = null;
    }

    if (!Array.isArray(promos)) {
        promos = [{
            code: "BESTDROP",
            reward: 500,
            limit: 100,
            used: 0,
            active: true
        }];

        localStorage.setItem(
            BD_PROMO_KEY,
            JSON.stringify(promos)
        );
    }

    return promos;
}

function activatePromo() {
    const input = document.getElementById("promo-input");

    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (!code) {
        showAlert("Введите промокод!");
        return;
    }

    const promos = bdGetPromos();
    const promo = promos.find(item => item.code === code);

    if (!promo || !promo.active) {
        showAlert("Промокод не найден или отключён!");
        return;
    }

    let used = [];

    try {
        used = JSON.parse(
            localStorage.getItem(BD_USED_KEY) || "[]"
        );
    } catch {
        used = [];
    }

    if (used.includes(code)) {
        showAlert("Вы уже использовали этот промокод!");
        return;
    }

    if (promo.used >= promo.limit) {
        showAlert("Лимит активаций закончился!");
        return;
    }

    promo.used++;
    balance += Number(promo.reward);
    used.push(code);

    localStorage.setItem(
        BD_PROMO_KEY,
        JSON.stringify(promos)
    );

    localStorage.setItem(
        BD_USED_KEY,
        JSON.stringify(used)
    );

    saveProgress();
    updateBalanceUI();

    input.value = "";
    showAlert(`Промокод активирован! +${promo.reward} ♦`);

    if (BD_IS_ADMIN) adminRenderPromoList();
}

// ---------------- ADMIN PANEL ----------------

function openAdminPanel() {
    if (!BD_IS_ADMIN) {
        showAlert("Нет доступа!");
        return;
    }

    const screens = [
        "main-screen",
        "inventory-screen",
        "promo-screen",
        "upgrade-screen",
        "free-case-screen"
    ];

    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = "none";
    });

    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "none";

    const panel = document.getElementById("admin-screen");
    if (panel) panel.style.display = "block";

    adminRenderPromoList();
}

function closeAdminPanel() {
    const panel = document.getElementById("admin-screen");
    if (panel) panel.style.display = "none";

    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "";

    switchTab("main");
}

function adminChangeBalance() {
    if (!BD_IS_ADMIN) return;

    const id = document.getElementById("admin-user-id")?.value.trim();
    const amount = Number(
        document.getElementById("admin-balance")?.value
    );

    if (id !== BD_CURRENT_USER_ID) {
        showAlert(
            "В демо-режиме можно менять баланс только текущего игрока. Для других игроков нужен сервер."
        );
        return;
    }

    if (!Number.isInteger(amount) || amount < 0) {
        showAlert("Введите корректный баланс!");
        return;
    }

    balance = amount;
    saveProgress();
    updateBalanceUI();

    showAlert("Баланс обновлён!");
}

function adminCreatePromo() {
    if (!BD_IS_ADMIN) return;

    const code = document.getElementById("admin-promo-code")
        ?.value.trim().toUpperCase();

    const reward = Number(
        document.getElementById("admin-promo-reward")?.value
    );

    const limit = Number(
        document.getElementById("admin-promo-limit")?.value
    );

    if (!/^[A-Z0-9_-]{3,20}$/.test(code || "")) {
        showAlert("Код: от 3 до 20 символов A-Z, 0-9, _ или -");
        return;
    }

    if (!Number.isInteger(reward) || reward <= 0 ||
        !Number.isInteger(limit) || limit <= 0) {
        showAlert("Награда и лимит должны быть положительными числами!");
        return;
    }

    const promos = bdGetPromos();

    if (promos.some(item => item.code === code)) {
        showAlert("Такой промокод уже существует!");
        return;
    }

    promos.push({
        code,
        reward,
        limit,
        used: 0,
        active: true
    });

    localStorage.setItem(
        BD_PROMO_KEY,
        JSON.stringify(promos)
    );

    adminRenderPromoList();
    showAlert("Промокод создан!");
}

function adminTogglePromo(code) {
    if (!BD_IS_ADMIN) return;

    const promos = bdGetPromos();
    const promo = promos.find(item => item.code === code);

    if (!promo) return;

    promo.active = !promo.active;

    localStorage.setItem(
        BD_PROMO_KEY,
        JSON.stringify(promos)
    );

    adminRenderPromoList();
}

function adminRenderPromoList() {
    const list = document.getElementById("admin-promo-list");
    if (!list) return;

    const promos = bdGetPromos();

    list.innerHTML = "";

    promos.forEach(promo => {
        const item = document.createElement("div");
        item.className = "admin-promo-item";

        const info = document.createElement("span");
        info.textContent =
            `${promo.code} — ${promo.reward} ♦ — ${promo.used}/${promo.limit} — ${promo.active ? "Активен" : "Выключен"}`;

        const button = document.createElement("button");
        button.textContent = promo.active ? "Выключить" : "Включить";
        button.onclick = () => adminTogglePromo(promo.code);

        item.appendChild(info);
        item.appendChild(button);
        list.appendChild(item);
    });
}

// ---------------- NAVIGATION ----------------

function switchTab(tab) {
    const screens = {
        main: "main-screen",
        inventory: "inventory-screen",
        promo: "promo-screen",
        upgrade: "upgrade-screen",
        free: "free-case-screen"
    };

    const admin = document.getElementById("admin-screen");
    if (admin) admin.style.display = "none";

    Object.entries(screens).forEach(([name, id]) => {
        const element = document.getElementById(id);

        if (element) {
            element.style.display = name === tab ? "block" : "none";
        }
    });

    document.querySelectorAll(".bottom-nav button").forEach(button => {
        button.classList.remove("active");
    });

    const navIds = {
        main: "nav-main",
        inventory: "nav-inv",
        promo: "nav-promo",
        upgrade: "nav-upgrade",
        free: "nav-free"
    };

    const activeButton = document.getElementById(navIds[tab]);
    if (activeButton) activeButton.classList.add("active");

    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "";
}

updateFreeCaseTimer();
