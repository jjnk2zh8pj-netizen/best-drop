
(() => {
    let sourceIndex = null;
    let targetSkin = null;
    let busy = false;

    const HISTORY_KEY = "bestdrop_upgrade_history";
    const SUCCESS_MULTIPLIER = 80;

    const style = document.createElement("style");
    style.textContent = `
        #upgrade-screen .bd-up {
            color: white;
            padding: 14px;
            max-width: 650px;
            margin: auto;
        }

        .bd-up-title {
            font-size: 25px;
            font-weight: 900;
            text-align: center;
            margin: 12px 0 5px;
        }

        .bd-up-subtitle {
            text-align: center;
            color: #999;
            font-size: 13px;
            margin-bottom: 22px;
        }

        .bd-up-slots {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .bd-up-slot {
            min-width: 0;
            background: linear-gradient(145deg,#252b38,#151923);
            border: 1px solid #414b60;
            border-radius: 16px;
            padding: 12px;
            text-align: center;
        }

        .bd-up-slot img {
            width: 100%;
            height: 105px;
            object-fit: contain;
        }

        .bd-up-slot-name {
            font-weight: bold;
            font-size: 13px;
            min-height: 34px;
            margin: 8px 0;
        }

        .bd-up-price {
            color: #f4c542;
            font-size: 13px;
        }

        .bd-up-pick {
            width: 100%;
            border: 1px solid #59677f;
            background: #30394a;
            color: white;
            padding: 11px 5px;
            border-radius: 9px;
            font-weight: bold;
            margin-top: 8px;
        }

        .bd-up-arrow {
            text-align: center;
            font-size: 28px;
            color: #f4c542;
            margin: 13px;
        }

        .bd-up-info {
            background: #202633;
            border: 1px solid #374154;
            border-radius: 12px;
            padding: 14px;
            margin: 17px 0;
        }

        .bd-up-info-row {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin: 8px 0;
            font-size: 14px;
        }

        .bd-up-green {
            color: #55df91;
            font-weight: bold;
        }

        .bd-up-gold {
            color: #f4c542;
            font-weight: bold;
        }

        .bd-up-main {
            width: 100%;
            padding: 17px;
            border: 0;
            border-radius: 12px;
            color: #171717;
            font-size: 17px;
            font-weight: 900;
            background: linear-gradient(100deg,#f6c945,#ff9e35);
        }

        .bd-up-main:disabled {
            opacity: .4;
        }

        .bd-up-chance {
            margin: 18px 0;
            padding: 15px;
            background: #202633;
            border: 1px solid #39465c;
            border-radius: 13px;
        }

        .bd-up-chance-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-size: 14px;
        }

        .bd-up-chance-value {
            color: #55df91;
            font-size: 23px;
            font-weight: 900;
        }

        .bd-up-bar {
            height: 13px;
            background: #10151e;
            border-radius: 20px;
            overflow: hidden;
        }

        .bd-up-bar-fill {
            height: 100%;
            width: 0%;
            border-radius: 20px;
            background: linear-gradient(90deg,#36c878,#a5ff65);
            transition: width .3s;
        }

        .bd-up-catalog {
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 10px;
            margin-top: 12px;
        }

        .bd-up-item {
            background: #222936;
            border: 1px solid #394456;
            border-radius: 12px;
            padding: 9px;
            color: white;
            text-align: center;
            min-width: 0;
        }

        .bd-up-item img {
            width: 100%;
            height: 85px;
            object-fit: contain;
        }

        .bd-up-item strong {
            display: block;
            font-size: 12px;
            margin: 5px 0;
        }

        .bd-up-item small {
            color: #f4c542;
        }

        .bd-up-item button {
            width: 100%;
            margin-top: 8px;
            border: 0;
            border-radius: 7px;
            padding: 9px 3px;
            background: #3c4b65;
            color: white;
        }

        .bd-up-item button:disabled {
            opacity: .4;
        }

        .bd-up-history {
            background: #202633;
            border-radius: 10px;
            padding: 12px;
            margin-top: 10px;
            font-size: 13px;
        }

        .bd-up-history-row {
            padding: 10px 0;
            border-bottom: 1px solid #394456;
        }

        .bd-up-history-row:last-child {
            border-bottom: 0;
        }

        .bd-up-modal {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: rgba(0,0,0,.92);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 12px;
        }

        .bd-up-modal-box {
            width: 100%;
            max-width: 460px;
            max-height: 85vh;
            overflow-y: auto;
            background: #171d29;
            border: 1px solid #4a5870;
            border-radius: 16px;
            padding: 15px;
            color: white;
        }

        .bd-up-modal-box h3 {
            text-align: center;
        }

        .bd-up-search {
            width: 100%;
            box-sizing: border-box;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #536078;
            background: #252d3b;
            color: white;
            margin: 10px 0;
        }

        .bd-up-result {
            text-align: center;
            padding: 20px 10px;
            background: #202b36;
            border: 1px solid #55df91;
            border-radius: 14px;
            margin: 15px 0;
        }

        .bd-up-result.failed {
            border-color: #e65c68;
        }

        .bd-up-result img {
            width: 180px;
            height: 120px;
            object-fit: contain;
        }

        .bd-up-result h3 {
            color: #55df91;
        }

        .bd-up-result.failed h3 {
            color: #ff6875;
        }

        .bd-up-anim {
            animation: bdUpgradePulse .5s ease;
        }

        .bd-up-roulette {
            text-align: center;
            padding: 25px 10px;
        }

        .bd-up-roulette-bar {
            height: 15px;
            border-radius: 20px;
            background: #10151e;
            overflow: hidden;
            margin: 20px 0;
        }

        .bd-up-roulette-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg,#36c878,#f4c542);
            transition: width 2.4s cubic-bezier(.1,.8,.2,1);
        }

        @keyframes bdUpgradePulse {
            0% { transform: scale(.96); }
            50% { transform: scale(1.04); }
            100% { transform: scale(1); }
        }
    `;

    document.head.appendChild(style);

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function allSkins() {
        const result = new Map();

        Object.values(casesData).forEach(items => {
            items.forEach(item => {
                if (Number(item.price) > 0) {
                    result.set(item.name, {...item});
                }
            });
        });

        return [...result.values()].sort(
            (a, b) => Number(a.price) - Number(b.price)
        );
    }

    function historyData() {
        try {
            const data = JSON.parse(
                localStorage.getItem(HISTORY_KEY)
            );

            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function saveHistory(data) {
        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(data.slice(0, 30))
        );
    }

    function money(value) {
        return (Number(value) || 0).toLocaleString("ru-RU");
    }

    function getSource() {
        if (sourceIndex === null) return null;
        return inventory[sourceIndex] || null;
    }

    function getChance() {
        const source = getSource();

        if (!source || !targetSkin) return 0;

        const sourcePrice = Number(source.price) || 0;
        const targetPrice = Number(targetSkin.price) || 0;

        if (sourcePrice <= 0 || targetPrice <= sourcePrice) {
            return 0;
        }

        return Math.min(
            90,
            Math.max(
                0.1,
                SUCCESS_MULTIPLIER * sourcePrice / targetPrice
            )
        );
    }

    function render() {
        const screen = document.getElementById("upgrade-screen");
        if (!screen) return;

        const source = getSource();
        const chance = getChance();
        const validTarget = source && targetSkin &&
            Number(targetSkin.price) > Number(source.price);

        screen.innerHTML = `
            <div class="bd-up">
                <div class="bd-up-title">SKIN UPGRADE</div>

                <div class="bd-up-subtitle">
                    Испытай удачу и получи более дорогой скин!
                </div>

                <div class="bd-up-slots">
                    <div class="bd-up-slot">
                        <div style="color:#aaa;font-size:12px">
                            ТВОЙ ПРЕДМЕТ
                        </div>

                        <img src="${escapeHTML(source?.img || "")}"
                             onerror="this.style.opacity='.2'">

                        <div class="bd-up-slot-name">
                            ${escapeHTML(source?.name || "Не выбран")}
                        </div>

                        <div class="bd-up-price">
                            ${source ? money(source.price) + " ♦" : "—"}
                        </div>

                        <button class="bd-up-pick"
                            onclick="bdOpenPicker('source')"
                            ${busy ? "disabled" : ""}>
                            ВЫБРАТЬ
                        </button>
                    </div>

                    <div class="bd-up-slot">
                        <div style="color:#aaa;font-size:12px">
                            ЖЕЛАЕМЫЙ ПРЕДМЕТ
                        </div>

                        <img src="${escapeHTML(targetSkin?.img || "")}"
                             onerror="this.style.opacity='.2'">

                        <div class="bd-up-slot-name">
                            ${escapeHTML(targetSkin?.name || "Не выбран")}
                        </div>

                        <div class="bd-up-price">
                            ${targetSkin ? money(targetSkin.price) + " ♦" : "—"}
                        </div>

                        <button class="bd-up-pick"
                            onclick="bdOpenPicker('target')"
                            ${busy || !source ? "disabled" : ""}>
                            ВЫБРАТЬ
                        </button>
                    </div>
                </div>

                <div class="bd-up-arrow">↓</div>

                <div class="bd-up-chance">
                    <div class="bd-up-chance-top">
                        <span>ШАНС УСПЕХА</span>
                        <span class="bd-up-chance-value">
                            ${validTarget ? chance.toFixed(1) + "%" : "—"}
                        </span>
                    </div>

                    <div class="bd-up-bar">
                        <div class="bd-up-bar-fill"
                            style="width:${validTarget ? chance : 0}%">
                        </div>
                    </div>

                    <div style="color:#999;font-size:11px;margin-top:9px">
                        Шанс зависит от стоимости выбранных предметов
                    </div>
                </div>

                <div class="bd-up-info">
                    <div class="bd-up-info-row">
                        <span>Цена твоего скина</span>
                        <strong>${source ? money(source.price) + " ♦" : "—"}</strong>
                    </div>

                    <div class="bd-up-info-row">
                        <span>Цена желаемого скина</span>
                        <strong class="bd-up-gold">
                            ${targetSkin ? money(targetSkin.price) + " ♦" : "—"}
                        </strong>
                    </div>

                    <div class="bd-up-info-row">
                        <span>Твой баланс</span>
                        <strong>${money(balance)} ♦</strong>
                    </div>
                </div>

                <button class="bd-up-main"
                    onclick="bdDoUpgrade()"
                    ${!validTarget || busy ? "disabled" : ""}>
                    ${busy ? "АПГРЕЙД..." : "УЛУЧШИТЬ"}
                </button>

                <h3 style="margin-top:28px">ИСТОРИЯ АПГРЕЙДОВ</h3>
                <div id="bd-up-history"></div>
            </div>
        `;

        renderHistory();
    }

    function renderHistory() {
        const box = document.getElementById("bd-up-history");
        if (!box) return;

        const data = historyData();

        if (!data.length) {
            box.innerHTML =
                '<p style="color:#999">Пока попыток нет</p>';
            return;
        }

        box.innerHTML = data.map(item => {
            const success = item.success === true;

            return `
                <div class="bd-up-history-row">
                    <strong>${escapeHTML(item.from)}</strong>
                    <span style="color:#f4c542"> → </span>
                    <strong>${escapeHTML(item.to)}</strong>

                    <div style="color:${success ? "#55df91" : "#ff6875"};font-weight:bold">
                        ${success ? "УСПЕХ" : "НЕУДАЧА"}
                    </div>

                    <small style="color:#999">
                        Шанс: ${Number(item.chance).toFixed(1)}%
                        · ${escapeHTML(item.date)}
                    </small>
                </div>
            `;
        }).join("");
    }

    function openPicker(type) {
        if (busy) return;

        closePicker();

        if (type === "target" && !getSource()) {
            showAlert("Сначала выбери предмет из инвентаря!");
            return;
        }

        let items;

        if (type === "source") {
            items = inventory
                .map((item, index) => ({...item, _index: index}))
                .filter(item => Number(item.price) > 0);
        } else {
            const source = getSource();

            items = allSkins().filter(item =>
                Number(item.price) > Number(source.price)
            );
        }

        const modal = document.createElement("div");
        modal.className = "bd-up-modal";
        modal.id = "bd-up-modal";

        const box = document.createElement("div");
        box.className = "bd-up-modal-box";

        const title = document.createElement("h3");
        title.textContent = type === "source"
            ? "ТВОЙ ИНВЕНТАРЬ"
            : "ВЫБЕРИ ЖЕЛАЕМЫЙ СКИН";

        const search = document.createElement("input");
        search.className = "bd-up-search";
        search.placeholder = "Поиск скина...";

        const catalog = document.createElement("div");
        catalog.className = "bd-up-catalog";

        function draw(filter = "") {
            catalog.innerHTML = "";

            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(filter.toLowerCase())
            );

            if (!filtered.length) {
                catalog.innerHTML = `
                    <p style="grid-column:span 2;color:#aaa">
                        ${type === "source"
                            ? "Нет доступных предметов для апгрейда"
                            : "Нет скинов дороже выбранного предмета"}
                    </p>
                `;
                return;
            }

            filtered.forEach(item => {
                const card = document.createElement("div");
                card.className = "bd-up-item";

                const img = document.createElement("img");
                img.src = item.img || "";

                const name = document.createElement("strong");
                name.textContent = item.name;

                const price = document.createElement("small");
                price.textContent = money(item.price) + " ♦";

                const button = document.createElement("button");
                button.textContent = "ВЫБРАТЬ";

                button.onclick = () => {
                    if (busy) return;

                    if (type === "source") {
                        sourceIndex = item._index;
                        targetSkin = null;
                    } else {
                        targetSkin = {...item};
                    }

                    closePicker();
                    render();
                };

                card.append(img, name, price, button);
                catalog.appendChild(card);
            });
        }

        search.oninput = () => draw(search.value);

        const close = document.createElement("button");
        close.className = "bd-up-pick";
        close.textContent = "ЗАКРЫТЬ";
        close.onclick = closePicker;

        box.append(title, search, catalog, close);
        modal.appendChild(box);

        modal.onclick = event => {
            if (event.target === modal) closePicker();
        };

        document.body.appendChild(modal);
        draw();
    }

    function closePicker() {
        document.getElementById("bd-up-modal")?.remove();
    }

    function showResult(item, success, chance) {
        const modal = document.createElement("div");
        modal.className = "bd-up-modal";

        const box = document.createElement("div");
        box.className = "bd-up-modal-box bd-up-anim";

        const result = document.createElement("div");
        result.className = "bd-up-result" + (success ? "" : " failed");

        const symbol = document.createElement("div");
        symbol.style.fontSize = "35px";
        symbol.textContent = success ? "✓" : "✕";

        const heading = document.createElement("h3");
        heading.textContent = success
            ? "АПГРЕЙД УДАЛСЯ!"
            : "НЕУДАЧА!";

        const img = document.createElement("img");
        img.src = success ? item.img : "";

        const name = document.createElement("h3");
        name.textContent = success
            ? item.name
            : "Предмет не удалось улучшить";

        const price = document.createElement("div");
        price.className = "bd-up-gold";
        price.textContent = success
            ? money(item.price) + " ♦"
            : "Шанс был " + chance.toFixed(1) + "%";

        result.append(symbol, heading, img, name, price);

        const button = document.createElement("button");
        button.className = "bd-up-main";
        button.textContent = "ПОНЯТНО";
        button.onclick = () => modal.remove();

        box.append(result, button);
        modal.appendChild(box);
        document.body.appendChild(modal);
    }

    function showAnimation(callback) {
        const modal = document.createElement("div");
        modal.className = "bd-up-modal";

        const box = document.createElement("div");
        box.className = "bd-up-modal-box";

        const title = document.createElement("h3");
        title.textContent = "ПРОВЕРЯЕМ ШАНС...";

        const text = document.createElement("div");
        text.className = "bd-up-roulette";
        text.textContent = "Удачи!";

        const bar = document.createElement("div");
        bar.className = "bd-up-roulette-bar";

        const fill = document.createElement("div");
        fill.className = "bd-up-roulette-fill";

        bar.appendChild(fill);
        box.append(title, text, bar);
        modal.appendChild(box);
        document.body.appendChild(modal);

        requestAnimationFrame(() => {
            fill.style.width = "100%";
        });

        setTimeout(() => {
            modal.remove();
            callback();
        }, 2500);
    }

    function doUpgrade() {
        if (busy) return;

        const source = getSource();

        if (!source || !targetSkin) {
            showAlert("Выбери оба предмета!");
            return;
        }

        if (Number(source.price) <= 0) {
            showAlert("Этот предмет нельзя использовать для апгрейда!");
            return;
        }

        if (Number(targetSkin.price) <= Number(source.price)) {
            showAlert("Выбери скин дороже своего предмета!");
            return;
        }

        if (sourceIndex < 0 || sourceIndex >= inventory.length) {
            showAlert("Предмет больше не находится в инвентаре.");
            reset();
            return;
        }

        const chance = getChance();

        if (chance <= 0) {
            showAlert("Не удалось рассчитать шанс апгрейда.");
            return;
        }

        const sourceCopy = {...source};
        const targetCopy = {...targetSkin};
        const selectedIndex = sourceIndex;

        busy = true;
        render();

        showAnimation(() => {
            const current = inventory[selectedIndex];

            if (!current || current.name !== sourceCopy.name) {
                busy = false;
                reset();
                showAlert("Инвентарь изменился. Попробуй ещё раз.");
                return;
            }

            const success = Math.random() * 100 < chance;

            // Исходный предмет расходуется в любом случае.
            inventory.splice(selectedIndex, 1);

            if (success) {
                inventory.push({...targetCopy});
            }

            const history = historyData();

            history.unshift({
                from: sourceCopy.name,
                to: targetCopy.name,
                chance,
                success,
                date: new Date().toLocaleString("ru-RU")
            });

            saveHistory(history);

            if (typeof saveProgress === "function") {
                saveProgress();
            }

            if (typeof updateBalanceUI === "function") {
                updateBalanceUI();
            }

            if (typeof updateInventoryUI === "function") {
                updateInventoryUI();
            }

            sourceIndex = null;
            targetSkin = null;
            busy = false;

            render();
            showResult(targetCopy, success, chance);

            if (typeof tg !== "undefined" && tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred(
                    success ? "success" : "error"
                );
            }
        });
    }

    function reset() {
        if (busy) return;

        sourceIndex = null;
        targetSkin = null;
        render();
    }

    window.bdOpenPicker = openPicker;
    window.bdDoUpgrade = doUpgrade;
    window.resetUpgrade = reset;

    window.selectMySkin = () => openPicker("source");
    window.selectTargetSkin = () => openPicker("target");
    window.doUpgrade = doUpgrade;
    window.renderUpgradeHistory = renderHistory;

    const oldSwitchTab = window.switchTab;

    if (typeof oldSwitchTab === "function") {
        window.switchTab = function(tab) {
            oldSwitchTab(tab);

            if (tab === "upgrade") {
                render();
            }
        };
    }

    render();
})();
