const tg = window.Telegram.WebApp;
tg.expand(); 

let user = { id: "guest", name: "Гость", avatar: "https://i.pravatar.cc/100?img=11" };
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const tgUser = tg.initDataUnsafe.user;
    user.id = tgUser.id.toString();
    user.name = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
    if (tgUser.photo_url) user.avatar = tgUser.photo_url;
}
document.getElementById('user-name').innerText = user.name;
document.getElementById('user-avatar').src = user.avatar;

let isPromoUsedGlobally = localStorage.getItem('bestdrop_promo_PROMO_used') === 'true';
let savedData = localStorage.getItem('bestdrop_user_' + user.id);
let balance = 100; 
let inventory = [];
let freeSandstoneOpens = 0;

if (savedData) {
    const parsed = JSON.parse(savedData);
    balance = parsed.balance !== undefined ? parsed.balance : 100;
    inventory = parsed.inventory || [];
    freeSandstoneOpens = parsed.freeSandstoneOpens || 0;
}

function saveProgress() {
    const data = { balance: balance, inventory: inventory, freeSandstoneOpens: freeSandstoneOpens };
    localStorage.setItem('bestdrop_user_' + user.id, JSON.stringify(data));
}

function updateBalanceUI() {
    document.getElementById('balance-display').innerText = balance;
}
updateBalanceUI();

const casesData = {
    "Sandstone": [
        { name: "P350", rarity: "Common", chance: 50, img: "https://cdn.cs.money/730/skins/weapon_p250_sand_dune_light.png", price: 12 },
        { name: "MP7", rarity: "Rare", chance: 40, img: "https://cdn.cs.money/730/skins/weapon_mp7_impire_light.png", price: 49 },
        { name: "AKR", rarity: "Legendary", chance: 9, img: "https://cdn.cs.money/730/skins/weapon_ak47_neon_rider_light.png", price: 149 },
        { name: "Агент", rarity: "Arcane", chance: 1, img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png", price: 1499 }
    ],
    "Breeze": [
        { name: "Paladin", rarity: "Arcane", chance: 0.1, img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png", price: 12500 },
        { name: "Medal", rarity: "Common", chance: 99.9, img: "https://cdn.cs.money/730/skins/weapon_glock_water_elemental_light.png", price: 19 }
    ],
    "Dune": [
        { name: "M4", rarity: "Rare", chance: 40, img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png", price: 35 },
        { name: "SPAS", rarity: "Rare", chance: 30, img: "https://cdn.cs.money/730/skins/weapon_sawedoff_the_bank_light.png", price: 60 },
        { name: "M40", rarity: "Epic", chance: 15, img: "https://cdn.cs.money/730/skins/weapon_awp_asiimov_light.png", price: 180 },
        { name: "Anubis", rarity: "Legendary", chance: 9, img: "https://cdn.cs.money/730/skins/weapon_m4a1_silence_hyper_beast_light.png", price: 750 },
        { name: "Jade AK", rarity: "Arcane", chance: 1.5, img: "https://cdn.cs.money/730/skins/weapon_ak47_neon_rider_light.png", price: 999 },
        { name: "Karambit", rarity: "Arcane", chance: 0.01, img: "https://cdn.cs.money/730/skins/weapon_knife_karambit_doppler_phase2_light.png", price: 28000 }
    ]
};

function getRandomDrop(caseName) {
    const items = casesData[caseName];
    let totalChance = items.reduce((sum, item) => sum + item.chance, 0);
    let randomNum = Math.random() * totalChance;
    let currentChanceSum = 0;
    for (let item of items) {
        currentChanceSum += item.chance;
        if (randomNum <= currentChanceSum) return item;
    }
    return items[0];
}

function openCase(caseName, casePrice) {
    let isFree = false;
    if (caseName === 'Sandstone' && freeSandstoneOpens > 0) {
        isFree = true;
        freeSandstoneOpens--;
        saveProgress();
        tg.showAlert(`Использовано бесплатное открытие! Осталось: ${freeSandstoneOpens}`);
    } else if (balance < casePrice) {
        tg.showAlert("Недостаточно монет! Продай скины из инвентаря.");
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        return;
    }

    if (!isFree) {
        balance -= casePrice;
        updateBalanceUI();
        saveProgress();
    }

    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    let currentDrop = getRandomDrop(caseName);
    
    const modal = document.getElementById('roulette-modal');
    const strip = document.getElementById('roulette-strip');
    const closeBtn = document.getElementById('close-roulette');
    
    modal.classList.remove('hidden');
    closeBtn.classList.add('hidden');
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0)';
    
    let stripHTML = '';
    const pool = casesData[caseName];
    
    for (let i = 0; i < 50; i++) {
        const randItem = pool[Math.floor(Math.random() * pool.length)];
        stripHTML += `<div class="roulette-item"><img src="${randItem.img}"><span>${randItem.price} ♦</span></div>`;
    }
    
    stripHTML += `<div class="roulette-item"><img src="${currentDrop.img}"><span style="color:#ff0000; font-weight:bold;">${currentDrop.price} ♦</span></div>`;
    
    strip.innerHTML = stripHTML;

    setTimeout(() => {
        const containerWidth = strip.parentElement.offsetWidth;
        const itemWidth = 100; 
        const scrollDistance = (50 * itemWidth) + (containerWidth / 2) - (itemWidth / 2);
        
        strip.style.transition = 'transform 5s cubic-bezier(0.15, 0.9, 0.2, 1)';
        strip.style.transform = `translateX(-${scrollDistance}px)`;
        
        setTimeout(() => {
            closeBtn.classList.remove('hidden');
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        }, 5100);
    }, 100);
    
    window.currentDrop = currentDrop;
}

function closeRoulette() {
    document.getElementById('roulette-modal').classList.add('hidden');
    if (window.currentDrop) {
        inventory.push(window.currentDrop);
        window.currentDrop = null;
        saveProgress(); 
        updateInventoryUI();
    }
}

function activatePromo() {
    const input = document.getElementById('promo-input').value.trim().toUpperCase();
    
    if (input === 'PROMO') {
        if (isPromoUsedGlobally) {
            tg.showAlert("Этот промокод уже был активирован!");
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
            return;
        }
        
        freeSandstoneOpens += 10;
        saveProgress();
        
        localStorage.setItem('bestdrop_promo_PROMO_used', 'true');
        isPromoUsedGlobally = true;
        
        tg.showAlert("Промокод активирован! Вы получили 10 бесплатных открытий Sandstone.");
        document.getElementById('promo-input').value = ''; 
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } else {
        tg.showAlert("Неверный промокод!");
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
}

function switchTab(tab) {
    const mainScreen = document.getElementById('main-screen');
    const invScreen = document.getElementById('inventory-screen');
    const promoScreen = document.getElementById('promo-screen');
    
    const navMain = document.getElementById('nav-main');
    const navInv = document.getElementById('nav-inv');
    const navPromo = document.getElementById('nav-promo');

    mainScreen.style.display = 'none';
    invScreen.classList.remove('active');
    promoScreen.classList.remove('active');
    navMain.classList.remove('active');
    navInv.classList.remove('active');
    navPromo.classList.remove('active');

    if (tab === 'main') {
        mainScreen.style.display = 'block';
        navMain.classList.add('active');
    } else if (tab === 'inventory') {
        invScreen.classList.add('active');
        navInv.classList.add('active');
        updateInventoryUI();
    } else if (tab === 'promo') {
        promoScreen.classList.add('active');
        navPromo.classList.add('active');
    }
}

function updateInventoryUI() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';
    if (inventory.length === 0) {
        grid.innerHTML = '<p style="color: #666; grid-column: span 2; text-align: center;">Тут пока пусто...</p>';
        return;
    }
    
    inventory.forEach((item, index) => {
        grid.innerHTML += `
            <div class="inv-item">
                <img src="${item.img}">
                <p>${item.name}</p>
                <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Цена: ♦ ${item.price}</div>
                <button class="btn-sell" onclick="sellItem(${index})">Продать за ${item.price} ♦</button>
            </div>
        `;
    });
}

function sellItem(index) {
    const item = inventory[index];
    balance += item.price;
    inventory.splice(index, 1);
    
    updateBalanceUI();
    updateInventoryUI();
    saveProgress(); 
    
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
}

function showAlert(text) {
    tg.showAlert(text);
}

updateInventoryUI();
