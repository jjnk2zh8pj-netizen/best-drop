// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран

// Функция при нажатии на "Открыть"
function openCase(caseName) {
    // Вибрация (если поддерживается телефоном)
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // Просто показываем окошко с названием кейса (пока нет сервера)
    tg.showAlert(`Вы пытаетесь открыть кейс: ${caseName}. \nСкоро здесь появится анимация рулетки!`);
}

// Делаем кнопки "Назад" в Telegram
tg.BackButton.show();
tg.BackButton.onClick(() => {
    tg.showAlert("Вы на главной странице");
});
