
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

// ВПИШИ СЮДА СВОЙ ЧИСЛОВОЙ TELEGRAM ID
const ADMIN_TELEGRAM_ID = "ВПИШИ_СВОЙ_TELEGRAM_ID";

function showAlert(text) {
    if (tg?.showAlert) tg.showAlert(String(text));
    else alert(String(text));
}

// Получаем данные Telegram-пользователя
const telegramUser = tg?.initDataUnsafe?.user;

const user = {
    id: telegramUser?.id ? String(telegramUser.id) : "bestdrop_local",
    name: telegramUser
        ? (telegramUser.first_name || telegramUser.username || "Игрок")
        : "Игрок",
    avatar: telegramUser?.photo_url || "https://i.pravatar.cc/100?img=11"
};

const isAdmin =
    ADMIN_TELEGRAM_ID !== "ВПИШИ_СВОЙ_TELEGRAM_ID" &&
    user.id === ADMIN_TELEGRAM_ID;

const SAVE_KEY = "bestdrop_save";
const PROMOS_KEY = "bestdrop_local_promos";

let savedData = {};

try {
    savedData = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
} catch {
    savedData = {};
}

let balance = savedData.balance ?? 100;
let inventory = Array.isArray(savedData.inventory)
    ? savedData.inventory
    : [];

let freeSandstoneOpens = savedData.freeSandstoneOpens ?? 0;
let lastFreeCaseTime = savedData.lastFreeCaseTime ?? 0;

// Локальные демонстрационные промокоды
function getPromos() {
    try {
        const promos = JSON.parse(localStorage.getItem(PROMOS_KEY));
        return Array.isArray(promos) ? promos : [];
    } catch {
        return [];
    }
}

function savePromos(promos) {
    localStorage.setItem(PROMOS_KEY, JSON.stringify(promos));
}

const casesData = {
    Sandstone: [
        {
            name: "P350",
            rarity: "Common",
            chance: 50,
            img: "https://cdn.cs.money/730/skins/weapon_p250_sand_dune_light.png",
            price: 9
        },
        {
            name: "MP7",
            rarity: "Rare",
            chance: 40,
            img: "https://cdn.cs.money/730/skins/weapon_mp7_impire_light.png",
            price: 89
        },
        {
            name: "AKR Necromancy",
            rarity: "Legendary",
            chance: 9,
            img: "https://cdn.cs.money/730/skins/weapon_ak47_neon_rider_light.png",
            price: 169
        },
        {
            name: "Агент",
            rarity: "Arcane",
            chance: 1,
            img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png",
            price: 999
        }
    ],

    Breeze: [
        {
            name: "Paladin",
            rarity: "Arcane",
            chance: 0.1,
            img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png",
            price: 1999
        },
        {
            name: "Medal",
            rarity: "Common",
            chance: 99.9,
            img: "https://cdn.cs.money/730/skins/weapon_glock_water_elemental_light.png",
            price: 9
        }
    ],

    Dune: [
        {
            name: "M4",
            rarity: "Rare",
            chance: 40,
            img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png",
            price: 80
        },
        {
            name: "SPAS",
            rarity: "Rare",
            chance: 30,
            img: "https://cdn.cs.money/730/skins/weapon_sawedoff_the_bank_light.png",
            price: 150
        },
        {
            name: "M40",
            rarity: "Epic",
            chance: 15,
            img: "https://cdn.cs.money/730/skins/weapon_awp_asiimov_light.png",
            price: 300
        },
        {
            name: "Anubis",
            rarity: "Legendary",
            chance: 9,
            img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png",
            price: 800
        },
        {
            name: "Jade AK",
            rarity: "Arcane",
            chance: 1.5,
            img: "https://cdn.cs.money/730/skins/weapon_ak47_neon_rider_light.png",
            price: 799
        },
        {
            name: "Karambit",
            rarity: "Arcane",
            chance: 0.01,
            img: "https://cdn.cs.money/730/skins/weapon_knife_karambit_doppler_phase2_light.png",
            price: 4999
        }
    ],

    FreeCase: [
        {
            name: "M4 Flock",
            rarity: "Epic",
            chance: 5,
            img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png",
            price: 0,
            reward: 4
        },
        {
            name: "AKR Worm",
            rarity: "Uncommon",
            chance: 35,
            img: "https://cdn.cs.money/730/skins/weapon_ak47_neon_rider_light.png",
            price: 0,
            reward: 1
        },
        {
            name: "P350 Savannah",
            rarity: "Common",
            chance: 25,
            img: "https://cdn.cs.money/730/skins/weapon_p250_sand_dune_light.png",
            price: 0,
            reward: 10
        },
        {
            name: "M40 Pro",
            rarity: "Uncommon",
            chance: 15,
            img: "https://cdn.cs.money/730/skins/weapon_awp_asiimov_light.png",
            price: 0,
            reward: 15
        },
        {
            name: "TEC-9 Dalmatian",
            rarity: "Common",
            chance: 20,
            img: "https://cdn.cs.money/730/skins/weapon_glock_water_elemental_light.png",
            price: 0,
            reward: 2
        }
    ]
};

// Обновляем предметы инвентаря по актуальному каталогу
inventory = inventory.map(item => {
    for (const items of Object.values(casesData)) {
        const found = items.find(skin => skin.name === item.name);
        if (found) return { ...found };
    }
    return item;
});

function saveProgress() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
        balance,
        inventory,
        freeSandstoneOpens,
        lastFreeCaseTime
    }));
}

function updateBalanceUI() {
    const el = document.getElementById("balance-display");
    if (el) el.innerText = balance;
}

function updateTelegramProfile() {
    const nameEl = document.getElementById("user-name");
    const avatarEl = document.getElementById("user-avatar");

    if (nameEl) nameEl.innerText = user.name;

    if (avatarEl) {
        avatarEl.src = user.avatar;
        avatarEl.onerror = () => {
            avatarEl.src = "https://i.pravatar.cc/100?img=11";
        };
    }

    const adminButton = document.getElementById("admin-entry");

    if (adminButton) {
        adminButton.style.display = isAdmin ? "" : "none";
    }
}

function getRandomDrop(caseName) {
    const items = casesData[caseName];
    if (!items?.length) return null;

    const totalChance = items.reduce(
        (sum, item) => sum + item.chance,
        0
    );

    let random = Math.random() * totalChance;

    for (const item of items) {
        random -= item.chance;
        if (random < 0) return { ...item };
    }

    return { ...items[items.length - 1] };
}

window.currentDrop = null;

function runRoulette(caseName) {
    const currentDrop = getRandomDrop(caseName);

    if (!currentDrop) {
        showAlert("Кейс не найден!");
        return;
    }

    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred("medium");
    }

    const modal = document.getElementById("roulette-modal");
    const strip = document.getElementById("roulette-strip");
    const closeBtn = document.getElementById("close-roulette");

    if (!modal || !strip || !closeBtn) {
        showAlert("Не найдены элементы рулетки!");
        return;
    }

    modal.classList.remove("hidden");
    closeBtn.classList.add("hidden");

    strip.style.transition = "none";
    strip.style.transform = "translateX(0)";

    const items = casesData[caseName];
    let html = "";

    for (let i = 0; i < 50; i++) {
        const item = items[Math.floor(Math.random() * items.length)];

        html += `
            <div class="roulette-item">
                <img src="${item.img}" alt="">
                <span>${item.price} ♦</span>
            </div>
        `;
    }

    html += `
        <div class="roulette-item">
            <img src="${currentDrop.img}" alt="">
            <span style="color:#ff3333;font-weight:bold">
                ${currentDrop.reward ?? currentDrop.price} G
            </span>
        </div>
    `;

    for (let i = 0; i < 20; i++) {
        const item = items[Math.floor(Math.random() * items.length)];

        html += `
            <div class="roulette-item">
                <img src="${item.img}" alt="">
                <span>${item.price} ♦</span>
            </div>
        `;
    }

    strip.innerHTML = html;
    window.currentDrop = currentDrop;

    setTimeout(() => {
        const containerWidth = strip.parentElement.offsetWidth;
        const distance = 50 * 100 + containerWidth / 2 - 50;

        strip.style.transition =
            "transform 5s cubic-bezier(0.15, 0.9, 0.2, 1)";

        strip.style.transform = `translateX(-${distance}px)`;

        setTimeout(() => {
            closeBtn.classList.remove("hidden");

            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred("success");
            }
        }, 5100);
    }, 100);
}

function openCase(caseName, casePrice) {
    if (caseName === "Sandstone" && freeSandstoneOpens > 0) {
        freeSandstoneOpens--;
        saveProgress();

        showAlert(
            `Бесплатное открытие использовано. Осталось: ${freeSandstoneOpens}`
        );
    } else {
        if (balance < casePrice) {
            showAlert("Недостаточно монет!");
            return;
        }

        balance -= casePrice;
        updateBalanceUI();
        saveProgress();
    }

    runRoulette(caseName);
}

function openFreeCase() {
    const cooldown = 24 * 60 * 60 * 1000;

    if (Date.now() - lastFreeCaseTime < cooldown) {
        showAlert("Бесплатный кейс ещё не восстановился!");
        updateFreeCaseTimer();
        return;
    }

    lastFreeCaseTime = Date.now();

    saveProgress();
    updateFreeCaseTimer();
    runRoulette("FreeCase");
}

function closeRoulette() {
    document.getElementById("roulette-modal")?.classList.add("hidden");

    if (!window.currentDrop) return;

    const item = { ...window.currentDrop };
    inventory.push(item);

    if (item.reward !== undefined) {
        balance += item.reward;
        updateBalanceUI();

        showAlert(`Выпал ${item.name}! Получено ${item.reward} G`);
    } else {
        showAlert("Предмет добавлен в инвентарь!");
    }

    window.currentDrop = null;

    saveProgress();
    updateInventoryUI();
}

function updateFreeCaseTimer() {
    const timer = document.getElementById("free-timer-text");
    const button = document.getElementById("btn-free-case");

    if (!timer || !button) return;

    const remaining =
        24 * 60 * 60 * 1000 - (Date.now() - lastFreeCaseTime);

    if (remaining <= 0) {
        timer.innerText = "Бесплатный кейс доступен!";
        button.disabled = false;
        button.innerText = "Открыть бесплатно";
        return;
    }

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    timer.innerText =
        `Следующий кейс через ${hours}ч ${minutes}м ${seconds}с`;

    button.disabled = true;
    button.innerText = "Кейс восстанавливается";
}

// Промокоды
function activatePromo() {
    const input = document.getElementById("promo-input");
    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (!code) {
        showAlert("Введи промокод!");
        return;
    }

    const promos = getPromos();
    const promo = promos.find(item => item.code === code);

    // Старый демонстрационный промокод
    if (!promo && code === "PROMO") {
        const oldUsed =
            localStorage.getItem("bestdrop_promo_PROMO_used") === "true";

        if (oldUsed) {
            showAlert("Промокод уже использован!");
            return;
        }

        freeSandstoneOpens += 10;

        localStorage.setItem(
            "bestdrop_promo_PROMO_used",
            "true"
        );

        saveProgress();
        input.value = "";

        showAlert("Получено 10 бесплатных открытий Sandstone!");
        return;
    }

    if (!promo) {
        showAlert("Неверный промокод!");
        return;
    }

    const usedKey = `bestdrop_promo_${code}_used`;

    if (localStorage.getItem(usedKey) === "true") {
        showAlert("Ты уже использовал этот промокод!");
        return;
    }

    if (promo.used >= promo.limit) {
        showAlert("Лимит использований промокода исчерпан!");
        return;
    }

    promo.used++;

    savePromos(promos);

    localStorage.setItem(usedKey, "true");

    freeSandstoneOpens += promo.reward;

    saveProgress();

    input.value = "";

    showAlert(
        `Промокод активирован! Получено ${promo.reward} бесплатных открытий Sandstone.`
    );
}

// Переключение вкладок
function switchTab(tab) {
    if (tab === "bonus") tab = "free";

    const screens = {
        main: "main-screen",
        inventory: "inventory-screen",
        promo: "promo-screen",
        upgrade: "upgrade-screen",
        free: "free-case-screen"
    };

    if (!screens[tab]) return;

    const admin = document.getElementById("admin-screen");
    if (admin) admin.classList.remove("active");

    Object.entries(screens).forEach(([name, id]) => {
        const element = document.getElementById(id);
        if (!element) return;

        if (name === "main") {
            element.style.display = name === tab ? "block" : "none";
        } else {
            element.classList.toggle("active", name === tab);
        }
    });

    document.querySelectorAll(".nav-item").forEach(el => {
        el.classList.remove("active");
    });

    const navIds = {
        main: "nav-main",
        inventory: "nav-inv",
        promo: "nav-promo",
        upgrade: "nav-upgrade",
        free: "nav-free"
    };

    document.getElementById(navIds[tab])?.classList.add("active");

    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "";

    if (tab === "inventory") updateInventoryUI();
    if (tab === "free") updateFreeCaseTimer();
    if (tab === "upgrade") {
        if (typeof renderUpgradeHistory === "function") {
            renderUpgradeHistory();
        }
    }
}

// Инвентарь
function updateInventoryUI() {
    const grid = document.getElementById("inventory-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (!inventory.length) {
        grid.innerHTML = `
            <p style="color:#666;grid-column:span 2;text-align:center;">
                Тут пока пусто...
            </p>
        `;
        return;
    }

    inventory.forEach((item, index) => {
        const action = item.reward !== undefined
            ? `
                <div style="color:#4caf50;font-size:12px;">
                    Награда уже получена: ${item.reward} G
                </div>
            `
            : `
                <button class="btn-sell" onclick="sellItem(${index})">
                    Продать за ${item.price} ♦
                </button>
            `;

        grid.innerHTML += `
            <div class="inv-item">
                <img src="${item.img}" alt="">
                <p>${item.name}</p>
                <div style="color:#aaa;font-size:11px;margin-bottom:5px;">
                    ${item.rarity}
                </div>
                ${action}
            </div>
        `;
    });
}

function sellItem(index) {
    const item = inventory[index];
    if (!item) return;

    if (item.reward !== undefined) {
        showAlert("Награда за этот предмет уже получена!");
        return;
    }

    balance += Number(item.price) || 0;
    inventory.splice(index, 1);

    updateBalanceUI();
    updateInventoryUI();
    saveProgress();

    if (typeof resetUpgrade === "function") {
        resetUpgrade();
    }
}

// ------------------------------
// ДЕМОНСТРАЦИОННАЯ АДМИН-ПАНЕЛЬ
// ------------------------------

function openAdminPanel() {
    if (!isAdmin) {
        showAlert("У тебя нет доступа к админ-панели!");
        return;
    }

    const admin = document.getElementById("admin-screen");

    if (!admin) {
        showAlert("Не найдена админ-панель в index.html!");
        return;
    }

    document.querySelectorAll(
        "#main-screen, #inventory-screen, #promo-screen, #upgrade-screen, #free-case-screen"
    ).forEach(element => {
        element.classList.remove("active");
        element.style.display = "none";
    });

    admin.classList.add("active");

    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "none";

    renderAdminPromos();
}

function closeAdminPanel() {
    const admin = document.getElementById("admin-screen");
    if (admin) admin.classList.remove("active");

    switchTab("main");
}

// Изменение баланса только текущего локального игрока
function adminChangeBalance() {
    if (!isAdmin) {
        showAlert("Нет доступа!");
        return;
    }

    const idInput = document.getElementById("admin-user-id");
    const amountInput = document.getElementById("admin-balance");

    if (!idInput || !amountInput) return;

    const targetId = idInput.value.trim();
    const amount = Number(amountInput.value);

    if (!targetId) {
        showAlert("Введи Telegram ID игрока!");
        return;
    }

    if (targetId !== user.id) {
        showAlert(
            "На GitHub Pages нельзя изменить баланс другого игрока. Для этого нужен сервер."
        );
        return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
        showAlert("Введи корректный баланс!");
        return;
    }

    balance = Math.floor(amount);

    updateBalanceUI();
    saveProgress();

    amountInput.value = "";

    showAlert("Баланс текущего игрока обновлён!");
}

// Создание локального промокода
function adminCreatePromo() {
    if (!isAdmin) {
        showAlert("Нет доступа!");
        return;
    }

    const codeInput = document.getElementById("admin-promo-code");
    const rewardInput = document.getElementById("admin-promo-reward");
    const limitInput = document.getElementById("admin-promo-limit");

    if (!codeInput || !rewardInput || !limitInput) return;

    const code = codeInput.value.trim().toUpperCase();
    const reward = Number(rewardInput.value);
    const limit = Number(limitInput.value);

    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
        showAlert("Код должен содержать от 3 до 20 символов: A-Z, 0-9, _ или -");
        return;
    }

    if (code === "PROMO") {
        showAlert("Это имя уже занято старым промокодом!");
        return;
    }

    if (!Number.isInteger(reward) || reward < 1) {
        showAlert("Количество бесплатных открытий должно быть больше нуля!");
        return;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        showAlert("Лимит использований должен быть больше нуля!");
        return;
    }

    const promos = getPromos();

    if (promos.some(item => item.code === code)) {
        showAlert("Такой промокод уже существует!");
        return;
    }

    promos.push({
        code,
        reward,
        limit,
        used: 0
    });

    savePromos(promos);

    codeInput.value = "";
    rewardInput.value = "";
    limitInput.value = "";

    renderAdminPromos();

    showAlert("Демонстрационный промокод создан!");
}

function escapeAdminText(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderAdminPromos() {
    const list = document.getElementById("admin-promo-list");
    if (!list) return;

    const promos = getPromos();

    if (!promos.length) {
        list.innerHTML = `
            <p style="color:#888;">Созданных промокодов пока нет.</p>
        `;
        return;
    }

    list.innerHTML = promos.map(promo => `
        <div class="admin-card" style="margin-top:10px;">
            <b>${escapeAdminText(promo.code)}</b>
            <p>Награда: ${Number(promo.reward)} открытий</p>
            <p>Использовано: ${Number(promo.used)} / ${Number(promo.limit)}</p>
        </div>
    `).join("");
}

// Начальная настройка интерфейса
updateTelegramProfile();
updateBalanceUI();
updateInventoryUI();
updateFreeCaseTimer();

setInterval(updateFreeCaseTimer, 1000);

saveProgress();
