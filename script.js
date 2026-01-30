const cardContainer = document.getElementById('cardContainer');
const handContainer = document.getElementById('handContainer');
const randomBtn = document.getElementById('randomBtn');
const pick5Btn = document.getElementById('pick5Btn');
const dishName = document.getElementById('dishName');
const dishBadge = document.getElementById('dishBadge');
const historyList = document.getElementById('historyList');
const filterBtns = document.querySelectorAll('.filter-btn');
const soundToggle = document.getElementById('soundToggle');

// Sounds
const shuffleSound = document.getElementById('shuffleSound');
const revealSound = document.getElementById('revealSound');
let isMuted = false;

// State
let foodData = []; // All data
let filteredData = []; // Currently filtered data
let isAnimating = false;
let currentMode = 'single'; // 'single' or 'five'

// --- SETUP & INIT ---

// Settings Modal
const settingsBtn = document.createElement('button');
settingsBtn.innerHTML = '⚙️';
settingsBtn.className = 'icon-btn settings-btn';
document.body.appendChild(settingsBtn);

const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h2>Cài Đặt / Dữ Liệu</h2>
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
             <div style="margin-bottom: 20px; text-align: center;">
                <button id="resetDbBtn" class="secondary-btn" style="background: #e53e3e; font-size: 0.9rem;">
                    ⚠️ Reset Dữ Liệu Món Ăn (Gốc)
                </button>
            </div>
            <div id="settingsList">Loading...</div>
        </div>
    </div>
`;
document.body.appendChild(modal);

// Initialize
async function init() {
    loadSounds();
    await fetchData();
    loadHistory();
}

function loadSounds() {
    shuffleSound.volume = 0.5;
    revealSound.volume = 0.5;
}

function toggleSound() {
    isMuted = !isMuted;
    shuffleSound.muted = isMuted;
    revealSound.muted = isMuted;
    soundToggle.textContent = isMuted ? '🔇' : '🔊';
    soundToggle.classList.toggle('muted', isMuted);
}

// --- DATA LOGIC ---

async function fetchData(params = '') {
    try {
        randomBtn.textContent = "Loading...";
        randomBtn.disabled = true;
        pick5Btn.disabled = true;

        // Check if we need to reset/seed via param or just fetch
        const url = params ? `/api/cards?${params}` : '/api/cards';

        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        foodData = await response.json();

        // Apply current filter locally
        applyFilter(document.querySelector('.filter-btn.active').dataset.category);

        randomBtn.textContent = "Bốc 1 Món";
        pick5Btn.textContent = "Bốc 5 Món";
        randomBtn.disabled = false;
        pick5Btn.disabled = false;

        renderSettings();

    } catch (error) {
        console.error(error);
        dishName.textContent = "Lỗi kết nối!";
    }
}

async function resetDatabase() {
    if (confirm('Bạn có chắc muốn Reset toàn bộ dữ liệu về mặc định? Hành động này không thể hoàn tác!')) {
        await fetchData('reset=true');
        alert('Đã reset dữ liệu thành công!');
    }
}

// --- FILTER LOGIC ---

function applyFilter(category) {
    if (category === 'all') {
        filteredData = [...foodData];
    } else {
        filteredData = foodData.filter(item => item.category === category);
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // UI
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Logic
        applyFilter(btn.dataset.category);

        // Feedback
        dishName.textContent = `Đã lọc: ${filteredData.length} món`;
        dishName.style.opacity = '1';
        dishBadge.style.opacity = '0';

        // Reset view
        resetView();
    });
});

// --- SINGLE PICK LOGIC ---

function updateSingleCard(card) {
    const cardBack = document.querySelector('.card-back');
    const valueEl = document.querySelector('.value');
    const tops = document.querySelectorAll('.suit-top');
    const bottoms = document.querySelectorAll('.suit-bottom');
    const centers = document.querySelectorAll('.suit-center');

    cardBack.setAttribute('data-color', card.color);
    valueEl.textContent = card.display;

    const symbolHtml = `<div>${card.symbol}</div>`;
    tops.forEach(el => el.innerHTML = `${card.display}${symbolHtml}`);
    bottoms.forEach(el => el.innerHTML = `${card.display}${symbolHtml}`);
    centers.forEach(el => el.innerHTML = card.symbol);
}

function startSinglePick() {
    if (filteredData.length === 0) {
        alert("Không có món nào trong danh mục này!");
        return;
    }

    isAnimating = true;
    currentMode = 'single';

    // UI Setup
    cardContainer.style.display = 'block';
    handContainer.style.display = 'none';

    dishName.textContent = "Đang chọn...";
    dishName.style.opacity = '0.7';
    dishBadge.style.opacity = '0';

    randomBtn.disabled = true;
    pick5Btn.disabled = true;

    // Sound
    shuffleSound.currentTime = 0;
    shuffleSound.play();

    // Visuals
    cardContainer.classList.remove('flipped');
    cardContainer.classList.add('shaking');

    setTimeout(() => {
        finishSinglePick();
    }, 2000);
}

function finishSinglePick() {
    cardContainer.classList.remove('shaking');
    shuffleSound.pause();
    revealSound.currentTime = 0;
    revealSound.play();

    const winner = filteredData[Math.floor(Math.random() * filteredData.length)];
    updateSingleCard(winner);

    cardContainer.classList.add('flipped');

    setTimeout(() => {
        showResultText(winner.dish);
        addToHistory(winner.dish);
        createConfetti();
        isAnimating = false;
        randomBtn.disabled = false;
        pick5Btn.disabled = false;
    }, 600);
}

// --- PICK 5 LOGIC ---

function startPick5() {
    if (filteredData.length < 5) {
        alert(`Không đủ 5 món trong danh mục này (Chỉ còn ${filteredData.length} món)`);
        return;
    }

    isAnimating = true;
    currentMode = 'five';

    // UI Setup
    cardContainer.style.display = 'none';
    handContainer.style.display = 'grid';
    handContainer.innerHTML = ''; // Clear old

    dishName.textContent = "Đang chọn thực đơn...";
    dishName.style.opacity = '0.7';
    dishBadge.style.opacity = '0';

    randomBtn.disabled = true;
    pick5Btn.disabled = true;

    // Pick 5 uniques
    const pool = [...filteredData];
    const winners = [];
    for (let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        winners.push(pool[idx]);
        pool.splice(idx, 1); // remove to ensure unique
    }

    // Create cards (facedown initially)
    winners.forEach((card, index) => {
        const mini = document.createElement('div');
        mini.className = 'mini-card';
        mini.style.setProperty('--delay', `${index * 0.3}s`); // Staggered delay

        mini.innerHTML = `
            <div class="card-inner">
                 <div class="card-front" style="border-width: 2px;">
                    <span>?</span>
                </div>
                <div class="card-back" data-color="${card.color}">
                    <div class="suit-top">${card.display}</div>
                    <div class="suit-center">${card.symbol}</div>
                </div>
            </div>
            <div class="mini-card-text">${card.dish}</div>
        `;
        handContainer.appendChild(mini);
    });

    // Animate Reveal
    shuffleSound.currentTime = 0;
    shuffleSound.play();

    // Wait a bit, then flip one by one
    setTimeout(() => {
        shuffleSound.pause();
        const cards = document.querySelectorAll('.mini-card');

        cards.forEach((c, i) => {
            setTimeout(() => {
                revealSound.currentTime = 0;
                revealSound.play();
                c.classList.add('revealed');
            }, i * 400); // 400ms delay between each
        });

        // Finish
        setTimeout(() => {
            dishName.textContent = "Thực đơn của bạn!";
            dishName.style.opacity = '1';
            createConfetti();
            isAnimating = false;
            randomBtn.disabled = false;
            pick5Btn.disabled = false;
        }, 5 * 400 + 500);

    }, 1000);
}

// --- UTILS ---

function resetView() {
    if (!isAnimating) {
        cardContainer.classList.remove('flipped');
        cardContainer.style.display = 'block';
        handContainer.style.display = 'none';
        dishName.textContent = 'Hôm Nay Ăn Gì?';
        dishBadge.style.opacity = '0';
    }
}

function showResultText(text) {
    dishName.textContent = text;
    dishName.style.opacity = '1';
    dishBadge.style.opacity = '1';
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const d = document.createElement('div');
        d.className = 'confetti';
        d.style.left = Math.random() * 100 + 'vw';
        d.style.background = `hsl(${Math.random() * 360},100%,50%)`;
        d.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 4000);
    }
}

function loadHistory() {
    const hist = JSON.parse(sessionStorage.getItem('foodHistory') || '[]');
    updateHistoryUI(hist);
}

function addToHistory(dish) {
    let hist = JSON.parse(sessionStorage.getItem('foodHistory') || '[]');
    hist.unshift(dish); // Add to start
    if (hist.length > 10) hist.pop(); // Keep 10
    sessionStorage.setItem('foodHistory', JSON.stringify(hist));
    updateHistoryUI(hist);
}

function updateHistoryUI(hist) {
    historyList.innerHTML = hist.map(h => `<div class="history-item">${h}</div>`).join('');
}

// --- SETTINGS MGR ---

async function updateDish(id, newName) {
    try {
        await fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, dish: newName })
        });
        // Update local
        const idx = foodData.findIndex(x => x._id === id);
        if (idx !== -1) foodData[idx].dish = newName;
        applyFilter(document.querySelector('.filter-btn.active').dataset.category);
    } catch (e) { console.error(e); }
}

function renderSettings() {
    const list = document.getElementById('settingsList');
    list.innerHTML = '';

    // Group by Category to make it cleaner? Or just list all.
    // Let's list all sorted by Display (A -> K)

    foodData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <span class="card-label">${item.display}${item.symbol}</span>
            <input type="text" value="${item.dish}" data-id="${item._id}">
        `;
        row.querySelector('input').addEventListener('change', (e) => updateDish(item._id, e.target.value));
        list.appendChild(row);
    });
}


// --- EVENTS ---

randomBtn.addEventListener('click', () => { if (!isAnimating) startSinglePick(); });
pick5Btn.addEventListener('click', () => { if (!isAnimating) startPick5(); });
cardContainer.addEventListener('click', () => { if (!isAnimating) startSinglePick(); });
soundToggle.addEventListener('click', toggleSound);

settingsBtn.addEventListener('click', () => modal.style.display = 'flex');
modal.querySelector('.close-btn').addEventListener('click', () => modal.style.display = 'none');
document.getElementById('resetDbBtn').addEventListener('click', resetDatabase);
modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none' });

// Start
init();
