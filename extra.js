
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

// ==================================
// ОСНОВНЫЕ НАСТРОЙКИ
// ==================================

const ADMIN_TELEGRAM_ID = "8072083995";

const SAVE_KEY = "bestdrop_save";
const PROMOS_KEY = "bestdrop_local_promos";

function showAlert(text) {
    if (tg?.showAlert) {
        tg.showAlert(String(text));
    } else {
        alert(String(text));
    }
}

// ==================================
// ПОЛЬЗОВАТЕЛЬ
// ==================================

const telegramUser = tg?.initDataUnsafe?.user;

const user = {
    id: telegramUser?.id ? String(telegramUser.id) : "bestdrop_local",
    name: telegramUser
        ? (telegramUser.first_name || telegramUser.username || "Игрок")
        : "Игрок",
    avatar: telegramUser?.photo_url || "https://i.pravatar.cc/100?img=11"
};

const isAdmin = user.id === ADMIN_TELEGRAM_ID;

// ==================================
// ЗАГРУЗКА СОХРАНЕНИЙ
// ==================================

let savedData = {};

try {
    savedData = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
} catch {
    savedData = {};
}

let balance = Number(savedData.balance ?? 100);

let inventory = Array.isArray(savedData.inventory)
    ? savedData.inventory
    : [];

let freeSandstoneOpens = Number(savedData.freeSandstoneOpens ?? 0);
let lastFreeCaseTime = Number(savedData.lastFreeCaseTime ?? 0);

// ==================================
// ПРОМОКОДЫ
// ==================================

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

// ==================================
// КАТАЛОГ КЕЙСОВ
// ==================================

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

// ==================================
// БОЕВОЙ ПРОПУСК
// ==================================

const BP_XP_PER_LEVEL = 500;
const BP_MAX_LEVEL = 30;
const BP_MAX_XP = BP_XP_PER_LEVEL * BP_MAX_LEVEL;

const BP_START_DATE = new Date("2026-11-22T00:00:00");
const BP_END_DATE = new Date("2026-12-22T00:00:00");

const BP_REWARDS = [
    "Рамка профиля: Новичок",
    "100 бонусных монет",
    "Аватар: Песчаный воин",
    "Титул: Исследователь",
    "150 бонусных монет",
    "Рамка профиля: Бронза",
    "Аватар: Пустыня",
    "Титул: Коллекционер",
    "200 бонусных монет",
    "Рамка профиля: Серебро",
    "Аватар: Ветер",
    "Титул: Ветеран",
    "250 бонусных монет",
    "Рамка профиля: Золото",
    "Аватар: Закат",
    "Титул: Мастер",
    "300 бонусных монет",
    "Рамка профиля: Алмаз",
    "Аватар: Мираж",
    "Титул: Легенда",
    "350 бонусных монет",
    "Рамка профиля: Элитная",
    "Аватар: Оазис",
    "Титул: Чемпион",
    "400 бонусных монет",
    "Рамка профиля: Королевская",
    "Аватар: Золотые дюны",
    "Титул: Повелитель",
    "500 бонусных монет",
    "Эксклюзивная рамка: Best Drop"
];

let bpXP = Math.max(
    0,
    Math.min(BP_MAX_XP, Number(savedData.bpXP ?? 0))
);

let bpLastDailyClaim = String(savedData.bpLastDailyClaim ?? "");

let bpClaimedRewards = Array.isArray(savedData.bpClaimedRewards)
    ? savedData.bpClaimedRewards
    : [];

function getBPLevel() {
    return Math.min(
        BP_MAX_LEVEL,
        Math.floor(bpXP / BP_XP_PER_LEVEL)
    );
}

function getBPLevelProgress() {
    if (bpXP >= BP_MAX_XP) return BP_XP_PER_LEVEL;

    return bpXP % BP_XP_PER_LEVEL;
}

function getLocalDateKey() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isBPSeasonActive() {
    const now = Date.now();

    return now >= BP_START_DATE.getTime() &&
        now < BP_END_DATE.getTime();
}

function addBPXP(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) return;

    const oldLevel = getBPLevel();

    bpXP = Math.min(BP_MAX_XP, bpXP + Math.floor(value));

    saveProgress();
    renderBattlePass();

    const newLevel = getBPLevel();

    if (newLevel > oldLevel) {
        showAlert(`Новый уровень Боевого пропуска: ${newLevel}!`);
    }
}

function claimDailyBPTask() {
    if (!isBPSeasonActive()) {
        showAlert("Сезон Боевого пропуска сейчас не активен!");
        return;
    }

    const today = getLocalDateKey();

    if (bpLastDailyClaim === today) {
        showAlert("Ежедневное задание уже выполнено!");
        return;
    }

    if (bpXP >= BP_MAX_XP) {
        showAlert("Ты уже достиг максимального уровня!");
        return;
    }

    bpLastDailyClaim = today;

    addBPXP(100);

    saveProgress();
    renderBattlePass();

    tg?.HapticFeedback?.notificationOccurred("success");

    showAlert("Ежедневное задание выполнено! Получено 100 XP.");
}

function getBPRewardStatus(level) {
    if (bpClaimedRewards.includes(level)) {
        return "Получено";
    }

    if (getBPLevel() >= level) {
        return "Доступно";
    }

    return "Закрыто";
}

function claimBPReward(level) {
    if (!Number.isInteger(level) || level < 1 || level > BP_MAX_LEVEL) {
        return;
    }

    if (getBPLevel() < level) {
        showAlert("Сначала достигни этого уровня!");
        return;
    }

    if (bpClaimedRewards.includes(level)) {
        showAlert("Эта награда уже получена!");
        return;
    }

    const reward = BP_REWARDS[level - 1];

    // Бонусные монеты выдаются на баланс.
    const coinMatch = reward.match(/^(\d+) бонусных монет$/);

    if (coinMatch) {
        balance += Number(coinMatch[1]);
        updateBalanceUI();
    }

    bpClaimedRewards.push(level);

    saveProgress();
    renderBattlePass();

    showAlert(`Получена награда: ${reward}`);
}

function getBPTimeLeft() {
    const remaining = BP_END_DATE.getTime() - Date.now();

    if (remaining <= 0) return "Сезон завершён";

    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);

    return `${days} дн. ${hours} ч.`;
}

function renderBattlePass() {
    const screen = document.getElementById("battlepass-screen");

    if (!screen) return;

    const level = getBPLevel();
    const progress = getBPLevelProgress();
    const percent = Math.min(100, (progress / BP_XP_PER_LEVEL) * 100);

    const dailyDone = bpLastDailyClaim === getLocalDateKey();
    const seasonActive = isBPSeasonActive();

    let rewardsHTML = "";

    BP_REWARDS.forEach((reward, index) => {
        const rewardLevel = index + 1;
        const status = getBPRewardStatus(rewardLevel);

        let buttonHTML = "";

        if (status === "Доступно") {
            buttonHTML = `
                <button
                    class="bp-reward-button"
                    onclick="claimBPReward(${rewardLevel})"
                >
                    Забрать
                </button>
            `;
        } else if (status === "Получено") {
            buttonHTML = `
                <span class="bp-reward-done">✓ Получено</span>
            `;
        } else {
            buttonHTML = `
                <span class="bp-reward-locked">🔒 ${rewardLevel} ур.</span>
            `;
        }

        rewardsHTML += `
            <div class="bp-reward-card ${status === "Доступно" ? "bp-unlocked" : ""}">
                <div class="bp-reward-level">Уровень ${rewardLevel}</div>
                <div class="bp-reward-name">${escapeAdminText(reward)}</div>
                <div class="bp-reward-action">${buttonHTML}</div>
            </div>
        `;
    });

    screen.innerHTML = `
        <div class="bp-container">
            <div class="bp-header">
                <div class="bp-season-label">BEST DROP</div>
                <h2>⚔️ Боевой пропуск</h2>
                <p>Сезон: 22 ноября — 22 декабря 2026</p>
                <p class="bp-time-left">${getBPTimeLeft()}</p>
            </div>

            <div class="bp-progress-card">
                <div class="bp-progress-top">
                    <span>Твой уровень</span>
                    <strong>${level} / ${BP_MAX_LEVEL}</strong>
                </div>

                <div class="bp-xp-number">
                    ${bpXP} / ${BP_MAX_XP} XP
                </div>

                <div class="bp-progress-track">
                    <div
                        class="bp-progress-fill"
                        style="width:${percent}%"
                    ></div>
                </div>

                <div class="bp-progress-caption">
                    ${
                        level >= BP_MAX_LEVEL
                            ? "Максимальный уровень достигнут!"
                            : `${progress} / ${BP_XP_PER_LEVEL} XP до следующего уровня`
                    }
                </div>
            </div>

            <div class="bp-daily-card">
                <div class="bp-daily-icon">📅</div>

                <div class="bp-daily-info">
                    <h3>Ежедневное задание</h3>
                    <p>Заходи каждый день и забирай 100 XP.</p>
                    <strong>Награда: +100 XP</strong>
                </div>

                <button
                    class="bp-daily-button"
                    onclick="claimDailyBPTask()"
                    ${dailyDone || !seasonActive || bpXP >= BP_MAX_XP ? "disabled" : ""}
                >
                    ${
                        !seasonActive
                            ? "Сезон закрыт"
                            : dailyDone
                                ? "Выполнено"
                                : bpXP >= BP_MAX_XP
                                    ? "Максимум"
                                    : "Получить 100 XP"
                    }
                </button>
            </div>

            <div class="bp-rewards-heading">
                <h3>Награды сезона</h3>
                <span>${bpClaimedRewards.length} / ${BP_MAX_LEVEL} получено</span>
            </div>

            <div class="bp-rewards-list">
                ${rewardsHTML}
            </div>

            <div class="bp-footer">
                XP за ежедневное задание начисляется один раз в день.
            </div>
        </div>
    `;
}

function addBattlePassStyles() {
    if (document.getElementById("battlepass-styles")) return;

    const style = document.createElement("style");
    style.id = "battlepass-styles";

    style.textContent = `
        #battlepass-screen {
            display: none;
            padding: 16px;
            padding-bottom: 100px;
            color: #fff;
        }

        #battlepass-screen.active {
            display: block;
        }

        .bp-container {
            max-width: 600px;
            margin: 0 auto;
        }

        .bp-header {
            text-align: center;
            padding: 22px 12px;
            background: linear-gradient(135deg, #26243d, #151522);
            border: 1px solid #393653;
            border-radius: 18px;
            margin-bottom: 14px;
        }

        .bp-season-label {
            color: #c5a5ff;
            font-size: 11px;
            letter-spacing: 3px;
            font-weight: bold;
        }

        .bp-header h2 {
            margin: 10px 0;
            font-size: 25px;
        }

        .bp-header p {
            color: #aaa;
            font-size: 12px;
            margin: 5px 0;
        }

        .bp-header .bp-time-left {
            color: #e5c56b;
            font-weight: bold;
        }

        .bp-progress-card,
        .bp-daily-card {
            background: #1c1c29;
            border: 1px solid #333344;
            border-radius: 15px;
            padding: 16px;
            margin-bottom: 14px;
        }

        .bp-progress-top {
            display: flex;
            justify-content: space-between;
            color: #bbb;
            font-size: 13px;
        }

        .bp-progress-top strong {
            color: #e5c56b;
        }

        .bp-xp-number {
            margin: 14px 0 9px;
            font-size: 22px;
            font-weight: bold;
        }

        .bp-progress-track {
            width: 100%;
            height: 11px;
            background: #343444;
            border-radius: 20px;
            overflow: hidden;
        }

        .bp-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #9870ef, #e2bd68);
            border-radius: 20px;
            transition: width .3s ease;
        }

        .bp-progress-caption {
            color: #aaa;
            font-size: 11px;
            margin-top: 9px;
        }

        .bp-daily-card {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .bp-daily-icon {
            font-size: 30px;
        }

        .bp-daily-info {
            flex: 1;
            min-width: 130px;
        }

        .bp-daily-info h3 {
            margin: 0 0 5px;
            font-size: 15px;
        }

        .bp-daily-info p {
            color: #aaa;
            font-size: 12px;
            margin: 0 0 5px;
        }

        .bp-daily-info strong {
            color: #e5c56b;
            font-size: 12px;
        }

        .bp-daily-button,
        .bp-reward-button {
            border: none;
            border-radius: 9px;
            padding: 10px 13px;
            color: #171717;
            background: #e5c56b;
            font-weight: bold;
            cursor: pointer;
        }

        .bp-daily-button:disabled {
            background: #41414c;
            color: #aaa;
            cursor: default;
        }

        .bp-rewards-heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            margin: 22px 2px 12px;
        }

        .bp-rewards-heading h3 {
            margin: 0;
            font-size: 17px;
        }

        .bp-rewards-heading span {
            color: #aaa;
            font-size: 11px;
        }

        .bp-rewards-list {
            display: grid;
            gap: 9px;
        }

        .bp-reward-card {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            background: #1c1c29;
            border: 1px solid #343444;
            border-radius: 12px;
        }

        .bp-unlocked {
            border-color: #b99b55;
        }

        .bp-reward-level {
            min-width: 75px;
            color: #e5c56b;
            font-size: 11px;
            font-weight: bold;
        }

        .bp-reward-name {
            flex: 1;
            font-size: 12px;
            overflow-wrap: anywhere;
        }

        .bp-reward-action {
            text-align: right;
        }

        .bp-reward-button {
            padding: 8px 10px;
            font-size: 11px;
        }

        .bp-reward-done,
        .bp-reward-locked {
            color: #999;
            font-size: 10px;
        }

        .bp-reward-done {
            color: #72d69a;
        }

        .bp-footer {
            color: #777;
            font-size: 11px;
            text-align: center;
            padding: 18px 5px;
        }

        #nav-battlepass {
            cursor: pointer;
        }
    `;

    document.head.appendChild(style);
}

function createBattlePassScreen() {
    addBattlePassStyles();

    let screen = document.getElementById("battlepass-screen");

    if (!screen) {
        screen = document.createElement("section");
        screen.id = "battlepass-screen";
        screen.className = "screen";

        const main = document.getElementById("main-screen");

        if (main?.parentElement) {
            main.parentElement.appendChild(screen);
        } else {
            document.body.appendChild(screen);
        }
    }

    const nav = document.querySelector(".bottom-nav");

    if (nav && !document.getElementById("nav-battlepass")) {
        const button = document.createElement("div");

        button.id = "nav-battlepass";
        button.className = "nav-item";
        button.innerHTML = `
            <span style="font-size:20px;">⚔️</span>
            <span>Пропуск</span>
        `;

        button.addEventListener("click", () => switchTab("battlepass"));

        nav.appendChild(button);
    }

    renderBattlePass();
}

// ==================================
// НОРМАЛИЗАЦИЯ ИНВЕНТАРЯ
// ==================================

inventory = inventory.map(item => {
    for (const items of Object.values(casesData)) {
        const found = items.find(skin => skin.name === item.name);
        if (found) return { ...found };
    }

    return item;
});

// ==================================
// СОХРАНЕНИЕ
// ==================================

function saveProgress() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
        balance,
        inventory,
        freeSandstoneOpens,
        lastFreeCaseTime,
        bpXP,
        bpLastDailyClaim,
        bpClaimedRewards
    }));
}

// ==================================
// БАЛАНС
// ==================================

function updateBalanceUI() {
    const el = document.getElementById("balance-display");

    if (el) el.innerText = balance;
}

// ==================================
// ПРОФИЛЬ
// ==================================

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
        adminButton.style.display = isAdmin ? "block" : "none";
    }
}

// ==================================
// СЛУЧАЙНЫЙ ПРЕДМЕТ
// ==================================

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

// ==================================
// РУЛЕТКА
// ==================================

window.currentDrop = null;

function runRoulette(caseName) {
    const currentDrop = getRandomDrop(caseName);

    if (!currentDrop) {
        showAlert("Кейс не найден!");
        return;
    }

    tg?.HapticFeedback?.impactOccurred("medium");

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
            tg?.HapticFeedback?.notificationOccurred("success");
        }, 5100);
    }, 100);
}

// ==================================
// ОТКРЫТИЕ КЕЙСА
// ==================================

function openCase(caseName, casePrice) {
    if (!casesData[caseName]) {
        showAlert("Кейс не найден!");
        return;
    }

    const price = Number(casePrice);

    if (!Number.isFinite(price) || price < 0) {
        showAlert("Некорректная цена кейса!");
        return;
    }

    if (caseName === "Sandstone" && freeSandstoneOpens > 0) {
        freeSandstoneOpens--;
        saveProgress();
    } else {
        if (balance < price) {
            showAlert("Недостаточно монет!");
            return;
        }

        balance -= price;
        updateBalanceUI();
        saveProgress();
    }

    runRoulette(caseName);
}

// ==================================
// БЕСПЛАТНЫЙ КЕЙС
// ==================================

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

// ==================================
// ЗАКРЫТИЕ РУЛЕТКИ
// ==================================

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

// ==================================
// ТАЙМЕР БЕСПЛАТНОГО КЕЙСА
// ==================================

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

// ==================================
// АКТИВАЦИЯ ПРОМОКОДА
// ==================================

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

    if (!promo && code === "PROMO") {
        const oldUsed =
            localStorage.getItem("bestdrop_promo_PROMO_used") === "true";

        if (oldUsed) {
            showAlert("Промокод уже использован!");
            return;
        }

        freeSandstoneOpens += 10;

        localStorage.setItem("bestdrop_promo_PROMO_used", "true");

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

// ==================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ==================================

function switchTab(tab) {
    if (tab === "bonus") tab = "free";

    const screens = {
        main: "main-screen",
        inventory: "inventory-screen",
        promo: "promo-screen",
        upgrade: "upgrade-screen",
        free: "free-case-screen",
        battlepass: "battlepass-screen"
    };

    if (!screens[tab]) return;

    const admin = document.getElementById("admin-screen");

    if (admin) {
        admin.classList.remove("active");
        admin.style.display = "none";
    }

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
        free: "nav-free",
        battlepass: "nav-battlepass"
    };

    document.getElementById(navIds[tab])?.classList.add("active");

    const nav = document.querySelector(".bottom-nav");

    if (nav) nav.style.display = "";

    if (tab === "inventory") updateInventoryUI();
    if (tab === "free") updateFreeCaseTimer();
    if (tab === "battlepass") renderBattlePass();

    if (
        tab === "upgrade" &&
        typeof renderUpgradeHistory === "function"
    ) {
        renderUpgradeHistory();
    }
}

// ==================================
// ИНВЕНТАРЬ
// ==================================

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
                <p>${escapeAdminText(item.name)}</p>

                <div style="color:#aaa;font-size:11px;margin-bottom:5px;">
                    ${escapeAdminText(item.rarity)}
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

// ==================================
// АДМИН-ПАНЕЛЬ
// ==================================

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
        "#main-screen, #inventory-screen, #promo-screen, #upgrade-screen, #free-case-screen, #battlepass-screen"
    ).forEach(element => {
        element.classList.remove("active");
        element.style.display = "none";
    });

    admin.style.display = "block";
    admin.classList.add("active");

    const nav = document.querySelector(".bottom-nav");

    if (nav) nav.style.display = "none";

    renderAdminPromos();
}

function closeAdminPanel() {
    const admin = document.getElementById("admin-screen");

    if (admin) {
        admin.classList.remove("active");
        admin.style.display = "none";
    }

    switchTab("main");
}

// ==================================
// ИЗМЕНЕНИЕ БАЛАНСА
// ==================================

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

// ==================================
// СОЗДАНИЕ ПРОМОКОДА
// ==================================

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
        showAlert("Код должен содержать от 3 до 20 символов!");
        return;
    }

    if (code === "PROMO") {
        showAlert("Это имя уже занято старым промокодом!");
        return;
    }

    if (!Number.isInteger(reward) || reward < 1) {
        showAlert("Награда должна быть больше нуля!");
        return;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        showAlert("Лимит должен быть больше нуля!");
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

// ==================================
// ЗАЩИТА ТЕКСТА
// ==================================

function escapeAdminText(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ==================================
// СПИСОК ПРОМОКОДОВ
// ==================================

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

// ==================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ==================================

updateTelegramProfile();
updateBalanceUI();
updateInventoryUI();
updateFreeCaseTimer();

createBattlePassScreen();

setInterval(updateFreeCaseTimer, 1000);

// Сохраняем текущие данные
saveProgress();

// ==================================
// ЭКСПОРТ ФУНКЦИЙ ДЛЯ HTML
// ==================================

window.showAlert = showAlert;

window.openCase = openCase;
window.openFreeCase = openFreeCase;
window.closeRoulette = closeRoulette;

window.activatePromo = activatePromo;
window.switchTab = switchTab;
window.sellItem = sellItem;

window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.adminChangeBalance = adminChangeBalance;
window.adminCreatePromo = adminCreatePromo;
window.renderAdminPromos = renderAdminPromos;

window.claimDailyBPTask = claimDailyBPTask;
window.claimBPReward = claimBPReward;
window.renderBattlePass = renderBattlePass;
window.addBPXP = addBPXP;
