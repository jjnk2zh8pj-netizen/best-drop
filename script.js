let user = {
    id: "bestdrop_local",
    name: "Игрок",
    avatar: "https://i.pravatar.cc/100?img=11"
};

document.getElementById('user-name').innerText = user.name;
document.getElementById('user-avatar').src = user.avatar;

let isPromoUsedGlobally =
    localStorage.getItem('bestdrop_promo_PROMO_used') === 'true';

const SAVE_KEY = 'bestdrop_save';
let savedData = {};

try {
    savedData = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
} catch (error) {
    savedData = {};
}

let balance = savedData.balance ?? 100;
let inventory = savedData.inventory ?? [];
let freeSandstoneOpens = savedData.freeSandstoneOpens ?? 0;
let lastFreeCaseTime = savedData.lastFreeCaseTime ?? 0;

function saveProgress() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
        balance,
        inventory,
        freeSandstoneOpens,
        lastFreeCaseTime
    }));
}ф
