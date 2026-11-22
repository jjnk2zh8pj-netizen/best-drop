
const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

function showAlert(text) {
    if (tg?.showAlert) tg.showAlert(text);
    else alert(text);
}

const user = {
    id: "bestdrop_local",
    name: "Игрок",
    avatar: "https://i.pravatar.cc/100?img=11"
};

document.getElementById("user-name").innerText = user.name;
document.getElementById("user-avatar").src = user.avatar;

const SAVE_KEY = "bestdrop_save";

let savedData = {};
try {
    savedData = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
} catch {
    savedData = {};
}

let balance = savedData.balance ?? 100;
let inventory = savedData.inventory ?? [];
let freeSandstoneOpens = savedData.freeSandstoneOpens ?? 0;
let lastFreeCaseTime = savedData.lastFreeCaseTime ?? 0;

let isPromoUsedGlobally =
    localStorage.getItem("bestdrop_promo_PROMO_used") === "true";

const casesData = {
    Sandstone: [
        { name: "P350", rarity: "Common", chance: 50, img: "https://cdn.cs.money/730/skins/weapon_p250_sand_dune_light.png", price: 9 },
        { name: "MP7", rarity: "Rare", chance: 40, img: "https://cdn.cs.money/730/skins/weapon_mp7_impire_light.png", price: 89 },
        { name: "AKR Necromancy", rarity: "Legendary", chance: 9, img: "https://cdn.cs.money/730/skins/weapon_ak47_neon_rider_light.png", price: 169 },
        { name: "Агент", rarity: "Arcane", chance: 1, img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png", price: 999 }
    ],
    Breeze: [
        { name: "Paladin", rarity: "Arcane", chance: 0.1, img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png", price: 1999 },
        { name: "Medal", rarity: "Common", chance: 99.9, img: "https://cdn.cs.money/730/skins/weapon_glock_water_elemental_light.png", price: 9 }
    ],
    Dune: [
        { name: "M4", rarity: "Rare", chance: 40, img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png", price: 80 },
        { name: "SPAS", rarity: "Rare", chance: 30, img: "https://cdn.cs.money/730/skins/weapon_sawedoff_the_bank_light.png", price: 150 },
        { name: "M40", rarity: "Epic", chance: 15, img: "https://cdn.cs.money/730/skins/weapon_awp_asiimov_light.png", price: 300 },
        { name: "Anubis", rarity: "Legendary", chance: 9, img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png", price: 800 },
        { name: "Jade AK", rarity: "Arcane", chance: 1.5, img: "https://cdn.cs.money/730/skins/weapon_ak47_neon_rider_light.png", price: 799 },
        { name: "Karambit", rarity: "Arcane", chance: 0.01, img: "https://cdn.cs.money/730/skins/weapon_knife_karambit_doppler_phase2_light.png", price: 4999 }
    ],
    FreeCase: [
        { name: "P250 Sand Dune", rarity: "Common", chance: 70, img: "https://cdn.cs.money/730/skins/weapon_p250_sand_dune_light.png", price: 15 },
        { name: "Glock Water", rarity: "Common", chance: 25, img: "https://cdn.cs.money/730/skins/weapon_glock_water_elemental_light.png", price: 30 },
        { name: "MP7 Impire", rarity: "Rare", chance: 4.9, img: "https://cdn.cs.money/730/skins/weapon_mp7_impire_light.png", price: 150 },
        { name: "AKR Neon", rarity: "Legendary", chance: 0.1, img: "https://cdn.cs.money/730/skins/weapon_ak47_neon_rider_light.png", price: 500 }
    ]
};

// Обновляем цены и редкость уже сохранённых предметов
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
    document.getElementById("balance-display").innerText = balance;
}

function getRandomDrop(caseName) {
    const items = casesData[caseName];
    if (!items || !items.length) return null;

    const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
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

    modal.classList.remove("hidden");
    closeBtn.classList.add("hidden");

    strip.style.transition = "none";
    strip.style.transform = "translateX(0)";

    let html = "";
    const items = casesData[caseName];

    for (let i = 0; i < 50; i++) {
        const item = items[Math.floor(Math.random() * items.length)];
        html += `<div class="roulette-item">
            <img src="${item.img}">
            <span>${item.price} ♦</span>
        </div>`;
    }

    html += `<div class="roulette-item">
        <img src="${currentDrop.img}">
        <span style="color:#ff3333;font-weight:bold">${currentDrop.price} ♦</span>
    </div>`;

    for (let i = 0; i < 20; i++) {
        const item = items[Math.floor(Math.random() * items.length)];
        html += `<div class="roulette-item">
            <img src="${item.img}">
            <span>${item.price} ♦</span>
        </div>`;
    }

    strip.innerHTML = html;
    window.currentDrop = currentDrop;

    setTimeout(() => {
        const containerWidth = strip.parentElement.offsetWidth;
        const itemWidth = 100;
        const distance = 50 * itemWidth + containerWidth / 2 - itemWidth / 2;

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
        showAlert(`Бесплатное открытие использовано. Осталось: ${freeSandstoneOpens}`);
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

function closeRoulette() {
    document.getElementById("roulette-modal").classList.add("hidden");

    if (window.currentDrop) {
        inventory.push({ ...window.currentDrop });
        window.currentDrop = null;

        saveProgress();
        updateInventoryUI();
        showAlert("Предмет добавлен в инвентарь!");
    }
}

function activatePromo() {
    const input = document.getElementById("promo-input");
    const code = input.value.trim().toUpperCase();

    if (code !== "PROMO") {
        showAlert("Неверный промокод!");
        return;
    }

    if (isPromoUsedGlobally) {
        showAlert("Промокод уже использован!");
        return;
    }

    freeSandstoneOpens += 10;
    localStorage.setItem("bestdrop_promo_PROMO_used", "true");
    isPromoUsedGlobally = true;

    saveProgress();
    input.value = "";
    showAlert("Получено 10 бесплатных открытий Sandstone!");
}

function switchTab(tab) {
    document.getElementById("main-screen").style.display = "none";

    document.querySelectorAll(
        ".inventory-screen, .promo-screen, .upgrade-screen, .free-case-screen"
    ).forEach(el => el.classList.remove("active"));

    document.querySelectorAll(".nav-item").forEach(el => {
        el.classList.remove("active");
    });

    const screens = {
        main: ["main-screen", "nav-main"],
        inventory: ["inventory-screen", "nav-inv"],
        promo: ["promo-screen", "nav-promo"],
        upgrade: ["upgrade-screen", "nav-upgrade"],
        free: ["free-case-screen", "nav-free"]
    };

    if (!screens[tab]) return;

    const [screenId, navId] = screens[tab];

    if (tab === "main") {
        document.getElementById(screenId).style.display = "block";
    } else {
        document.getElementById(screenId).classList.add("active");
    }

    document.getElementById(navId).classList.add("active");

    if (tab === "inventory") updateInventoryUI();
    if (tab === "free") updateFreeCaseTimer();
}

function updateInventoryUI() {
    const grid = document.getElementById("inventory-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (inventory.length === 0) {
        grid.innerHTML =
            '<p style="color:#666;grid-column:span 2;text-align:center;">Тут пока пусто...</p>';
        return;
    }

    inventory.forEach((item, index) => {
        grid.innerHTML += `
            <div class="inv-item">
                <img src="${item.img}">
                <p>${item.name}</p>
                <div style="color:#aaa;font-size:11px;margin-bottom:5px;">
                    ${item.rarity} · Шанс: ${item.chance}%
                </div>
                <div style="color:#888;font-size:11px;margin-bottom:5px;">
                    Цена: ♦ ${item.price}
                </div>
                <button class="btn-sell" onclick="sellItem(${index})">
                    Продать за ${item.price} ♦
                </button>
            </div>
        `;
    });
}

function sellItem(index) {
    const item = inventory[index];
    if (!item) return;

    balance += item.price;
    inventory.splice(index, 1);

    updateBalanceUI();
    updateInventoryUI();
    saveProgress();
}

updateBalanceUI();
updateInventoryUI();
saveProgress();
