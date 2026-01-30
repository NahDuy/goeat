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

// Use data from window
const data = window.FOOD_DATA || [];

let isAnimating = false;
let shuffleInterval;

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

        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

function startReviewLogic() {
    isAnimating = true;
    randomBtn.disabled = true;
    randomBtn.textContent = "Đang tráo bài...";

    // Reset contents
    dishName.textContent = "Đang chọn...";
    dishName.style.opacity = '0.7';
    dishBadge.style.opacity = '0';

    // Flip card back first if it was flipped
    if (cardContainer.classList.contains('flipped')) {
        cardContainer.classList.remove('flipped');

        // Wait for flip back then start shuffle
        setTimeout(() => {
            startShuffle();
        }, 600);
    } else {
        startShuffle();
    }
}

function startShuffle() {
    let speed = 50; // Initial speed (ms)
    let steps = 0;
    const maxSteps = 25; // How many shuffles before stopping

    // Add shaking effect
    cardContainer.classList.add('shaking');

    function nextStep() {
        // Randomly pick a card to show immediately (ghosting effect/shuffling look)
        // Note: In real poker we see back, but here we can flash values or just shake
        // For this effect, we will just shake the BACK of the card, 
        // OR we can even flip the card fast to show many options.
        // Let's stick to Shaking the BACK card for mystery, then flip reveal.

        /* 
           If the user wants to see the card Changing values rapidly, we need to flip it first.
           But usually "Picking a card" means we see the back until revealed.
           Let's make it more dramatic: 
           1. Shake the card back (already added class)
           2. After delay, stop shake, flip and show result.
        */

        steps++;

        if (steps > maxSteps) {
            finishShuffle();
        } else {
            // Slow down gradually? 
            // Actually for "Shaking" back, we just wait.
            // If we want to simulate "riffling" through cards, we could do that too.
            // Let's keep it simple: Shake for 2 seconds.
        }
    }

    // Since we are just shaking, we can use timeout instead of steps loop for shaking
    setTimeout(finishShuffle, 2000);
}

function finishShuffle() {
    cardContainer.classList.remove('shaking');

    // Pick winner
    const randomIndex = Math.floor(Math.random() * data.length);
    const winner = data[randomIndex];

    // Update card content (hidden)
    updateCard(winner);

    // Flip to reveal
    cardContainer.classList.add('flipped');

    // Show text after flip
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
    if (!isAnimating) startReviewLogic();
});

// Click card to trigger too
cardContainer.addEventListener('click', () => {
    if (!isAnimating) startReviewLogic();
});

// Init ? symbol on front
document.querySelector('.card-front span').textContent = "?";
