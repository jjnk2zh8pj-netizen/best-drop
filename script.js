
(() => {
    let sourceIndex = null;
    let targetSkin = null;
    let busy = false;

    const HISTORY_KEY = "bestdrop_upgrade_history";

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

        .bd-up-result img {
            width: 180px;
            height: 120px;
            object-fit: contain;
        }

        .bd-up-result h3 {
            color: #55df91;
        }

        @keyframes bdUpgradePulse {
            0% { transform: scale(.96); }
            50% { transform: scale(1.04); }
            100% { transform: scale(1); }
        }

        .bd-up-anim {
            animation: bdUpgradePulse .5s ease;
        }
    `;

    document.head.appendChild(style);

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
            (a,b) => Number(a.price) - Number(b.price)
        );
    }

    function historyData() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveHistory(data) {
        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(data.slice(0,30))
        );
    }

    function money(value) {
        return (Number(value) || 0).toLocaleString("ru-RU");
    }

    function getSource() {
        return sourceIndex === null ? null : inventory[sourceIndex] || null;
    }

    function getCost() {
        const source = getSource();

        if (!source || !targetSkin) return 0;

        return Math.max(
            0,
            (Number(targetSkin.price) || 0) -
            (Number(source.price) || 0)
        );
    }

    function render() {
        const screen = document.getElementById("upgrade-screen");
        if (!screen) return;

        const source = getSource();
        const cost = getCost();

        screen.innerHTML = `
            <div class="bd-up">
                <div class="bd-up-title">SKIN UPGRADE</div>
                <div class="bd-up-subtitle">
                    Обменивай предметы и получай новые скины
                </div>

                <div class="bd-up-slots">
                    <div class="bd-up-slot">
                        <div style="color:#aaa;font-size:12px">
                            ТВОЙ ПРЕДМЕТ
                        </div>

                        <img src="${source?.img || ""}"
                             onerror="this.style.opacity='.2'">

                        <div class="bd-up-slot-name">
                            ${source?.name || "Не выбран"}
                        </div>

                        <div class="bd-up-price">
                            ${source ? money(source.price) + " ♦" : "—"}
                        </div>

                        <button class="bd-up-pick"
                            onclick="bdOpenPicker('source')">
                            ВЫБРАТЬ
                        </button>
                    </div>

                    <div class="bd-up-slot">
                        <div style="color:#aaa;font-size:12px">
                            НОВЫЙ ПРЕДМЕТ
                        </div>

                        <img src="${targetSkin?.img || ""}"
                             onerror="this.style.opacity='.2'">

                        <div class="bd-up-slot-name">
                            ${targetSkin?.name || "Не выбран"}
                        </div>

                        <div class="bd-up-price">
                            ${targetSkin ? money(targetSkin.price) + " ♦" : "—"}
                        </div>

                        <button class="bd-up-pick"
                            onclick="bdOpenPicker('target')">
                            ВЫБРАТЬ
                        </button>
                    </div>
                </div>

                <div class="bd-up-arrow">↓</div>

                <div class="bd-up-info">
                    <div class="bd-up-info-row">
                        <span>Стоимость обмена</span>
                        <strong class="bd-up-gold">
                            ${money(cost)} ♦
                        </strong>
                    </div>

                    <div class="bd-up-info-row">
                        <span>Результат</span>
                        <strong class="bd-up-green">
                            Гарантирован
                        </strong>
                    </div>

                    <div class="bd-up-info-row">
                        <span>Твой баланс</span>
                        <strong>${money(balance)} ♦</strong>
                    </div>
                </div>

                <button class="bd-up-main"
                    onclick="bdDoUpgrade()"
                    ${!source || !targetSkin || busy || balance < cost ? "disabled" : ""}>
                    ${busy ? "ОБМЕН..." : "УЛУЧШИТЬ"}
                </button>

                <h3 style="margin-top:28px">ИСТОРИЯ ОБМЕНОВ</h3>
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
            box.innerHTML = '<p style="color:#999">Пока обменов нет</p>';
            return;
        }

        box.innerHTML = data.map(item => `
            <div class="bd-up-history-row">
                <strong>${item.from}</strong>
                <span style="color:#f4c542"> → </span>
                <strong>${item.to}</strong>
                <div class="bd-up-green">Обмен выполнен</div>
                <small style="color:#999">${item.date}</small>
            </div>
        `).join("");
    }

    function openPicker(type) {
        closePicker();

        if (type === "target" && !getSource()) {
            showAlert("Сначала выбери предмет из инвентаря!");
            return;
        }

        const items = type === "source"
            ? inventory.map((item,index) => ({
                ...item,
                _index:index
            }))
            : allSkins();

        const modal = document.createElement("div");
        modal.className = "bd-up-modal";
        modal.id = "bd-up-modal";

        const box = document.createElement("div");
        box.className = "bd-up-modal-box";

        const title = document.createElement("h3");
        title.textContent = type === "source"
            ? "ТВОЙ ИНВЕНТАРЬ"
            : "КАТАЛОГ СКИНОВ";

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
                catalog.innerHTML =
                    '<p style="grid-column:span 2;color:#aaa">Ничего не найдено</p>';
                return;
            }

            filtered.forEach(item => {
                const card = document.createElement("div");
                card.className = "bd-up-item";

                const img = document.createElement("img");
                img.src = item.img;

                const name = document.createElement("strong");
                name.textContent = item.name;

                const price = document.createElement("small");
                price.textContent = money(item.price) + " ♦";

                const button = document.createElement("button");
                button.textContent = "ВЫБРАТЬ";

                button.onclick = () => {
                    if (type === "source") {
                        sourceIndex = item._index;
                        targetSkin = null;
                    } else {
                        targetSkin = {...item};
                    }

                    closePicker();
                    render();
                };

                card.append(img,name,price,button);
                catalog.appendChild(card);
            });
        }

        search.oninput = () => draw(search.value);

        const close = document.createElement("button");
        close.className = "bd-up-pick";
        close.textContent = "ЗАКРЫТЬ";
        close.onclick = closePicker;

        box.append(title,search,catalog,close);
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

    function showResult(item) {
        const modal = document.createElement("div");
        modal.className = "bd-up-modal";

        const box = document.createElement("div");
        box.className = "bd-up-modal-box bd-up-anim";

        box.innerHTML = `
            <div class="bd-up-result">
                <div style="font-size:35px">✓</div>
                <h3>ОБМЕН ВЫПОЛНЕН!</h3>
                <img src="${item.img}">
                <h3>${item.name}</h3>
                <div class="bd-up-gold">${money(item.price)} ♦</div>
            </div>
        `;

        const button = document.createElement("button");
        button.className = "bd-up-main";
        button.textContent = "ОТЛИЧНО";
        button.onclick = () => modal.remove();

        box.appendChild(button);
        modal.appendChild(box);
        document.body.appendChild(modal);
    }

    function doUpgrade() {
        if (busy) return;

        const source = getSource();

        if (!source || !targetSkin) {
            showAlert("Выбери оба предмета!");
            return;
        }

        const cost = getCost();

        if (balance < cost) {
            showAlert("Недостаточно монет для обмена!");
            return;
        }

        if (sourceIndex < 0 || sourceIndex >= inventory.length) {
            showAlert("Предмет больше не находится в инвентаре.");
            reset();
            return;
        }

        busy = true;
        render();

        setTimeout(() => {
            const current = inventory[sourceIndex];

            if (!current || current.name !== source.name) {
                busy = false;
                reset();
                showAlert("Инвентарь изменился. Выбери предмет заново.");
                return;
            }

            balance -= cost;
            inventory.splice(sourceIndex, 1);
            inventory.push({...targetSkin});

            const history = historyData();

            history.unshift({
                from: source.name,
                to: targetSkin.name,
                date: new Date().toLocaleString("ru-RU")
            });

            saveHistory(history);

            if (typeof saveProgress === "function") saveProgress();
            if (typeof updateBalanceUI === "function") updateBalanceUI();
            if (typeof updateInventoryUI === "function") updateInventoryUI();

            const result = {...targetSkin};

            sourceIndex = null;
            targetSkin = null;
            busy = false;

            render();
            showResult(result);
        }, 900);
    }

    function reset() {
        sourceIndex = null;
        targetSkin = null;
        busy = false;
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
            if (tab === "upgrade") render();
        };
    }

    render();
})();
