// ==================== CONFIGURATION ====================
// CHANGE THIS to your Vercel backend URL after deployment
const API_BASE = 'https://arcadex-leaderboard-api.vercel.app'; // e.g., https://wager-backend.vercel.app

// ==================== HELPER FUNCTIONS ====================
function getAdminKey() {
    return document.getElementById('adminKey').value;
}

function displayResponse(data) {
    document.getElementById('responseDisplay').textContent = JSON.stringify(data, null, 2);
}

// ==================== API CALLS ====================
async function refreshStatus() {
    const key = getAdminKey();
    if (!key) {
        alert('Please enter admin key');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/status?key=${key}`);
        const data = await response.json();
        
        if (data.success) {
            const timer = data.data.timer;
            const lb = data.data.leaderboard;
            
            const statusHTML = `
                <p><strong>Event Active:</strong> ${timer.active ? '✅ Yes' : '❌ No'}</p>
                ${timer.active ? `
                    <p><strong>Ends:</strong> ${new Date(timer.end).toLocaleString()}</p>
                    <p><strong>Remaining:</strong> ${Math.floor(timer.remaining / 1000 / 60 / 60)} hours</p>
                ` : ''}
                <p><strong>Total Players:</strong> ${lb.totalPlayers}</p>
                <p><strong>Total Wagered:</strong> $${lb.totalWagered.toLocaleString()}</p>
            `;
            
            document.getElementById('statusDisplay').innerHTML = statusHTML;
        }
        
        displayResponse(data);
    } catch (error) {
        displayResponse({ error: error.message });
        alert('Failed to connect to API. Check your API_BASE URL in admin.js');
    }
}

async function startEvent() {
    const key = getAdminKey();
    const days = parseInt(document.getElementById('eventDays').value);
    
    if (!key) {
        alert('Please enter admin key');
        return;
    }
    
    if (!days || days <= 0) {
        alert('Please enter valid duration');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Key': key
            },
            body: JSON.stringify({ days })
        });
        
        const data = await response.json();
        displayResponse(data);
        
        if (data.success) {
            alert('Event started successfully!');
            refreshStatus();
        }
    } catch (error) {
        displayResponse({ error: error.message });
    }
}

async function updateWagers() {
    const key = getAdminKey();
    if (!key) {
        alert('Please enter admin key');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/update-wagers`, {
            method: 'POST',
            headers: {
                'X-Admin-Key': key
            }
        });
        
        const data = await response.json();
        displayResponse(data);
        
        if (data.success) {
            alert('Wagers updated successfully!');
            refreshStatus();
        }
    } catch (error) {
        displayResponse({ error: error.message });
    }
}

async function resetLeaderboard() {
    const key = getAdminKey();
    if (!key) {
        alert('Please enter admin key');
        return;
    }
    
    if (!confirm('Are you sure you want to reset the leaderboard?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/reset`, {
            method: 'POST',
            headers: {
                'X-Admin-Key': key
            }
        });
        
        const data = await response.json();
        displayResponse(data);
        
        if (data.success) {
            alert('Leaderboard reset successfully!');
            refreshStatus();
        }
    } catch (error) {
        displayResponse({ error: error.message });
    }
}

// Auto-refresh status on load if admin key is present
window.addEventListener('load', () => {
    const key = getAdminKey();
    if (key) {
        refreshStatus();
    }
});