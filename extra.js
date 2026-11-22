
/* =====================================
   BEST DROP — EXTRA.JS
   Апгрейд, ежедневный кейс, бонус, админка
===================================== */

// ---------- ОБЩИЕ НАСТРОЙКИ ----------

const EXTRA_FREE_COOLDOWN = 24 * 60 * 60 * 1000;
const EXTRA_UPGRADE_CHANCE = 0.65;

function extraGetPlayer() {
    if (typeof player !== "undefined") return player;

    try {
        return JSON.parse(localStorage.getItem("player")) || {};
    } catch {
        return {};
    }
}

function extraSavePlayer() {
    if (typeof savePlayer === "function") {
        savePlayer();
    } else {
        localStorage.setItem("player", JSON.stringify(extraGetPlayer()));
    }
}

// ---------- ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ----------

function switchTab(tab) {
    const screens = [
        "main-screen",
        "inventory-screen",
        "promo-screen",
        "upgrade-screen",
        "free-screen"
    ];

    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    const target = document.getElementById(tab + "-screen");
    if (target) target.style.display = "block";

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    const nav = document.querySelector(
        `.nav-item[onclick*="${tab}"]`
    );

    if (nav) nav.classList.add("active");

    if (tab === "free") updateFreeTimer();
    if (tab === "inventory" && typeof updateInventory === "function") {
        updateInventory();
    }
}

// ---------- АПГРЕЙД ----------

function upgradeItem() {
    const p = extraGetPlayer();

    const inventory = p.inventory || [];

    if (inventory.length < 2) {
        alert("Для апгрейда нужно минимум два предмета!");
        return;
    }

    const first = inventory.shift();
    const second = inventory.shift();

    const success = Math.random() < EXTRA_UPGRADE_CHANCE;

    if (success) {
        const reward = {
            name: "Улучшенный предмет",
            image: first.image || "",
            value: (Number(first.value) || 0) +
                   (Number(second.value) || 0)
        };

        inventory.push(reward);
        alert("Апгрейд успешен!");
    } else {
        alert("Апгрейд не удался!");
    }

    p.inventory = inventory;
    extraSavePlayer();

    if (typeof updateInventory === "function") {
        updateInventory();
    }
}

// ---------- ЕЖЕДНЕВНЫЙ КЕЙС ----------

function openFreeCase() {
    const p = extraGetPlayer();
    const now = Date.now();

    const last = Number(
        localStorage.getItem("bestDropFreeTime") || 0
    );

    if (now - last < EXTRA_FREE_COOLDOWN) {
        alert("Ежедневный кейс ещё недоступен!");
        updateFreeTimer();
        return;
    }

    localStorage.setItem("bestDropFreeTime", String(now));

    const reward = {
        name: "Ежедневная награда",
        image: "sandstone.png",
        value: 100
    };

    if (!Array.isArray(p.inventory)) {
        p.inventory = [];
    }

    p.inventory.push(reward);
    extraSavePlayer();

    alert("Ежедневный кейс открыт! Награда добавлена в инвентарь.");

    if (typeof updateInventory === "function") {
        updateInventory();
    }

    updateFreeTimer();
}

function updateFreeTimer() {
    const timer = document.getElementById("free-timer");
    if (!timer) return;

    const last = Number(
        localStorage.getItem("bestDropFreeTime") || 0
    );

    const remaining = EXTRA_FREE_COOLDOWN - (Date.now() - last);

    if (remaining <= 0) {
        timer.textContent = "Кейс доступен!";
        return;
    }

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    timer.textContent =
        `${hours}ч ${minutes}м ${seconds}с`;
}

// ---------- БОНУС ----------

function claimBonus() {
    const p = extraGetPlayer();

    const last = Number(
        localStorage.getItem("bestDropBonusTime") || 0
    );

    const day = 24 * 60 * 60 * 1000;

    if (Date.now() - last < day) {
        alert("Бонус уже получен. Возвращайся завтра!");
        return;
    }

    p.balance = (Number(p.balance) || 0) + 100;
    localStorage.setItem("bestDropBonusTime", String(Date.now()));

    extraSavePlayer();

    alert("Ты получил 100 виртуальных монет!");

    if (typeof updateBalance === "function") {
        updateBalance();
    }
}

// ---------- АДМИН-ПАНЕЛЬ ----------

function openAdminPanel() {
    const panel = document.querySelector(".admin-screen");

    if (!panel) {
        alert("Панель администратора не найдена.");
        return;
    }

    document.querySelectorAll(
        "#main-screen, #inventory-screen, #promo-screen, #upgrade-screen, #free-screen"
    ).forEach(el => {
        el.style.display = "none";
    });

    panel.classList.add("active");

    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "none";
}

function closeAdminPanel() {
    const panel = document.querySelector(".admin-screen");

    if (panel) panel.classList.remove("active");

    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "";

    switchTab("main");
}

// ---------- ЗАПУСК ----------

document.addEventListener("DOMContentLoaded", () => {
    updateFreeTimer();

    setInterval(updateFreeTimer, 1000);
});
