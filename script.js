// --- CONFIG ---
const API_BASE = '/api'; // Vercel API

// --- STATE ---
let foodData = [];
let filteredData = [];
let history = [];
let isAnimating = false;
let currentUser = null; // { token, username, userId }
let currentGroup = null; // { code, members, status, ... }
let groupPollInterval = null;

// --- SETUP ---
const settingsBtn = document.querySelector('.settings-btn');
const soundBtn = document.querySelector('.sound-btn');
const loginBtnTrigger = document.getElementById('loginBtnTrigger');
const authModal = document.getElementById('authModal');
const closeAuthBtn = document.querySelector('.close-auth');

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    // Load Token
    const storedUser = localStorage.getItem('user_auth');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateAuthUI();
        fetchMyGroups(); // Load groups if already logged in
    }

    await fetchData();
    initHistory();
    setupEventListeners();
    setupAuthListeners();
    setupGroupListeners();
});
// ... 
const toggleGroupBtn = document.getElementById('toggleGroupBtn'); // Assuming this is defined elsewhere, adding for context
const soloModes = document.getElementById('soloModes'); // Assuming this is defined elsewhere, adding for context
const groupDashboard = document.getElementById('groupDashboard'); // Assuming this is defined elsewhere, adding for context

toggleGroupBtn.addEventListener('click', () => {
    if (!currentUser) return showToast('Vui lòng đăng nhập để dùng tính năng này!', 'error');
    if (soloModes.style.display !== 'none') {
        soloModes.style.display = 'none';
        groupDashboard.style.display = 'block';
        toggleGroupBtn.textContent = 'Trở về Solo';
        fetchMyGroups(); // Refresh list when entering mode
    } else {
        soloModes.style.display = 'block';
        groupDashboard.style.display = 'none';
        toggleGroupBtn.textContent = '👥 Ăn Nhóm';
        stopPolling();
    }
});

function updateAuthUI() {
    if (currentUser) {
        document.getElementById('loginBtnTrigger').style.display = 'none';
        document.getElementById('userDisplay').style.display = 'flex';
        document.getElementById('userNameDisplay').textContent = currentUser.username;
    } else {
        document.getElementById('loginBtnTrigger').style.display = 'block';
        document.getElementById('userDisplay').style.display = 'none';
    }
}

// --- AUTH LOGIC ---
// --- TOAST HELPER ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return alert(message); // Fallback

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- AUTH LOGIC ---
let authMode = 'login';

function setupAuthListeners() {
    loginBtnTrigger.addEventListener('click', () => authModal.style.display = 'flex');
    closeAuthBtn.addEventListener('click', () => authModal.style.display = 'none');

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user_auth');
        currentUser = null;
        updateAuthUI();
        showToast('Đã đăng xuất', 'info');
    });

    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const doAuthBtn = document.getElementById('doAuthBtn');

    if (tabLogin && tabRegister && doAuthBtn) {
        tabLogin.addEventListener('click', () => {
            authMode = 'login';
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            doAuthBtn.textContent = 'Đăng Nhập';
        });

        tabRegister.addEventListener('click', () => {
            authMode = 'register';
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            doAuthBtn.textContent = 'Đăng Ký (Tạo mới)';
        });

        doAuthBtn.addEventListener('click', () => handleAuth(authMode));
    }
}

async function handleAuth(action) {
    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;

    if (!username || !password) return showToast('Vui lòng nhập đủ thông tin!', 'error');

    try {
        const res = await fetch(`${API_BASE}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, username, password })
        });
        const data = await res.json();

        if (res.ok) {
            currentUser = data;
            localStorage.setItem('user_auth', JSON.stringify(currentUser));
            updateAuthUI();
            authModal.style.display = 'none';
            showToast(`Xin chào Trainer, ${username}!`, 'success');
            fetchMyGroups();
            fetchData();
        } else {
            showToast(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Lỗi kết nối Server', 'error');
    }
}

async function fetchMyGroups() {
    if (!currentUser) return;
    const container = document.getElementById('myGroupsList');
    if (container) container.innerHTML = '<p style="color:#aaa; font-size:0.9rem;">⏳ Đang tải danh sách...</p>';

    try {
        const res = await fetch(`${API_BASE}/groups?userId=${currentUser.userId}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            const groups = await res.json();
            renderMyGroups(groups);
        } else {
            console.error('Fetch failed', res.status);
            if (container) container.innerHTML = '<p style="color:red;">Lỗi tải danh sách :(</p>';
        }
    } catch (e) {
        console.error(e);
        if (container) container.innerHTML = '<p style="color:red;">Lỗi kết nối server :(</p>';
    }
}

function renderMyGroups(groups) {
    const container = document.getElementById('myGroupsList');
    if (!container) return;

    if (!groups || groups.length === 0) {
        container.innerHTML = '<p style="font-size:0.9rem; color:#b2bec3;">Chưa tham gia nhóm nào</p>';
        return;
    }

    container.innerHTML = groups.map(g => {
        const isWaiting = g.status === 'waiting';
        const groupName = g.name || `Phòng ${g.code}`;
        return `
        <div class="my-group-item" onclick="rejoinGroup('${g.code}')">
            <div>
                <div style="font-weight:bold; color:var(--pk-dark); font-size:1rem;">${groupName}</div>
                <div class="my-group-code" style="font-size:0.8rem; color:var(--pk-blue);">CODE: ${g.code}</div>
                <div style="font-size:0.75rem; color:#636e72;">${g.members.length} thành viên</div>
            </div>
            <div>
                ${g.result ? `<span>🏆 ${g.result}</span>` : ''}
                <span class="my-group-status ${g.status}">${isWaiting ? 'Đang chờ' : 'Đã xong'}</span>
            </div>
        </div>
        `;
    }).join('');
}

function rejoinGroup(code) {
    document.getElementById('joinCodeInput').value = code;
    joinGroup();
}

// --- GROUP LOGIC ---
function setupGroupListeners() {
    const toggleGroupBtn = document.getElementById('toggleGroupBtn');
    const groupDashboard = document.getElementById('groupDashboard');
    const soloModes = document.getElementById('soloModes');

    // toggleGroupBtn listener moved to top level for better control

    // Search Listener
    document.getElementById('searchGroupInput')?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.my-group-item');
        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });

    document.getElementById('createGroupBtn').addEventListener('click', createGroup);
    document.getElementById('joinGroupBtn').addEventListener('click', joinGroup);
    document.getElementById('submitVoteBtn').addEventListener('click', submitVote);
    document.getElementById('rollGroupBtn').addEventListener('click', rollGroupResult);
}

async function createGroup() {
    const name = prompt('Đặt tên cho phòng của bạn (không bắt buộc):', 'Hội Ăn Trưa');
    try {
        const res = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ action: 'create', name: name })
        });
        const data = await res.json();
        if (res.ok) {
            currentGroup = data;
            renderGroupRoom();
            startPolling();
        } else showToast(data.message, 'error');
    } catch (e) { console.error(e); showToast('Error creating group', 'error'); }
}

async function joinGroup() {
    const code = document.getElementById('joinCodeInput').value.toUpperCase();
    if (!code) return showToast('Nhập mã phòng!', 'error');
    try {
        const res = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ action: 'join', groupCode: code })
        });
        const data = await res.json();
        if (res.ok) {
            currentGroup = data;
            renderGroupRoom();
            startPolling();
        } else showToast(data.message, 'error');
    } catch (e) { console.error(e); showToast('Error joining group', 'error'); }
}

async function submitVote() {
    const voteInput = document.getElementById('dishVoteInput');
    const vote = voteInput.value.trim();
    if (!vote) return showToast('Nhập món bạn muốn!', 'info');

    // Support comma-separated
    const dishes = vote.split(',').map(d => d.trim()).filter(d => d);

    try {
        const res = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ action: 'submit', groupCode: currentGroup.code, dishes: dishes })
        });
        if (res.ok) {
            showToast(`Đã thêm ${dishes.length} món!`, 'success');
            voteInput.value = ''; // Clear input for more
            voteInput.focus();
        }
    } catch (e) { console.error(e); }
}

async function rollGroupResult() {
    if (!confirm('Chốt đơn và Random ngay? Chỉ Host mới làm được nha!')) return;
    try {
        // Step 1: Start Animation (Everyone sees "Rolling...")
        await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ action: 'startRoll', groupCode: currentGroup.code })
        });

        // Wait for drama...
        setTimeout(async () => {
            // Step 2: Finalize Result
            await fetch(`${API_BASE}/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ action: 'finishRoll', groupCode: currentGroup.code })
            });
        }, 3000); // 3 seconds suspense

    } catch (e) { console.error(e); }
}

function startPolling() {
    if (groupPollInterval) clearInterval(groupPollInterval);
    groupPollInterval = setInterval(async () => {
        if (!currentGroup) return;
        try {
            const headers = {};
            if (currentUser) headers['Authorization'] = `Bearer ${currentUser.token}`;

            const res = await fetch(`${API_BASE}/groups?code=${currentGroup.code}`, { headers });
            if (res.ok) {
                currentGroup = await res.json();
                renderGroupRoom();
            }
        } catch (e) { console.error(e); }
    }, 2000); // Poll every 2s
}

function stopPolling() {
    if (groupPollInterval) clearInterval(groupPollInterval);
}

function renderGroupRoom() {
    document.getElementById('groupLobby').style.display = 'none';
    document.getElementById('groupRoom').style.display = 'block';

    document.getElementById('roomCodeDisplay').textContent = currentGroup.code;
    const memberList = document.getElementById('memberList');

    // Use grid layout
    memberList.className = 'member-grid';
    memberList.innerHTML = currentGroup.members.map(m => {
        const isHost = m.userId === currentGroup.host;
        const isReady = m.dishes.length > 0;

        let avatar = '🧑‍🍳';
        if (isHost) avatar = '👑';
        else if (isReady) avatar = '😋';

        return `
        <li class="member-card ${isHost ? 'is-host' : ''} ${isReady ? 'is-ready' : ''}">
            <div class="member-avatar">${avatar}</div>
            <div class="member-name">${m.username}</div>
            <div class="member-status">
                ${isReady ? `<span style="color:#00b894;">${m.dishes.length} món</span>` : 'Đang nghĩ...'}
            </div>
        </li>`;
    }).join('');

    // Show Host Controls ONLY if user is host and not decided/rolling
    const isHost = currentGroup.host === currentUser.userId;
    const hostControls = document.getElementById('hostControls');

    if (isHost && currentGroup.status === 'waiting') {
        hostControls.style.display = 'block';
    } else {
        hostControls.style.display = 'none';
    }

    // Check if I voted
    const myInfo = currentGroup.members.find(m => m.userId === currentUser.userId);
    const myMsgDiv = document.getElementById('myVotesDisplay') || createMyVotesDisplay();

    if (myInfo && myInfo.dishes.length > 0) {
        // Show what I picked
        myMsgDiv.innerHTML = `<small style="color:#636e72;">Đã chọn: <b>${myInfo.dishes.join(', ')}</b></small>`;
        document.getElementById('submitVoteBtn').textContent = `Gửi Thêm (${myInfo.dishes.length} món)`;
    } else {
        myMsgDiv.innerHTML = '';
        document.getElementById('submitVoteBtn').textContent = 'Gửi Đề Xuất';
    }

    // Only lock if game over
    const isLocked = currentGroup.status !== 'waiting';
    document.getElementById('dishVoteInput').disabled = isLocked;
    document.getElementById('submitVoteBtn').disabled = isLocked;

    // Handle STATUS
    const resultDiv = document.getElementById('groupResult');
    const resultText = document.getElementById('groupResultText');

    if (currentGroup.status === 'rolling') {
        // Show Animation
        resultDiv.style.display = 'block';
        resultText.textContent = '🎲 Đang bốc...';
        resultText.style.color = '#74b9ff';
        // Optional: Play drumroll sound here
    } else if (currentGroup.status === 'decided') {
        resultDiv.style.display = 'block';

        // Result Display
        let hostResetBtn = '';
        if (currentGroup.host === currentUser.userId) {
            hostResetBtn = `<button class="premium-btn" onclick="resetGroup()" style="width:100%; margin-top:10px; background:var(--pk-yellow); color:#2d3436;">🔄 Làm ván mới</button>`;
        }

        resultDiv.innerHTML = `
            <h2 style="font-size: 1.2rem;">Hôm nay chúng ta ăn:</h2>
            <div id="groupResultText" style="color: var(--pk-red); font-size: 2.5rem; font-weight: 800; text-shadow: 2px 2px 0 white; margin: 10px 0;">
                ${currentGroup.result}
            </div>
            ${hostResetBtn}
            <button class="secondary-btn" onclick="leaveGroupRoom()" style="width:100%; margin-top:10px;">⬅️ Về Danh Sách Nhóm</button>
        `;

        stopPolling();
        playSound('reveal');
        createConfetti();
    } else {
        resultDiv.style.display = 'none';
    }
}

// --- EXISTING FUNCTIONS (Keep as is just wire up) ---
async function fetchData(params = '') {
    try {
        const headers = {};
        if (currentUser) {
            headers['Authorization'] = `Bearer ${currentUser.token} `;
        }

        const res = await fetch(`${API_BASE}/cards${params}`, { headers });
        const data = await res.json();
        // Fallback for empty DB
        if (!Array.isArray(data) || data.length === 0) {
            foodData = [
                { dish: "Cơm tấm", category: "rice", suit: "heart", value: "K" },
                { dish: "Phở bò", category: "noodle", suit: "diamond", value: "Q" }
                // Add more mock data if needed or rely on seeding
            ];
        } else {
            foodData = data;
        }

        applyFilter(document.querySelector('.filter-btn.active').dataset.category);

        document.getElementById('randomBtn').textContent = `Bốc 1 Món (Có ${foodData.length} món)`;
        document.getElementById('randomBtn').disabled = false;
    } catch (error) {
        console.error('Fetch error:', error);
        showToast('Lỗi kết nối database!', 'error');
    }
}

function applyFilter(category) {
    if (category === 'all') {
        filteredData = [...foodData];
    } else {
        filteredData = foodData.filter(item => item.category === category);
    }
}

function setupEventListeners() {
    document.getElementById('randomBtn').addEventListener('click', startSinglePick);
    document.getElementById('pick5Btn').addEventListener('click', startPick5);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyFilter(e.target.dataset.category);
        });
    });
}
// Helper to inject vote display below button
function createMyVotesDisplay() {
    const section = document.getElementById('votingSection');
    const div = document.createElement('div');
    div.id = 'myVotesDisplay';
    div.style.marginTop = '5px';
    div.style.textAlign = 'center';
    section.appendChild(div);
    return div;
}

// New Helper Function
function leaveGroupRoom() {
    stopPolling();
    document.getElementById('groupRoom').style.display = 'none';
    document.getElementById('groupLobby').style.display = 'block';
    fetchMyGroups();
}

async function resetGroup() {
    if (!confirm('Bạn muốn làm mới phòng để chơi ván khác?')) return;
    try {
        const res = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ action: 'reset', groupCode: currentGroup.code })
        });
        if (res.ok) {
            showToast('Đã làm mới phòng!', 'success');
            // Polling will catch the status change or we can manually trigger
            currentGroup = await res.json();
            renderGroupRoom();
            startPolling();
        } else {
            const data = await res.json();
            showToast(data.message, 'error');
        }
    } catch (e) { console.error(e); }
}

// ... (Helper functions: playSound, createConfetti, initHistory, etc. - Assuming they exist or implemented below)
// RE-IMPLEMENTING HELPERS FOR COMPLETENESS

function playSound(type) {
    // Implement sound logic
}

function initHistory() {
    const list = document.getElementById('historyList');
    // Implement history logic
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = ['#ff7675', '#74b9ff', '#ffeaa7'][Math.floor(Math.random() * 3)];
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Single Pick Logic
function startSinglePick() {
    if (filteredData.length === 0) return showToast('Không có món nào!', 'error');
    const winner = filteredData[Math.floor(Math.random() * filteredData.length)];
    // Just show result for now to keep concise
    document.getElementById('dishName').textContent = winner.dish;
    document.getElementById('dishBadge').textContent = winner.dish;
    document.getElementById('dishBadge').style.opacity = 1;
    updateCardVisual(document.querySelector('.card-container'), winner);
}

function startPick5() {
    if (filteredData.length < 5) return showToast('Cần ít nhất 5 món!', 'error');
    document.getElementById('cardContainer').style.display = 'none';
    const handChecks = document.getElementById('handContainer');
    handChecks.style.display = 'flex';
    handChecks.innerHTML = '';

    // ... pick 5 logic ...
    const pool = [...filteredData];
    for (let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        const card = pool[idx];
        pool.splice(idx, 1);

        const mini = document.createElement('div');
        mini.className = 'mini-card';
        mini.innerHTML = `
            <div class="card-inner">
                 <div class="card-front">
                    <!-- Pokeball CSS for Mini settings -->
                    <div class="card-pattern" style="border:none; background:none;"></div>
                 </div>
                <div class="card-back"></div>
            </div>
        `;
        mini.addEventListener('click', () => {
            updateCardVisual(mini, card);
            mini.classList.add('selected');
            document.getElementById('dishName').textContent = card.dish;
        });
        handChecks.appendChild(mini);
    }
}

function updateCardVisual(container, card) {
    const cardBack = container.querySelector('.card-back');
    cardBack.setAttribute('data-color', card.color || 'black');

    let centerHtml = '';
    if (['J', 'Q', 'K'].includes(card.value)) {
        centerHtml = `<div class="card-face-text">${card.value}</div>`;
    } else {
        centerHtml = `<div class="card-face-suit">${card.suit === 'heart' ? '♥' : '♣'}</div>`; // Simplified suit mapping
    }

    cardBack.innerHTML = `
        <div class="card-corner top-left">
            ${card.value}
            <span>${card.suit === 'heart' ? '♥' : '♣'}</span>
        </div>
        <div class="card-center">
            ${centerHtml}
        </div>
        <div class="card-corner bottom-right">
            ${card.value}
            <span>${card.suit === 'heart' ? '♥' : '♣'}</span>
        </div>
    `;
}
