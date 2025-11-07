// SHA-256 hash function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Load solved challenges from localStorage
let solvedChallenges = JSON.parse(localStorage.getItem('solvedChallenges')) || [];
let totalScore = parseInt(localStorage.getItem('totalScore')) || 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateScore();
    loadSolvedChallenges();
    setupEventListeners();
    setupChallenge3();
});

function setupEventListeners() {
    // Submit buttons
    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const card = e.target.closest('.challenge-card');
            const challengeId = card.dataset.challenge;
            const input = card.querySelector('.flag-input');
            const result = card.querySelector('.result');
            
            const userFlag = input.value.trim();
            if (!userFlag) {
                showResult(result, 'Please enter a flag', false);
                return;
            }
            
            const userHash = await sha256(userFlag);
            
            if (userHash === challenges[challengeId]) {
                if (!solvedChallenges.includes(challengeId)) {
                    solvedChallenges.push(challengeId);
                    totalScore += challengePoints[challengeId];
                    localStorage.setItem('solvedChallenges', JSON.stringify(solvedChallenges));
                    localStorage.setItem('totalScore', totalScore.toString());
                    updateScore();
                }
                
                card.classList.add('solved');
                showResult(result, '✓ Correct! Challenge solved!', true);
                input.disabled = true;
                
                if (solvedChallenges.length === Object.keys(challenges).length) {
                    setTimeout(() => {
                        document.getElementById('completionMessage').classList.add('show');
                    }, 500);
                }
            } else {
                showResult(result, '✗ Incorrect flag. Try again!', false);
            }
        });
    });
    
    // Challenge 3: Cookie button
    const getCookieBtn = document.getElementById('getCookie');
    if (getCookieBtn) {
        getCookieBtn.addEventListener('click', () => {
            localStorage.setItem('secret_flag', 'flag{cookie_monster}');
            alert('Cookie set! Check your browser\'s Local Storage (F12 > Application/Storage tab)');
        });
    }
    
    // Challenge 5: Secret API button
    const secretBtn = document.getElementById('secretBtn');
    if (secretBtn) {
        secretBtn.addEventListener('click', () => {
            // Simulate an API call that reveals the flag in the Network tab
            fetch('data:text/plain;charset=utf-8,' + encodeURIComponent('{"flag":"flag{hidden_endpoint}","message":"You found the secret endpoint!"}'))
                .then(() => {
                    console.log('%c🚩 Secret Flag: flag{hidden_endpoint}', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
                    alert('Check the browser Console (F12) for a secret message!');
                });
        });
    }
}

function showResult(element, message, isSuccess) {
    element.textContent = message;
    element.className = 'result ' + (isSuccess ? 'success' : 'error');
    
    setTimeout(() => {
        if (!isSuccess) {
            element.style.display = 'none';
        }
    }, 3000);
}

function updateScore() {
    document.getElementById('score').textContent = solvedChallenges.length;
}

function loadSolvedChallenges() {
    solvedChallenges.forEach(challengeId => {
        const card = document.querySelector(`[data-challenge="${challengeId}"]`);
        if (card) {
            card.classList.add('solved');
            const input = card.querySelector('.flag-input');
            const result = card.querySelector('.result');
            input.disabled = true;
            showResult(result, '✓ Already solved!', true);
        }
    });
    
    if (solvedChallenges.length === Object.keys(challenges).length) {
        document.getElementById('completionMessage').classList.add('show');
    }
}

function setupChallenge3() {
    // Check if cookie challenge was already set up
    if (!localStorage.getItem('ctf_initialized')) {
        localStorage.setItem('ctf_initialized', 'true');
    }
}

// Easter egg: Reset progress (for testing)
console.log('%cCTF Platform', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cType resetProgress() to clear all progress', 'color: #888; font-size: 12px;');

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        localStorage.clear();
        location.reload();
    }
}
