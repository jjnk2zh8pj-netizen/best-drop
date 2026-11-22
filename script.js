const SAVE_KEY = 'bestdrop_save';

let savedData = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};

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
}
