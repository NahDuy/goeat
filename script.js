const cardContainer = document.getElementById('cardContainer');
const handContainer = document.getElementById('handContainer');
const randomBtn = document.getElementById('randomBtn');
const pick5Btn = document.getElementById('pick5Btn');
const dishName = document.getElementById('dishName');
const dishBadge = document.getElementById('dishBadge');
const historyList = document.getElementById('historyList');
const filterBtns = document.querySelectorAll('.filter-btn');
const soundToggle = document.getElementById('soundToggle');

const shuffleSound = document.getElementById('shuffleSound');
const revealSound = document.getElementById('revealSound');
let isMuted = false;

let foodData = [];
let filteredData = [];
let isAnimating = false;

// --- SETUP ---
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
                    ⚠️ Reset Dữ Liệu Món Ăn
                </button>
            </div>
            <div id="settingsList">Loading...</div>
        </div>
    </div>
`;
document.body.appendChild(modal);

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

// --- DATA ---

async function fetchData(params = '') {
    try {
        randomBtn.textContent = "Loading...";
        randomBtn.disabled = true;
        pick5Btn.disabled = true;

        const url = params ? `/api/cards?${params}` : '/api/cards';
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        foodData = await response.json();

        applyFilter(document.querySelector('.filter-btn.active').dataset.category);

        randomBtn.textContent = "Bốc 1 Món";
        pick5Btn.textContent = "Bốc 5 Chọn 1";
        randomBtn.disabled = false;
        pick5Btn.disabled = false;
        renderSettings();
    } catch (error) {
        console.error(error);
        dishName.textContent = "Lỗi kết nối!";
    }
}

async function resetDatabase() {
    if (confirm('Reset toàn bộ dữ liệu về mặc định?')) {
        await fetchData('reset=true');
        alert('Đã reset!');
    }
}

// --- LOGIC ---

function applyFilter(category) {
    if (category === 'all') {
        filteredData = [...foodData];
    } else {
        filteredData = foodData.filter(item => item.category === category);
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.category);
        dishName.textContent = `Sẵn sàng: ${filteredData.length} món`;
        dishName.style.opacity = '1';
        dishBadge.style.opacity = '0';
        resetView();
    });
});

// SINGLE PICK
function startSinglePick() {
    if (filteredData.length === 0) return alert("Không có món nào!");
    isAnimating = true;

    cardContainer.style.display = 'block';
    handContainer.style.display = 'none';

    dishName.textContent = "Đang chọn...";
    dishName.style.opacity = '0.7';
    dishBadge.style.opacity = '0';
    randomBtn.disabled = true;
    pick5Btn.disabled = true;

    shuffleSound.currentTime = 0;
    shuffleSound.play();

    cardContainer.classList.remove('flipped');
    cardContainer.classList.add('shaking');

    setTimeout(() => {
        cardContainer.classList.remove('shaking');
        const winner = filteredData[Math.floor(Math.random() * filteredData.length)];
        updateCardVisual(document.querySelector('.card-container'), winner);

        revealSound.currentTime = 0;
        revealSound.play();
        cardContainer.classList.add('flipped');

        setTimeout(() => {
            showResult(winner.dish);
        }, 600);
    }, 1500);
}

// UPDATE CARD HTML
function updateCardVisual(container, card) {
    const cardBack = container.querySelector('.card-back');
    cardBack.setAttribute('data-color', card.color);

    // Determine Center Content (Text for JQK, Big Suit for others)
    let centerHtml = '';
    if (['J', 'Q', 'K'].includes(card.value)) {
        centerHtml = `<div class="card-face-text">${card.value}</div>`;
    } else {
        centerHtml = `<div class="card-face-suit">${card.symbol}</div>`;
    }

    // New Inner HTML Structure
    cardBack.innerHTML = `
        <div class="card-corner top-left">
            ${card.display}
            <span>${card.symbol}</span>
        </div>
        <div class="card-center">
            ${centerHtml}
        </div>
        <div class="card-corner bottom-right">
            ${card.display}
            <span>${card.symbol}</span>
        </div>
    `;

    // Clean style from previous sprite attempts
    cardBack.style.background = '';
    cardBack.style.backgroundSize = '';
}

// MYSTERY PICK 5 LOGIC
function startPick5() {
    if (filteredData.length < 5) return alert(`Cần ít nhất 5 món (Có ${filteredData.length})`);

    isAnimating = true;
    cardContainer.style.display = 'none';
    handContainer.style.display = 'flex';
    handContainer.innerHTML = '';

    dishName.textContent = "Chọn 1 lá bài bất kỳ...";
    dishName.style.opacity = '1';
    dishBadge.style.opacity = '0';
    randomBtn.disabled = true;
    pick5Btn.disabled = true;

    // Pick 5 uniques
    const pool = [...filteredData];
    const deal = [];
    for (let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        deal.push(pool[idx]);
        pool.splice(idx, 1);
    }

    shuffleSound.currentTime = 0;
    shuffleSound.play();

    deal.forEach((card, index) => {
        const mini = document.createElement('div');
        mini.className = 'mini-card';
        // HTML Structure
        mini.innerHTML = `
            <div class="card-inner">
                 <div class="card-front">
                    <div class="card-pattern"></div>
                </div>
                <div class="card-back"></div>
            </div>
        `;

        // Interaction
        mini.addEventListener('click', () => revealMysteryCard(mini, card));
        handContainer.appendChild(mini);
    });
}

function revealMysteryCard(selectedElement, cardData) {
    if (selectedElement.classList.contains('dimmed')) return;

    // Disable others
    const allCards = document.querySelectorAll('.mini-card');
    allCards.forEach(c => {
        if (c !== selectedElement) c.classList.add('dimmed');
    });

    selectedElement.classList.add('selected');
    shuffleSound.pause();
    revealSound.currentTime = 0;
    revealSound.play();

    updateCardVisual(selectedElement, cardData);

    setTimeout(() => {
        showResult(cardData.dish);
    }, 600);
}

function showResult(text) {
    dishName.textContent = text;
    dishName.style.opacity = '1';
    dishBadge.style.opacity = '1';
    dishBadge.textContent = "Chúc bạn ngon miệng!";
    addToHistory(text);
    createConfetti();

    isAnimating = false;
    randomBtn.disabled = false;
    pick5Btn.disabled = false;
}

// UTILS
function resetView() {
    if (!isAnimating) {
        cardContainer.classList.remove('flipped');
        cardContainer.style.display = 'block';
        handContainer.style.display = 'none';
    }
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
    hist.unshift(dish);
    if (hist.length > 8) hist.pop();
    sessionStorage.setItem('foodHistory', JSON.stringify(hist));
    updateHistoryUI(hist);
}

function updateHistoryUI(hist) {
    historyList.innerHTML = hist.map(h => `<div class="history-item">${h}</div>`).join('');
}

// EVENTS
randomBtn.addEventListener('click', () => { if (!isAnimating) startSinglePick(); });
pick5Btn.addEventListener('click', () => { if (!isAnimating) startPick5(); });
cardContainer.addEventListener('click', () => { if (!isAnimating) startSinglePick(); });
soundToggle.addEventListener('click', toggleSound);

settingsBtn.addEventListener('click', () => modal.style.display = 'flex');
modal.querySelector('.close-btn').addEventListener('click', () => modal.style.display = 'none');
document.getElementById('resetDbBtn').addEventListener('click', resetDatabase);
modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none' });

// SETTINGS LIST RENDER
function renderSettings() {
    const list = document.getElementById('settingsList');
    list.innerHTML = '';
    foodData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <span class="card-label">${item.display}${item.symbol}</span>
            <input type="text" value="${item.dish}">
        `;
        row.querySelector('input').addEventListener('change', async (e) => {
            await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item._id, dish: e.target.value })
            });
            item.dish = e.target.value;
        });
        list.appendChild(row);
    });
}

// Init
init();
