
(() => {
    let selectedMySkinIndex = null;
    let selectedTargetSkin = null;

    const HISTORY_KEY = "bestdrop_upgrade_history";

    function alertUser(message) {
        if (typeof showAlert === "function") {
            showAlert(message);
        } else {
            alert(message);
        }
    }

    function getAllGameSkins() {
        const unique = new Map();

        Object.values(casesData).forEach(items => {
            items.forEach(item => {
                if (!unique.has(item.name)) {
                    unique.set(item.name, { ...item });
                }
            });
        });

        return [...unique.values()];
    }

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveHistory(history) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function updateSelectedSkinUI() {
        const source = inventory[selectedMySkinIndex];

        const sourceImg = document.getElementById("my-skin-img");
        const sourceName = document.getElementById("my-skin-name");
        const targetImg = document.getElementById("target-skin-img");
        const targetName = document.getElementById("target-skin-name");
        const chanceEl = document.getElementById("upgrade-chance");

        if (sourceImg) {
            sourceImg.src = source?.img || "";
        }

        if (sourceName) {
            sourceName.textContent = source?.name || "Выбрать предмет";
        }

        if (targetImg) {
            targetImg.src = selectedTargetSkin?.img || "";
        }

        if (targetName) {
            targetName.textContent =
                selectedTargetSkin?.name || "Выбрать цель";
        }

        if (chanceEl) {
            chanceEl.textContent =
                source && selectedTargetSkin
                    ? getUpgradeChance(source, selectedTargetSkin).toFixed(1) + "%"
                    : "—";
        }
    }

    function getUpgradeChance(source, target) {
        const sourcePrice = Math.max(1, Number(source.price) || 1);
        const targetPrice = Math.max(1, Number(target.price) || 1);

        return Math.min(90, Math.max(1, sourcePrice / targetPrice * 100));
    }

    function closePicker() {
        document.getElementById("upgrade-picker")?.remove();
    }

    function openPicker(type) {
        closePicker();

        const source = inventory[selectedMySkinIndex];

        let items = [];

        if (type === "source") {
            items = inventory.map((item, index) => ({
                ...item,
                inventoryIndex: index
            }));
        } else {
            items = getAllGameSkins()
                .filter(item => !source || item.name !== source.name);
        }

        const modal = document.createElement("div");
        modal.id = "upgrade-picker";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:rgba(0,0,0,.88);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:15px;
        `;

        const panel = document.createElement("div");

        panel.style.cssText = `
            width:100%;
            max-width:450px;
            max-height:80vh;
            overflow-y:auto;
            background:#20232b;
            border:1px solid #444;
            border-radius:15px;
            padding:15px;
            color:white;
        `;

        const title = document.createElement("h3");
        title.textContent = type === "source"
            ? "Выбери предмет из инвентаря"
            : "Выбери целевой скин";

        panel.appendChild(title);

        const close = document.createElement("button");
        close.textContent = "Закрыть";
        close.style.cssText = `
            width:100%;
            padding:12px;
            margin-bottom:12px;
            border:0;
            border-radius:8px;
            background:#444;
            color:white;
        `;
        close.onclick = closePicker;
        panel.appendChild(close);

        if (!items.length) {
            const empty = document.createElement("p");
            empty.textContent = type === "source"
                ? "Инвентарь пуст. Сначала получи предмет из кейса."
                : "Нет доступных целевых скинов.";
            panel.appendChild(empty);
        }

        items.forEach(item => {
            const button = document.createElement("button");

            button.style.cssText = `
                width:100%;
                display:flex;
                align-items:center;
                gap:12px;
                padding:10px;
                margin:5px 0;
                background:#303540;
                border:1px solid #555;
                border-radius:9px;
                color:white;
                text-align:left;
            `;

            const img = document.createElement("img");
            img.src = item.img;
            img.style.cssText =
                "width:65px;height:50px;object-fit:contain;";

            const info = document.createElement("span");
            info.textContent =
                `${item.name} · ${item.price ?? 0} ♦`;

            button.appendChild(img);
            button.appendChild(info);

            button.onclick = () => {
                if (type === "source") {
                    selectedMySkinIndex = item.inventoryIndex;
                } else {
                    selectedTargetSkin = { ...item };
                }

                closePicker();
                updateSelectedSkinUI();
            };

            panel.appendChild(button);
        });

        modal.appendChild(panel);

        modal.onclick = event => {
            if (event.target === modal) closePicker();
        };

        document.body.appendChild(modal);
    }

    function resetUpgrade() {
        selectedMySkinIndex = null;
        selectedTargetSkin = null;
        closePicker();
        updateSelectedSkinUI();
    }

    function selectMySkin() {
        openPicker("source");
    }

    function selectTargetSkin() {
        if (selectedMySkinIndex === null ||
            !inventory[selectedMySkinIndex]) {
            alertUser("Сначала выбери предмет из своего инвентаря!");
            return;
        }

        openPicker("target");
    }

    function doUpgrade() {
        const source = inventory[selectedMySkinIndex];

        if (!source) {
            alertUser("Сначала выбери предмет из инвентаря!");
            return;
        }

        if (!selectedTargetSkin) {
            alertUser("Сначала выбери целевой скин!");
            return;
        }

        if (source.name === selectedTargetSkin.name) {
            alertUser("Выбери другой целевой скин!");
            return;
        }

        const chance = getUpgradeChance(source, selectedTargetSkin);
        const success = Math.random() * 100 < chance;

        const history = getHistory();

        if (success) {
            inventory.splice(selectedMySkinIndex, 1);
            inventory.push({ ...selectedTargetSkin });

            history.unshift({
                from: source.name,
                to: selectedTargetSkin.name,
                result: "Успех",
                chance: chance.toFixed(1),
                date: new Date().toLocaleString()
            });

            alertUser(`Успех! Ты получил ${selectedTargetSkin.name}!`);
        } else {
            inventory.splice(selectedMySkinIndex, 1);

            history.unshift({
                from: source.name,
                to: selectedTargetSkin.name,
                result: "Неудача",
                chance: chance.toFixed(1),
                date: new Date().toLocaleString()
            });

            alertUser("Апгрейд не удался. Исходный предмет потерян.");
        }

        saveHistory(history.slice(0, 30));

        if (typeof saveProgress === "function") saveProgress();
        if (typeof updateInventoryUI === "function") updateInventoryUI();

        resetUpgrade();
        renderUpgradeHistory();
    }

    function renderUpgradeHistory() {
        const container = document.getElementById("upgrade-history");

        if (!container) return;

        const history = getHistory();

        if (!history.length) {
            container.innerHTML = "<p>История апгрейдов пока пуста.</p>";
            return;
        }

        container.innerHTML = history.map(item => `
            <div style="
                background:#292d36;
                padding:10px;
                margin:8px 0;
                border-radius:8px;
                color:white;
            ">
                <div>${item.from} → ${item.to}</div>
                <div style="color:${item.result === "Успех" ? "#4caf50" : "#ff6666"}">
                    ${item.result} · Шанс ${item.chance}%
                </div>
                <small style="color:#aaa">${item.date}</small>
            </div>
        `).join("");
    }

    // Делаем функции доступными для onclick в HTML
    window.selectMySkin = selectMySkin;
    window.selectTargetSkin = selectTargetSkin;
    window.doUpgrade = doUpgrade;
    window.resetUpgrade = resetUpgrade;
    window.renderUpgradeHistory = renderUpgradeHistory;

    // Заполняем информацию об игроке, если элементы есть
    if (typeof user !== "undefined") {
        const name = document.getElementById("user-name");
        const avatar = document.getElementById("user-avatar");

        if (name) name.textContent = user.name;
        if (avatar) avatar.src = user.avatar;
    }

    updateSelectedSkinUI();
    renderUpgradeHistory();
})();
