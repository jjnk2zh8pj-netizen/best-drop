
(() => {
    "use strict";

    const REQUESTS_KEY = "bestdrop_withdraw_requests";
    const WITHDRAW_FEE = 0.20;

    let withdrawBusy = false;

    // ==================================
    // СТИЛИ
    // ==================================

    const style = document.createElement("style");

    style.textContent = `
        #withdraw-screen {
            display: none;
            color: #fff;
            width: 100%;
            max-width: 650px;
            margin: 0 auto;
            padding: 16px;
            box-sizing: border-box;
        }

        #withdraw-screen .wd-card {
            background: #151518;
            border: 1px solid #29292e;
            border-radius: 15px;
            padding: 16px;
            margin-bottom: 14px;
        }

        #withdraw-screen .wd-title {
            font-size: 21px;
            font-weight: 800;
            margin-bottom: 8px;
        }

        #withdraw-screen .wd-muted {
            color: #999;
            font-size: 13px;
            line-height: 1.5;
        }

        #withdraw-screen .wd-label {
            display: block;
            color: #bbb;
            font-size: 13px;
            margin: 13px 0 6px;
        }

        #withdraw-screen input {
            display: block;
            width: 100%;
            box-sizing: border-box;
            background: #0d0d10;
            border: 1px solid #34343a;
            border-radius: 9px;
            padding: 13px;
            color: white;
            outline: none;
            font-size: 15px;
        }

        #withdraw-screen input:focus {
            border-color: #e52b35;
        }

        #withdraw-screen .wd-calculation {
            background: #101013;
            border-radius: 10px;
            padding: 13px;
            margin-top: 14px;
        }

        #withdraw-screen .wd-line {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin: 8px 0;
            font-size: 13px;
            color: #aaa;
        }

        #withdraw-screen .wd-line strong {
            color: #fff;
        }

        #withdraw-screen .wd-total {
            border-top: 1px solid #333;
            padding-top: 11px;
            margin-top: 11px;
            font-size: 15px;
        }

        #withdraw-screen .wd-total strong {
            color: #ff424c;
        }

        #withdraw-screen .wd-button {
            width: 100%;
            border: 0;
            border-radius: 10px;
            background: #e52b35;
            color: white;
            padding: 14px;
            margin-top: 15px;
            font-size: 15px;
            font-weight: 800;
            cursor: pointer;
        }

        #withdraw-screen .wd-button:disabled {
            opacity: .5;
            cursor: not-allowed;
        }

        #withdraw-screen .wd-request {
            background: #101013;
            border: 1px solid #29292e;
            border-radius: 10px;
            padding: 13px;
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.6;
        }

        #withdraw-screen .wd-request b {
            color: white;
        }

        #withdraw-screen .wd-status {
            color: #ffbd54;
            font-weight: bold;
        }

        #nav-withdraw {
            cursor: pointer;
        }
    `;

    document.head.appendChild(style);

    // ==================================
    // ЗАЩИТА ТЕКСТА
    // ==================================

    function escapeText(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // ==================================
    // ЗАГРУЗКА ЗАЯВОК
    // ==================================

    function getRequests() {
        try {
            const data = JSON.parse(
                localStorage.getItem(REQUESTS_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Ошибка загрузки заявок:", error);
            return [];
        }
    }

    // ==================================
    // ФОРМАТИРОВАНИЕ
    // ==================================

    function formatGold(value) {
        return Number(value).toLocaleString("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getAmount() {
        const input = document.getElementById("wd-amount");

        if (!input) return 0;

        return Number(input.value.replace(",", "."));
    }

    // ==================================
    // РАСЧЁТ КОМИССИИ
    // ==================================

    function calculateWithdraw() {
        const amount = getAmount();

        const validAmount =
            Number.isFinite(amount) && amount > 0;

        const listing = validAmount
            ? Math.ceil((amount / (1 - WITHDRAW_FEE)) * 100) / 100
            : 0;

        const commission = validAmount
            ? Math.round((listing - amount) * 100) / 100
            : 0;

        const balanceEl = document.getElementById("wd-current-balance");
        const listingEl = document.getElementById("wd-listing");
        const commissionEl = document.getElementById("wd-commission");
        const receiveEl = document.getElementById("wd-receive");

        if (balanceEl) {
            balanceEl.textContent = formatGold(balance);
        }

        if (listingEl) {
            listingEl.textContent = formatGold(listing);
        }

        if (commissionEl) {
            commissionEl.textContent = formatGold(commission);
        }

        if (receiveEl) {
            receiveEl.textContent = formatGold(amount);
        }
    }

    // ==================================
    // СОЗДАНИЕ ЭКРАНА
    // ==================================

    function createScreen() {
        if (document.getElementById("withdraw-screen")) return;

        const screen = document.createElement("section");

        screen.id = "withdraw-screen";

        screen.innerHTML = `
            <div class="wd-card">
                <div class="wd-title">Вывод голды</div>

                <p class="wd-muted">
                    Создай демонстрационную заявку и укажи данные скина.
                    Комиссия в расчёте составляет 20%.
                </p>

                <div style="margin-top:15px;font-size:14px;">
                    Твой баланс:
                    <strong style="color:#ff424c;">
                        <span id="wd-current-balance">0</span> ♦
                    </strong>
                </div>

                <label class="wd-label" for="wd-amount">
                    Сколько монет хочешь списать
                </label>
                <input
                    id="wd-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Например: 100"
                >

                <label class="wd-label" for="wd-skin">
                    Название скина
                </label>
                <input
                    id="wd-skin"
                    type="text"
                    maxlength="60"
                    placeholder="Например: AKR Jade"
                >

                <label class="wd-label" for="wd-pattern">
                    Pattern
                </label>
                <input
                    id="wd-pattern"
                    type="text"
                    maxlength="40"
                    placeholder="Укажи pattern или Нет"
                >

                <label class="wd-label" for="wd-stickers">
                    Наклейки
                </label>
                <input
                    id="wd-stickers"
                    type="text"
                    maxlength="100"
                    placeholder="Укажи наклейки или Нет"
                >

                <div class="wd-calculation">
                    <div class="wd-line">
                        <span>Цена выставления</span>
                        <strong><span id="wd-listing">0,00</span> ♦</strong>
                    </div>

                    <div class="wd-line">
                        <span>Комиссия 20%</span>
                        <strong><span id="wd-commission">0,00</span> ♦</strong>
                    </div>

                    <div class="wd-line wd-total">
                        <span>Списание с баланса</span>
                        <strong><span id="wd-receive">0,00</span> ♦</strong>
                    </div>
                </div>

                <button
                    class="wd-button"
                    id="wd-create-button"
                    onclick="createWithdrawRequest()"
                >
                    Создать заявку
                </button>
            </div>

            <div class="wd-card">
                <div class="wd-title" style="font-size:18px;">
                    История заявок
                </div>

                <div id="wd-history"></div>
            </div>

            <p class="wd-muted" style="text-align:center;margin:10px;">
                Важно: заявки сохраняются только внутри Best Drop.
                Реальная продажа или перевод голды не выполняются.
            </p>
        `;

        const nav = document.querySelector(".bottom-nav");

        if (nav) {
            nav.parentNode.insertBefore(screen, nav);
        } else {
            document.body.appendChild(screen);
        }

        const navButton = document.createElement("div");

        navButton.className = "nav-item";
        navButton.id = "nav-withdraw";
        navButton.innerHTML = `
            <div style="font-size:20px;">⇧</div>
            <span>Вывод</span>
        `;

        navButton.onclick = () => switchTab("withdraw");

        if (nav) {
            nav.appendChild(navButton);
        }

        document.getElementById("wd-amount")
            ?.addEventListener("input", calculateWithdraw);

        calculateWithdraw();
        renderWithdrawHistory();
    }

    // ==================================
    // ИСТОРИЯ ЗАЯВОК
    // ==================================

    function renderWithdrawHistory() {
        const history = document.getElementById("wd-history");

        if (!history) return;

        const requests = getRequests().slice().reverse();

        if (!requests.length) {
            history.innerHTML = `
                <p class="wd-muted" style="margin-top:12px;">
                    Заявок пока нет.
                </p>
            `;
            return;
        }

        history.innerHTML = requests.map(request => `
            <div class="wd-request">
                <b>${escapeText(request.skin)}</b>
                <br>
                Pattern: ${escapeText(request.pattern)}
                <br>
                Наклейки: ${escapeText(request.stickers)}
                <br>
                Сумма: <b>${formatGold(request.amount)} ♦</b>
                <br>
                Комиссия: ${formatGold(request.commission)} ♦
                <br>
                Цена выставления: ${formatGold(request.listingPrice)} ♦
                <br>
                Статус:
                <span class="wd-status">
                    ${escapeText(request.status)}
                </span>
                <br>
                <span style="color:#777;">
                    ${escapeText(request.date)}
                </span>
                <br>
                <span style="color:#777;">
                    ID: ${escapeText(request.id)}
                </span>
            </div>
        `).join("");
    }

    // ==================================
    // СОЗДАНИЕ ЗАЯВКИ
    // ==================================

    function createWithdrawRequest() {
        if (withdrawBusy) return;

        const amount = getAmount();

        const skinInput = document.getElementById("wd-skin");
        const patternInput = document.getElementById("wd-pattern");
        const stickersInput = document.getElementById("wd-stickers");
        const button = document.getElementById("wd-create-button");

        if (!skinInput || !patternInput || !stickersInput) return;

        const skin = skinInput.value.trim();
        const pattern = patternInput.value.trim();
        const stickers = stickersInput.value.trim();

        if (!Number.isFinite(amount) || amount < 1) {
            showAlert("Укажи сумму не меньше 1 монеты!");
            return;
        }

        if (amount > balance) {
            showAlert("Недостаточно монет на балансе!");
            return;
        }

        if (!skin || !pattern || !stickers) {
            showAlert("Заполни все поля!");
            return;
        }

        const listingPrice =
            Math.ceil((amount / (1 - WITHDRAW_FEE)) * 100) / 100;

        const commission =
            Math.round((listingPrice - amount) * 100) / 100;

        const oldBalance = balance;
        const newBalance = Math.round((oldBalance - amount) * 100) / 100;

        const oldRequestsRaw = localStorage.getItem(REQUESTS_KEY);
        const requests = getRequests();

        const request = {
            id: "BD-" + Date.now(),
            skin,
            pattern,
            stickers,
            amount,
            listingPrice,
            commission,
            status: "Создана (демо)",
            date: new Date().toLocaleString("ru-RU")
        };

        withdrawBusy = true;

        if (button) {
            button.disabled = true;
            button.textContent = "Создание...";
        }

        try {
            // Сначала сохраняем заявку.
            requests.push(request);

            localStorage.setItem(
                REQUESTS_KEY,
                JSON.stringify(requests)
            );

            // Затем сохраняем новый баланс.
            const saved = JSON.parse(
                localStorage.getItem(SAVE_KEY) || "{}"
            );

            const updatedSave = {
                ...saved,
                balance: newBalance,
                inventory,
                freeSandstoneOpens,
                lastFreeCaseTime
            };

            localStorage.setItem(
                SAVE_KEY,
                JSON.stringify(updatedSave)
            );

            // Только после успешного сохранения меняем баланс в приложении.
            balance = newBalance;

            updateBalanceUI();
            calculateWithdraw();
            renderWithdrawHistory();

            skinInput.value = "";
            patternInput.value = "";
            stickersInput.value = "";
            document.getElementById("wd-amount").value = "";

            calculateWithdraw();

            tg?.HapticFeedback?.notificationOccurred("success");

            showAlert(
                `Заявка ${request.id} создана! Списано ${formatGold(amount)} ♦.`
            );

        } catch (error) {
            console.error("Ошибка создания заявки:", error);

            // Если сохранение баланса не удалось,
            // возвращаем прежний список заявок.
            try {
                if (oldRequestsRaw === null) {
                    localStorage.removeItem(REQUESTS_KEY);
                } else {
                    localStorage.setItem(
                        REQUESTS_KEY,
                        oldRequestsRaw
                    );
                }
            } catch (restoreError) {
                console.error("Ошибка восстановления заявок:", restoreError);
            }

            balance = oldBalance;

            showAlert(
                "Не удалось сохранить заявку. Баланс не должен измениться. Попробуй ещё раз."
            );

        } finally {
            withdrawBusy = false;

            if (button) {
                button.disabled = false;
                button.textContent = "Создать заявку";
            }

            calculateWithdraw();
        }
    }

    // ==================================
    // ПЕРЕКЛЮЧЕНИЕ ВКЛАДКИ
    // ==================================

    const originalSwitchTab = window.switchTab;

    window.switchTab = function(tab) {
        if (tab !== "withdraw") {
            const withdrawScreen =
                document.getElementById("withdraw-screen");

            if (withdrawScreen) {
                withdrawScreen.style.display = "none";
                withdrawScreen.classList.remove("active");
            }

            return originalSwitchTab?.apply(this, arguments);
        }

        const screens = [
            "main-screen",
            "inventory-screen",
            "promo-screen",
            "upgrade-screen",
            "free-case-screen",
            "admin-screen"
        ];

        screens.forEach(id => {
            const element = document.getElementById(id);

            if (!element) return;

            element.style.display = "none";
            element.classList.remove("active");
        });

        document.querySelectorAll(".nav-item").forEach(el => {
            el.classList.remove("active");
        });

        const screen = document.getElementById("withdraw-screen");

        if (screen) {
            screen.style.display = "block";
            screen.classList.add("active");
        }

        document.getElementById("nav-withdraw")
            ?.classList.add("active");

        const nav = document.querySelector(".bottom-nav");

        if (nav) nav.style.display = "flex";

        calculateWithdraw();
        renderWithdrawHistory();
    };

    // ==================================
    // АДМИН-ПАНЕЛЬ
    // ==================================

    const originalOpenAdmin = window.openAdminPanel;

    if (typeof originalOpenAdmin === "function") {
        window.openAdminPanel = function() {
            const screen = document.getElementById("withdraw-screen");

            if (screen) {
                screen.style.display = "none";
                screen.classList.remove("active");
            }

            return originalOpenAdmin.apply(this, arguments);
        };
    }

    // ==================================
    // ЭКСПОРТ
    // ==================================

    window.createWithdrawRequest = createWithdrawRequest;
    window.renderWithdrawHistory = renderWithdrawHistory;

    // ==================================
    // ЗАПУСК
    // ==================================

    createScreen();

})();
