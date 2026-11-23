
(() => {
    const PROMO_CODE = "JADESTONE";
    const REDEEMED_KEY = "bestdrop_jadestone_redeemed";

    function alertUser(message) {
        if (typeof showAlert === "function") {
            showAlert(message);
        } else {
            alert(message);
        }
    }

    function activateJadeStone() {
        const input = document.getElementById("promo-input");
        const code = String(input?.value || "").trim().toUpperCase();

        if (code !== PROMO_CODE) {
            alertUser("Промокод не найден!");
            return;
        }

        const userId = String(
            window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
            "bestdrop_local"
        );

        const redeemedKey = REDEEMED_KEY + "_" + userId;

        if (localStorage.getItem(redeemedKey) === "true") {
            alertUser("Ты уже активировал этот промокод!");
            return;
        }

        if (!Array.isArray(window.inventory) ||
            !Array.isArray(window.casesData)) {
            alertUser("Не удалось загрузить инвентарь.");
            return;
        }

        const allItems = Object.values(window.casesData).flat();

        const skin = allItems.find(item =>
            String(item.name || "").toLowerCase() ===
            "karambit jade stone"
        );

        if (!skin) {
            alertUser(
                "Karambit Jade Stone не найден в каталоге. Проверь название скина."
            );
            return;
        }

        window.inventory.push({...skin});

        localStorage.setItem(redeemedKey, "true");

        if (typeof window.saveProgress === "function") {
            window.saveProgress();
        }

        if (typeof window.updateInventoryUI === "function") {
            window.updateInventoryUI();
        }

        if (input) input.value = "";

        if (typeof window.tg !== "undefined" &&
            window.tg?.HapticFeedback) {
            window.tg.HapticFeedback.notificationOccurred("success");
        }

        alertUser("Поздравляем! Ты получил Karambit Jade Stone!");
    }

    window.activatePromo = activateJadeStone;
})();
