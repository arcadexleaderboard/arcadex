// ==================== STATE & CONFIG ====================
// ==================== CONFIGURATION ====================
// CHANGE THIS to your Vercel backend URL after deployment
const API_BASE = 'https://arcadex-leaderboard-api.vercel.app'; // e.g., https://wager-backend.vercel.app

// Change MOCK_MODE to false when backend is ready
const MOCK_MODE = false; // Set to false when connecting to real API
const REFERRAL_CODE = 'ArcadeX';

let timerInterval = null;

// ... rest of your existing script.js code

// ==================== PARTICLES INITIALIZATION ====================
function initParticles(bgColor, particleColor) {
    tsParticles.load("tsparticles", {
        background: {
            color: { value: bgColor }
        },
        fpsLimit: 60,
        particles: {
            color: { value: particleColor },
            links: {
                color: particleColor,
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: false,
                straight: false,
                outModes: { default: "bounce" }
            },
            number: {
                density: { enable: true, area: 800 },
                value: 80
            },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } }
        },
        detectRetina: true
    });
}

// ==================== MOCK DATA ====================
function getMockLeaderboardData() {
    return {
        code: REFERRAL_CODE,
        players: [
            { rank: 1, name: 'CryptoKing', wagered: 125840, avatar: 'https://i.pravatar.cc/150?img=12' },
            { rank: 2, name: 'LuckyDiamond', wagered: 98320, avatar: 'https://i.pravatar.cc/150?img=33' },
            { rank: 3, name: 'BetMaster99', wagered: 87450, avatar: 'https://i.pravatar.cc/150?img=25' },
            { rank: 4, name: 'WagerLegend', wagered: 76230, avatar: 'https://i.pravatar.cc/150?img=68' },
            { rank: 5, name: 'HighRoller', wagered: 65890, avatar: 'https://i.pravatar.cc/150?img=15' },
            { rank: 6, name: 'SpinDoctor', wagered: 54320, avatar: 'https://i.pravatar.cc/150?img=47' },
            { rank: 7, name: 'JackpotHunter', wagered: 47650, avatar: 'https://i.pravatar.cc/150?img=59' },
            { rank: 8, name: 'RiskTaker', wagered: 42190, avatar: 'https://i.pravatar.cc/150?img=31' },
            { rank: 9, name: 'FortuneSeeker', wagered: 38750, avatar: 'https://i.pravatar.cc/150?img=22' },
            { rank: 10, name: 'BoldBetter', wagered: 35420, avatar: 'https://i.pravatar.cc/150?img=54' },
            { rank: 11, name: 'SlotMachine', wagered: 32150, avatar: 'https://i.pravatar.cc/150?img=18' },
            { rank: 12, name: 'DiceRoller', wagered: 29800, avatar: 'https://i.pravatar.cc/150?img=29' },
            { rank: 13, name: 'CardShark', wagered: 27340, avatar: 'https://i.pravatar.cc/150?img=41' },
            { rank: 14, name: 'BettyBets', wagered: 25670, avatar: 'https://i.pravatar.cc/150?img=9' },
            { rank: 15, name: 'MaxBetter', wagered: 23450, avatar: 'https://i.pravatar.cc/150?img=66' },
            { rank: 16, name: 'GoldenGambler', wagered: 21890, avatar: 'https://i.pravatar.cc/150?img=70' },
            { rank: 17, name: 'RouletteKing', wagered: 19760, avatar: 'https://i.pravatar.cc/150?img=13' },
            { rank: 18, name: 'PokerFace', wagered: 18230, avatar: 'https://i.pravatar.cc/150?img=27' },
            { rank: 19, name: 'ChipLeader', wagered: 16540, avatar: 'https://i.pravatar.cc/150?img=63' },
            { rank: 20, name: 'AllInAce', wagered: 15120, avatar: 'https://i.pravatar.cc/150?img=44' }
        ],
        totalWagered: 967530,
        totalPlayers: 87
    };
}

function getMockTimerData() {
    // Return active event ending in 2 days
    return {
        active: true,
        endTime: Date.now() + (2 * 24 * 60 * 60 * 1000) // 2 days from now
    };
}

// ==================== API CALLS ====================
/**
 * Get leaderboard data filtered by referral code
 */
async function getLeaderboard(code = REFERRAL_CODE) {
    if (MOCK_MODE) {
        return new Promise(resolve => {
            setTimeout(() => resolve(getMockLeaderboardData()), 500);
        });
    }
    
    try {
        const response = await fetch(`${API_BASE}/leaderboard?code=${code}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        // Extract the actual data from the wrapper
        return result.data || result;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to mock data if API fails
        return getMockLeaderboardData();
    }
}

async function fetchTimer() {
    if (MOCK_MODE) {
        return new Promise(resolve => {
            setTimeout(() => resolve(getMockTimerData()), 500);
        });
    }
    const response = await fetch(`${API_BASE}/timer`);
    const result = await response.json();
    // Extract the actual data from the wrapper
    return result.data || result;
}

// ==================== RANK SUFFIX ====================
function getRankSuffix(rank) {
    const j = rank % 10;
    const k = rank % 100;
    if (j === 1 && k !== 11) return rank + 'st';
    if (j === 2 && k !== 12) return rank + 'nd';
    if (j === 3 && k !== 13) return rank + 'rd';
    return rank + 'th';
}

// ==================== COUNTER ANIMATION ====================
function animateCounter(element, target, duration = 2000, prefix = '', suffix = '', isCurrency = false) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format based on type
        if (isCurrency) {
            // For currency, show 2 decimal places
            element.textContent = prefix + current.toFixed(2);
        } else {
            // For counts (like player count), use integers
            element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }
    }, 16);
}

// ==================== TIMER COUNTDOWN ====================
function updateTimer(endTime) {
    const now = Date.now();
    const diff = endTime - now;
    
    if (diff <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timerActive').classList.add('hidden');
        document.getElementById('timerInactive').classList.remove('hidden');
        document.getElementById('rewardsSection').classList.add('hidden');
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// ==================== LEADERBOARD RENDERING ====================
function renderLeaderboard(data) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    data.players.forEach(player => {
        const row = document.createElement('tr');
        row.className = `leaderboard-row border-b border-gray-700 border-opacity-30 ${
            player.rank <= 4 ? `rank-${player.rank}` : ''
        }`;
        
        // Rank cell with suffix (1st, 2nd, 3rd...)
        const rankCell = document.createElement('td');
        rankCell.className = 'py-4 px-4 rank-badge';
        rankCell.textContent = getRankSuffix(player.rank);
        
        // Name cell with avatar
        const nameCell = document.createElement('td');
        nameCell.className = 'py-4 px-4';
        const nameContainer = document.createElement('div');
        nameContainer.className = 'flex items-center gap-3';
        
        // Avatar
        const avatar = document.createElement('img');
        avatar.src = player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=3B82F6&color=fff&bold=true`;
        avatar.alt = player.name;
        avatar.className = 'profile-pic';
        avatar.onerror = function() {
            this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=3B82F6&color=fff&bold=true`;
        };
        
        // Name text
        const nameText = document.createElement('span');
        nameText.className = 'font-semibold text-lg';
        nameText.textContent = player.name;
        
        nameContainer.appendChild(avatar);
        nameContainer.appendChild(nameText);
        nameCell.appendChild(nameContainer);
        
        // Wagered cell
        const wageredCell = document.createElement('td');
        wageredCell.className = 'py-4 px-4 text-right font-bold text-lg';
        wageredCell.textContent = '$' + player.wagered.toLocaleString();
        
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(wageredCell);
        tbody.appendChild(row);
    });
}

// ==================== INITIALIZATION ====================
async function init() {
    // Set black background and white text immediately
    document.body.style.backgroundColor = '#000000';
    document.body.style.color = '#ffffff';
    
    // Initialize particles with black background and blue particles
    setTimeout(() => {
        initParticles('#000000', '#3B82F6');
    }, 100);
    
    // Set referral code display
    document.getElementById('codeDisplay').textContent = REFERRAL_CODE;
    
    try {
        // Fetch timer data
        const timerData = await fetchTimer();
        
        if (timerData.active) {
            document.getElementById('timerActive').classList.remove('hidden');
            document.getElementById('timerInactive').classList.add('hidden');
            document.getElementById('rewardsSection').classList.remove('hidden');
            
            updateTimer(timerData.endTime);
            timerInterval = setInterval(() => updateTimer(timerData.endTime), 1000);
        } else {
            document.getElementById('timerActive').classList.add('hidden');
            document.getElementById('timerInactive').classList.remove('hidden');
            document.getElementById('rewardsSection').classList.add('hidden');
        }

        // Fetch leaderboard data
        const leaderboardData = await getLeaderboard(REFERRAL_CODE);
        
        // Debug: Log the response to see what we're getting
        console.log('Leaderboard data received:', leaderboardData);
        
        // Check if data has the expected structure
        if (!leaderboardData || !leaderboardData.players) {
            throw new Error('Invalid data format received from API');
        }
        
        // For Total Wagered (currency)
        animateCounter(
            document.getElementById('totalWagered'),
            leaderboardData.totalWagered,
            2000,
            '$',
            '',
            true
        );

        // For Total Players (count - no decimals needed)
        animateCounter(
            document.getElementById('totalPlayers'),
            leaderboardData.totalPlayers,
            2000,
            '',
            '',
            false 
        );
        
        // Render leaderboard
        renderLeaderboard(leaderboardData);
        
        // Show table, hide loading
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('leaderboardTable').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
    }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}