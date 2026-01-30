const cardContainer = document.getElementById('cardContainer');
const randomBtn = document.getElementById('randomBtn');
const dishName = document.getElementById('dishName');
const dishBadge = document.getElementById('dishBadge');
const cardInner = document.querySelector('.card-inner');
const cardBack = document.querySelector('.card-back');
const suitTop = document.querySelector('.suit-top');
const suitBottom = document.querySelector('.suit-bottom');
const suitCenter = document.querySelector('.suit-center');
const valueEl = document.querySelector('.value');

// State
let foodData = [];
let isAnimating = false;

// UI Elements for Settings
const settingsBtn = document.createElement('button');
settingsBtn.innerHTML = '⚙️';
settingsBtn.className = 'settings-btn';
document.body.appendChild(settingsBtn);

const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h2>Chỉnh Sửa Món Ăn</h2>
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body" id="settingsList">
            <!-- Items injected here -->
            <div style="text-align: center; padding: 20px;">Đang tải dữ liệu...</div>
        </div>
    </div>
`;
document.body.appendChild(modal);

// Fetch Data from API
async function fetchData() {
    try {
        randomBtn.textContent = "Đang tải dữ liệu...";
        randomBtn.disabled = true;

        const response = await fetch('/api/cards');
        if (!response.ok) throw new Error('API Error');

        foodData = await response.json();

        randomBtn.textContent = "Bốc Món Ngẫu Nhiên";
        randomBtn.disabled = false;
        renderSettings();
    } catch (error) {
        console.error("Lỗi:", error);
        dishName.textContent = "Lỗi kết nối Server!";
        dishName.style.color = "red";
    }
}

// Update Data to API
async function updateDish(id, newName) {
    try {
        const response = await fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, dish: newName })
        });

        if (response.ok) {
            // Update local state
            const index = foodData.findIndex(f => f._id === id);
            if (index !== -1) foodData[index].dish = newName;
        }
    } catch (error) {
        console.error("Save Error:", error);
        alert("Lỗi khi lưu món ăn!");
    }
}

// Render Settings List
function renderSettings() {
    const list = document.getElementById('settingsList');
    list.innerHTML = '';

    foodData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <span class="card-label">${item.display} ${item.symbol}</span>
            <input type="text" value="${item.dish}" data-id="${item._id}">
        `;

        const input = row.querySelector('input');
        input.addEventListener('change', (e) => {
            updateDish(item._id, e.target.value);
            // Flash success
            input.style.borderColor = "#43e97b";
            setTimeout(() => input.style.borderColor = "#ddd", 1000);
        });

        list.appendChild(row);
    });
}

// Toggle Modal
settingsBtn.addEventListener('click', () => modal.style.display = 'flex');
modal.querySelector('.close-btn').addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// --- Existing Game Logic ---

function updateCard(card) {
    cardBack.setAttribute('data-color', card.color);

    const content = card.display;
    valueEl.textContent = content;

    const symbolHtml = `<div>${card.symbol}</div>`;
    suitTop.innerHTML = `${content}${symbolHtml}`;
    suitBottom.innerHTML = `${content}${symbolHtml}`;
    suitCenter.innerHTML = card.symbol;
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}

function startReviewLogic() {
    isAnimating = true;
    randomBtn.disabled = true;
    randomBtn.textContent = "Đang tráo bài...";

    dishName.textContent = "Đang chọn...";
    dishName.style.opacity = '0.7';
    dishBadge.style.opacity = '0';

    if (cardContainer.classList.contains('flipped')) {
        cardContainer.classList.remove('flipped');
        setTimeout(() => startShuffle(), 600);
    } else {
        startShuffle();
    }
}

function startShuffle() {
    cardContainer.classList.add('shaking');
    setTimeout(finishShuffle, 2000);
}

function finishShuffle() {
    cardContainer.classList.remove('shaking');

    // Pick winner
    const randomIndex = Math.floor(Math.random() * foodData.length);
    const winner = foodData[randomIndex];

    updateCard(winner);
    cardContainer.classList.add('flipped');

    setTimeout(() => {
        dishName.textContent = winner.dish;
        dishName.style.opacity = '1';
        dishBadge.style.opacity = '1';
        dishBadge.textContent = "Món Ngon Cho Bạn";

        createConfetti();

        isAnimating = false;
        randomBtn.disabled = false;
        randomBtn.textContent = "Bốc Món Ngẫu Nhiên";
    }, 600);
}

randomBtn.addEventListener('click', () => {
    if (!isAnimating && foodData.length > 0) startReviewLogic();
});

cardContainer.addEventListener('click', () => {
    if (!isAnimating && foodData.length > 0) startReviewLogic();
});

document.querySelector('.card-front span').textContent = "?";

// Initialize
fetchData();
