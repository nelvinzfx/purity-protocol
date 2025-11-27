// --- Config ---
const CONFIG = {
    storageKey: 'purity_protocol_v2_data',
    levels: [
        { name: 'INITIATE', days: 0, color: '#9ca3af' },
        { name: 'NEOPHYTE', days: 3, color: '#10b981' },
        { name: 'ACOLYTE', days: 7, color: '#3b82f6' },
        { name: 'ADEPT', days: 30, color: '#8b5cf6' },
        { name: 'ASCENDANT', days: 90, color: '#fbbf24' }
    ],
    dailyTasks: [
        { id: 'cold_shower', text: 'Cold Shower', icon: 'fa-snowflake' },
        { id: 'meditate', text: 'Meditation (10m)', icon: 'fa-om' },
        { id: 'journal', text: 'Journal Entry', icon: 'fa-pen' },
        { id: 'exercise', text: 'Physical Training', icon: 'fa-dumbbell' }
    ],
    addictionTypes: [
        { id: 'pmo', name: 'PMO (Porn/Masturbation)', icon: 'fa-ban', color: '#ef4444' },
        { id: 'social_media', name: 'Social Media', icon: 'fa-mobile-screen', color: '#3b82f6' },
        { id: 'reels', name: 'Reels/Short Videos', icon: 'fa-video', color: '#8b5cf6' },
        { id: 'gaming', name: 'Gaming', icon: 'fa-gamepad', color: '#10b981' },
        { id: 'smoking', name: 'Smoking', icon: 'fa-smoking', color: '#6b7280' },
        { id: 'alcohol', name: 'Alcohol', icon: 'fa-wine-bottle', color: '#f59e0b' },
        { id: 'junk_food', name: 'Junk Food', icon: 'fa-burger', color: '#f97316' },
        { id: 'shopping', name: 'Shopping', icon: 'fa-cart-shopping', color: '#ec4899' }
    ],
    avatars: [
        'fa-user-astronaut', 'fa-user-ninja', 'fa-user-secret', 'fa-dragon',
        'fa-robot', 'fa-skull', 'fa-ghost', 'fa-cat', 'fa-dog', 'fa-crow',
        'fa-fire', 'fa-bolt', 'fa-shield', 'fa-crown', 'fa-star'
    ],
    stoicQuotes: [
        "We suffer more often in imagination than in reality. — Seneca",
        "You have power over your mind - not outside events. Realize this, and you will find strength. — Marcus Aurelius",
        "The best revenge is to be unlike him who performed the injury. — Marcus Aurelius",
        "Discipline is doing what needs to be done, even if you don't want to do it.",
        "A gem cannot be polished without friction, nor a man perfected without trials. — Seneca",
        "Waste no more time arguing about what a good man should be. Be one. — Marcus Aurelius",
        "It is not the man who has too little, but the man who craves more, that is poor. — Seneca",
        "The soul becomes dyed with the color of its thoughts. — Marcus Aurelius",
        "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control. — Epictetus",
        "Man conquers the world by conquering himself. — Zeno",
        "He who is brave is free. — Seneca",
        "If it is not right do not do it; if it is not true do not say it. — Marcus Aurelius"
    ],
    achievements: [
        { id: 'first_day', name: 'First Step', desc: 'Complete your first day', icon: 'fa-seedling', condition: (s) => getCurrentStreak(s) >= 1 },
        { id: 'week_warrior', name: 'Week Warrior', desc: 'Reach 7 day streak', icon: 'fa-fire', condition: (s) => getCurrentStreak(s) >= 7 },
        { id: 'month_master', name: 'Month Master', desc: 'Reach 30 day streak', icon: 'fa-crown', condition: (s) => getCurrentStreak(s) >= 30 },
        { id: 'journal_5', name: 'Chronicler', desc: 'Write 5 journal entries', icon: 'fa-book', condition: (s) => s.journalEntries.length >= 5 },
        { id: 'checkin_10', name: 'Committed', desc: 'Complete 10 check-ins', icon: 'fa-check-double', condition: (s) => s.totalCheckins >= 10 },
        { id: 'no_panic', name: 'Iron Will', desc: 'Reach 7 days without panic button', icon: 'fa-shield', condition: (s) => getCurrentStreak(s) >= 7 && s.panicButtonUses === 0 },
        { id: 'comeback', name: 'Phoenix', desc: 'Recover after a relapse', icon: 'fa-phoenix-squadron', condition: (s) => s.relapseHistory.length > 0 && getCurrentStreak(s) >= 3 },
        { id: 'task_master', name: 'Task Master', desc: 'Complete all daily tasks 5 times', icon: 'fa-list-check', condition: (s) => {
            let fullDays = 0;
            Object.values(s.dailyChecklist).forEach(tasks => {
                if (tasks.length === CONFIG.dailyTasks.length) fullDays++;
            });
            return fullDays >= 5;
        }},
        { id: 'century', name: 'Centurion', desc: 'Reach 100 day streak', icon: 'fa-trophy', condition: (s) => getCurrentStreak(s) >= 100 }
    ]
};

function getCurrentStreak(s) {
    return Math.floor(moment.duration(moment().diff(moment(s.startDate))).asDays());
}

// --- State Management ---
let state = {
    startDate: new Date().toISOString(),
    bestStreak: 0, // in ms
    journalEntries: [],
    dailyChecklist: {}, // { 'YYYY-MM-DD': ['task_id', ...] }
    lastCheckin: null,
    relapseHistory: [], // { date, daysBefore }
    activityLog: [], // { timestamp, type, description }
    panicButtonUses: 0,
    totalCheckins: 0,
    streakHistory: {}, // { 'YYYY-MM-DD': streakDays }
    unlockedAchievements: [], // ['achievement_id', ...]
    profile: {
        username: 'Warrior',
        avatar: 'fa-user-astronaut',
        addictionTypes: ['pmo'] // pmo, social_media, reels, gaming, smoking, alcohol, custom
    }
};

// --- DOM Elements ---
const els = {
    timer: document.getElementById('main-timer'),
    bestStreak: document.getElementById('best-streak'),
    rankTitle: document.getElementById('rank-title'),
    rankProgress: document.getElementById('rank-progress'),
    nextRankDays: document.getElementById('next-rank-days'),
    checklistContainer: document.getElementById('checklist-container'),
    
    // Sidebar & Nav
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    openSidebarBtn: document.getElementById('open-sidebar'),
    closeSidebarBtn: document.getElementById('close-sidebar'),
    navLinks: document.querySelectorAll('.nav-link'),
    views: document.querySelectorAll('.view-section'),
    currentViewLabel: document.getElementById('current-view-label'),
    sidebarRank: document.getElementById('sidebar-rank'),

    // Journal
    journalInput: document.getElementById('journal-entry'), // mini
    saveJournalBtn: document.getElementById('save-journal'), // mini
    journalFullInput: document.getElementById('journal-full-entry'), // full
    saveJournalFullBtn: document.getElementById('save-journal-full'), // full
    journalHistoryList: document.getElementById('journal-history-list'),
    totalEntriesCount: document.getElementById('total-entries-count'),

    // Emergency
    panicBtn: document.getElementById('panic-btn'),
    emergencyOverlay: document.getElementById('emergency-overlay'),
    closeEmergencyBtn: document.getElementById('close-emergency'),
    emergencyCalmBtn: document.getElementById('emergency-calm-btn'),
    breathCircle: document.getElementById('breath-circle'),
    breathText: document.getElementById('breath-instruction'),
    
    // Actions
    relapseBtn: document.getElementById('relapse-btn'),
    checkinBtn: document.getElementById('checkin-btn'),
    dateDisplay: document.getElementById('date-display'),

    // Analytics
    statRelapses: document.getElementById('stat-relapses'),
    statCheckins: document.getElementById('stat-checkins'),
    statJournals: document.getElementById('stat-journals'),
    statPanic: document.getElementById('stat-panic'),
    activityTimeline: document.getElementById('activity-timeline'),
    insightsPanel: document.getElementById('insights-panel'),
    heatmapGrid: document.getElementById('heatmap-grid'),

    // Settings
    exportBtn: document.getElementById('export-data-btn'),
    importFile: document.getElementById('import-file')
};

let charts = {
    recovery: null,
    streak: null,
    task: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    handlePreloader();
    loadState();
    initUI();
    startTimer();
    initChart();
    initAnalytics();
    renderJournalHistory(); // Init journal list
    initCLI(); // Start interactive terminal
});

// --- CLI / Terminal Logic ---
const consoleHistory = document.getElementById('console-history');
const cmdInput = document.getElementById('cmd-input');
const typeWriterArea = document.getElementById('typewriter-text');

function initCLI() {
    // Initial System Boot Message
    const bootText = "SYSTEM_READY. TYPE 'help' FOR COMMANDS.";
    let i = 0;
    const type = () => {
        if (i < bootText.length) {
            typeWriterArea.innerHTML += bootText.charAt(i);
            i++;
            setTimeout(type, 30);
        } else {
            cmdInput.focus();
        }
    };
    type();

    // Listener
    cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = cmdInput.value.trim();
            if (cmd) {
                printToConsole(`usr@nexus:~$ ${cmd}`, 'input');
                handleCommand(cmd);
            }
            cmdInput.value = '';
            // Auto scroll to bottom
            const container = document.getElementById('console-output');
            container.scrollTop = container.scrollHeight;
        }
    });
}

function printToConsole(text, type = 'system') {
    const div = document.createElement('div');
    div.className = type === 'input' ? 'text-gray-500 mb-1' : 'text-accent mb-2 leading-tight';
    div.innerText = text;
    consoleHistory.appendChild(div);
}

function handleCommand(rawCmd) {
    const parts = rawCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (cmd) {
        case 'help':
            printToConsole("AVAILABLE COMMANDS:\n> status : Show current stats\n> commit : Daily check-in\n> log [msg] : Quick journal entry\n> panic : Emergency mode\n> clear : Clear terminal");
            break;
        
        case 'status':
            const dur = moment.duration(moment().diff(moment(state.startDate)));
            printToConsole(`STREAK: ${Math.floor(dur.asDays())} DAYS\nRANK: ${els.rankTitle.innerText}\nBEST: ${els.bestStreak.innerText}`);
            break;

        case 'commit':
            dailyCheckin();
            printToConsole(">> CHECK-IN CONFIRMED. STAY STRONG.");
            break;

        case 'panic':
            triggerEmergency();
            printToConsole(">> EMERGENCY PROTOCOL INITIATED.");
            break;

        case 'log':
            if (!args) {
                printToConsole("ERROR: Message required. Usage: log [message]", 'error');
            } else {
                // Add to state directly
                const entry = { id: Date.now(), date: new Date().toISOString(), text: args };
                state.journalEntries.unshift(entry);
                saveState();
                renderJournalHistory();
                printToConsole(">> ENTRY SAVED TO CHRONICLES.");
            }
            break;
            
        case 'clear':
            consoleHistory.innerHTML = '';
            break;

        case 'sudo':
            printToConsole("NICE TRY. ACCESS DENIED.");
            break;

        default:
            printToConsole(`ERROR: Command '${cmd}' not recognized. Type 'help'.`, 'error');
    }
}

// --- Preloader Logic ---
function handlePreloader() {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('loader-bar');
    const percent = document.getElementById('loader-percent');
    const glow = document.getElementById('bolt-glow');
    
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 5;
        if (width > 100) width = 100;
        
        bar.style.width = `${width}%`;
        percent.innerText = `${Math.floor(width)}%`;
        
        // Sync glow opacity with progress
        if (glow) glow.style.opacity = width / 100;
        
        if (width === 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.remove();
                }, 700);
            }, 800);
        }
    }, 80); 
}

function loadState() {
    const stored = localStorage.getItem(CONFIG.storageKey);
    if (stored) {
        state = { ...state, ...JSON.parse(stored) };
    } else {
        saveState();
    }
}

function saveState() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
}

function logActivity(type, description) {
    state.activityLog.unshift({
        timestamp: new Date().toISOString(),
        type,
        description
    });
    if (state.activityLog.length > 50) state.activityLog.pop();
    saveState();
}

function initUI() {
    els.dateDisplay.innerText = moment().format('MMM D').toUpperCase();
    updateBestStreakUI();
    renderChecklist();
    updateProfileUI();
    
    // Set random quote
    const quoteEl = document.getElementById('stoic-quote-ticker');
    if (quoteEl) {
        const randomQuote = CONFIG.stoicQuotes[Math.floor(Math.random() * CONFIG.stoicQuotes.length)];
        quoteEl.innerText = `:: "${randomQuote}" ::`;
    }

    // Event Listeners
    setupNavigation();
    
    els.saveJournalBtn.addEventListener('click', () => saveJournalEntry(els.journalInput));
    els.saveJournalFullBtn.addEventListener('click', () => saveJournalEntry(els.journalFullInput));
    
    els.panicBtn.addEventListener('click', triggerEmergency);
    els.closeEmergencyBtn.addEventListener('click', closeEmergency);
    els.emergencyCalmBtn.addEventListener('click', closeEmergency);
    
    // Meditation handlers
    const medClose = document.getElementById('close-meditation');
    const medStart = document.getElementById('meditation-start-btn');
    const medReset = document.getElementById('meditation-reset-btn');

    if (medClose) medClose.addEventListener('click', closeMeditationModal);
    if (medStart) medStart.addEventListener('click', toggleMeditationTimer);
    if (medReset) medReset.addEventListener('click', resetMeditationTimer);

    els.relapseBtn.addEventListener('click', confirmRelapse);
    els.checkinBtn.addEventListener('click', dailyCheckin);

    els.exportBtn.addEventListener('click', exportData);
    els.importFile.addEventListener('change', importData);

    // Initial check for daily commit
    const today = moment().format('YYYY-MM-DD');
    if (state.lastCheckin === today) {
        els.checkinBtn.innerHTML = `<i class="fa-solid fa-check"></i> COMPLETE`;
        els.checkinBtn.classList.add('bg-green-500', 'text-white');
    }

    // Profile handlers
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const addCustomBtn = document.getElementById('add-custom-addiction');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
    if (addCustomBtn) addCustomBtn.addEventListener('click', addCustomAddiction);
}

// --- Navigation Logic ---
function setupNavigation() {
    // Sidebar Toggle
    const toggleSidebar = (show) => {
        if (show) {
            els.sidebar.classList.add('open');
            els.sidebarOverlay.classList.add('open');
        } else {
            els.sidebar.classList.remove('open');
            els.sidebarOverlay.classList.remove('open');
        }
    };

    els.openSidebarBtn.addEventListener('click', () => toggleSidebar(true));
    els.closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    els.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    // View Switching
    els.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetView = link.dataset.view;
            
            // Update UI classes
            els.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Switch Content
            els.views.forEach(view => {
                if (view.id === `view-${targetView}`) {
                    view.classList.remove('hidden');
                    // Trigger animation restart
                    view.classList.remove('animate-fade-in');
                    void view.offsetWidth; // trigger reflow
                    view.classList.add('animate-fade-in');
                } else {
                    view.classList.add('hidden');
                }
            });

            // Update Breadcrumb
            els.currentViewLabel.innerText = targetView.toUpperCase();
            
            // Render view-specific content
            if (targetView === 'achievements') renderAchievements();
            if (targetView === 'leaderboard') renderLeaderboard();
            if (targetView === 'settings') renderProfileSettings();
            
            // Close sidebar on mobile
            if (window.innerWidth < 768) {
                toggleSidebar(false);
            }
        });
    });
}


// --- Core Logic: Timer & Rank ---
function startTimer() {
    setInterval(() => {
        const now = moment();
        const start = moment(state.startDate);
        const diff = moment.duration(now.diff(start));

        const d = Math.floor(diff.asDays());
        const h = diff.hours();
        const m = diff.minutes();
        const s = diff.seconds();

        els.timer.innerText = `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;

        updateRank(d);
        
        const currentStreakMs = now.diff(start);
        if (currentStreakMs > state.bestStreak) {
            state.bestStreak = currentStreakMs;
            updateBestStreakUI();
        }

        // Track daily streak for heatmap
        const today = moment().format('YYYY-MM-DD');
        state.streakHistory[today] = d;
        
        // Check achievements every minute
        if (s === 0) checkAchievements();
    }, 1000);
}

function pad(n) { return n.toString().padStart(2, '0'); }

function updateBestStreakUI() {
    const dur = moment.duration(state.bestStreak);
    els.bestStreak.innerText = `Best: ${Math.floor(dur.asDays())}d`;
}

function updateRank(days) {
    let currentRank = CONFIG.levels[0];
    let nextRank = CONFIG.levels[1];

    for (let i = 0; i < CONFIG.levels.length; i++) {
        if (days >= CONFIG.levels[i].days) {
            currentRank = CONFIG.levels[i];
            nextRank = CONFIG.levels[i + 1] || null;
        }
    }

    els.rankTitle.innerText = currentRank.name;
    els.rankTitle.style.color = currentRank.color;
    els.sidebarRank.innerText = currentRank.name; // Update sidebar too

    if (nextRank) {
        const totalDays = nextRank.days - currentRank.days;
        const progressDays = days - currentRank.days;
        const percentage = Math.min(100, Math.max(0, (progressDays / totalDays) * 100));
        
        els.rankProgress.style.width = `${percentage}%`;
        els.nextRankDays.innerText = `${nextRank.days - days} DAYS`;
    } else {
        els.rankProgress.style.width = '100%';
        els.nextRankDays.innerText = 'MAX RANK';
    }
}

function confirmRelapse() {
    if (confirm("Are you sure? This will reset your streak to zero.")) {
        const daysBefore = Math.floor(moment.duration(moment().diff(moment(state.startDate))).asDays());
        state.relapseHistory.push({ date: new Date().toISOString(), daysBefore });
        state.startDate = new Date().toISOString();
        state.lastCheckin = null;
        logActivity('relapse', `Streak reset after ${daysBefore} days`);
        saveState();
        renderChecklist();
        updateAnalytics();
        
        anime({
            targets: 'body',
            backgroundColor: ['#300', '#030304'],
            duration: 500,
            easing: 'easeOutQuad'
        });
    }
}

function dailyCheckin() {
    const today = moment().format('YYYY-MM-DD');
    if (state.lastCheckin !== today) {
        state.lastCheckin = today;
        state.totalCheckins++;
        logActivity('checkin', 'Daily commitment completed');
        saveState();
        updateAnalytics();
        checkAchievements();
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#06b6d4', '#ffffff']
        });

        els.checkinBtn.innerHTML = `<i class="fa-solid fa-check"></i> COMPLETE`;
        els.checkinBtn.classList.add('bg-green-500', 'text-white');
        setTimeout(() => {
            els.checkinBtn.innerHTML = `<i class="fa-solid fa-check-double"></i> COMMIT`;
            els.checkinBtn.classList.remove('bg-green-500', 'text-white');
        }, 3000);
    } else {
        alert("You've already committed for today. Stay strong.");
    }
}

// --- Checklist System ---
function renderChecklist() {
    const today = moment().format('YYYY-MM-DD');
    const completedTasks = state.dailyChecklist[today] || [];
    
    els.checklistContainer.innerHTML = '';

    CONFIG.dailyTasks.forEach(task => {
        const isChecked = completedTasks.includes(task.id);
        
        const div = document.createElement('div');
        div.className = `flex items-center justify-between p-3 rounded-lg border transition-all ${isChecked ? 'bg-glassBorder border-success/30' : 'bg-glass border-glassBorder hover:bg-glassHigh'}`;
        
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded flex items-center justify-center bg-white/5 text-gray-400">
                    <i class="fa-solid ${task.icon}"></i>
                </div>
                <span class="text-sm font-medium ${isChecked ? 'text-gray-400 line-through' : 'text-gray-200'}">${task.text}</span>
            </div>
            <input type="checkbox" class="custom-checkbox" ${isChecked ? 'checked' : ''}>
        `;

        div.querySelector('input').addEventListener('change', (e) => {
            toggleTask(task.id, e.target.checked);
        });

        // Add special handler for meditation task
        if (task.id === 'meditate' && !isChecked) {
            div.style.cursor = 'pointer';
            div.title = "Click to start session";
            div.addEventListener('click', (e) => {
                // Prevent triggering if clicking the checkbox directly
                if (e.target.type !== 'checkbox') {
                    openMeditationModal();
                }
            });
        }

        els.checklistContainer.appendChild(div);
    });
}

function toggleTask(taskId, isChecked) {
    const today = moment().format('YYYY-MM-DD');
    if (!state.dailyChecklist[today]) state.dailyChecklist[today] = [];

    if (isChecked) {
        if (!state.dailyChecklist[today].includes(taskId)) {
            state.dailyChecklist[today].push(taskId);
        }
    } else {
        state.dailyChecklist[today] = state.dailyChecklist[today].filter(id => id !== taskId);
    }
    
    saveState();
    renderChecklist();
    checkAchievements();
}

// --- Journal System ---
function saveJournalEntry(inputElement) {
    const text = inputElement.value.trim();
    if (!text) return;

    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        text: text
    };

    state.journalEntries.unshift(entry);
    logActivity('journal', 'New journal entry added');
    saveState();
    
    inputElement.value = '';
    
    // Refresh Journal View
    renderJournalHistory();
    updateAnalytics();
    checkAchievements();
    
    // Visual Feedback (Toast)
    const originalText = inputElement.nextElementSibling.innerText;
    // Simplistic: assuming button is next sibling or close.
    // Actually we passed the input, finding button is tricky unless we passed it too.
    // Let's just reload the list and maybe show an alert or simple anime effect.
    alert("Entry Logged.");
}

function renderJournalHistory() {
    els.totalEntriesCount.innerText = state.journalEntries.length;
    
    if (state.journalEntries.length === 0) {
        els.journalHistoryList.innerHTML = `
            <div class="text-center py-12 text-gray-600">
                <i class="fa-solid fa-wind text-4xl mb-4 opacity-50"></i>
                <p>No records found. Begin your story.</p>
            </div>`;
        return;
    }

    els.journalHistoryList.innerHTML = '';

    state.journalEntries.forEach(entry => {
        const date = moment(entry.date);

        // Create elements programmatically to avoid XSS
        const entryDiv = document.createElement('div');
        entryDiv.className = 'bg-surface border border-glassBorder rounded-xl p-4 hover:bg-white/5 transition-colors';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex justify-between items-start mb-2';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'text-accent text-xs font-mono';
        dateSpan.textContent = date.format('MMM D, YYYY @ h:mm A');

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-gray-600 hover:text-red-500 transition-colors';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.onclick = () => deleteEntry(entry.id);

        headerDiv.appendChild(dateSpan);
        headerDiv.appendChild(deleteBtn);

        const textP = document.createElement('p');
        textP.className = 'text-gray-300 text-sm whitespace-pre-wrap';
        textP.textContent = entry.text; // Safe text insertion

        entryDiv.appendChild(headerDiv);
        entryDiv.appendChild(textP);

        els.journalHistoryList.appendChild(entryDiv);
    });
}

window.deleteEntry = function(id) {
    if(confirm('Delete this entry?')) {
        state.journalEntries = state.journalEntries.filter(e => e.id !== id);
        saveState();
        renderJournalHistory();
    }
};

// --- Emergency Mode ---
let breathInterval;

function triggerEmergency() {
    state.panicButtonUses++;
    logActivity('panic', 'Emergency protocol activated');
    saveState();
    updateAnalytics();

    els.emergencyOverlay.style.pointerEvents = 'auto';
    els.emergencyOverlay.style.opacity = '1';
    els.breathCircle.classList.add('breathing-active');
    
    const cycle = () => {
        // 4-7-8 Breathing Technique
        // Inhale: 4s, Hold: 7s, Exhale: 8s = Total 19s

        els.breathText.innerText = "INHALE (4s)";
        els.breathCircle.style.transition = 'transform 4s ease-in-out, opacity 4s ease-in-out';
        els.breathCircle.style.transform = 'scale(1.2)';
        els.breathCircle.style.opacity = '1';

        setTimeout(() => {
            els.breathText.innerText = "HOLD (7s)";
            // Hold state - maintain scale
        }, 4000);

        setTimeout(() => {
            els.breathText.innerText = "EXHALE (8s)";
            els.breathCircle.style.transition = 'transform 8s ease-in-out, opacity 8s ease-in-out';
            els.breathCircle.style.transform = 'scale(0.8)';
            els.breathCircle.style.opacity = '0.7';
        }, 11000); // 4 + 7
    };
    
    cycle();
    breathInterval = setInterval(cycle, 19000); // 4 + 7 + 8 = 19s
}

function closeEmergency() {
    els.emergencyOverlay.style.pointerEvents = 'none';
    els.emergencyOverlay.style.opacity = '0';
    els.breathCircle.classList.remove('breathing-active');
    clearInterval(breathInterval);
}

// --- Meditation Logic ---
let medInterval;
let medTimeLeft = 600; // 10 minutes in seconds
let medIsRunning = false;
let medTotalDuration = 600;

function openMeditationModal() {
    const modal = document.getElementById('meditation-overlay');
    modal.style.pointerEvents = 'auto';
    modal.style.opacity = '1';
}

function closeMeditationModal() {
    const modal = document.getElementById('meditation-overlay');
    modal.style.pointerEvents = 'none';
    modal.style.opacity = '0';
    if (medIsRunning) toggleMeditationTimer(); // Pause if running
}

function toggleMeditationTimer() {
    const btn = document.getElementById('meditation-start-btn');
    const icon = btn.querySelector('i');

    if (medIsRunning) {
        clearInterval(medInterval);
        medIsRunning = false;
        icon.className = 'fa-solid fa-play text-xl ml-1';
        document.getElementById('meditation-status').innerText = 'PAUSED';
    } else {
        medIsRunning = true;
        icon.className = 'fa-solid fa-pause text-xl';
        document.getElementById('meditation-status').innerText = 'SYNCING...';

        medInterval = setInterval(() => {
            medTimeLeft--;
            updateMeditationUI();

            if (medTimeLeft <= 0) {
                completeMeditation();
            }
        }, 1000);
    }
}

function resetMeditationTimer() {
    if (medIsRunning) toggleMeditationTimer();
    medTimeLeft = medTotalDuration;
    updateMeditationUI();
    document.getElementById('meditation-status').innerText = 'READY';
    // Reset ring animation
    document.getElementById('meditation-ring').style.animation = 'none';
}

function updateMeditationUI() {
    const mins = Math.floor(medTimeLeft / 60);
    const secs = medTimeLeft % 60;
    document.getElementById('meditation-timer').innerText = `${pad(mins)}:${pad(secs)}`;

    // Update ring progress (optional visual flair)
    // For now simple rotation or just leave it
}

function completeMeditation() {
    clearInterval(medInterval);
    medIsRunning = false;
    document.getElementById('meditation-status').innerText = 'COMPLETE';
    document.getElementById('meditation-status').classList.remove('animate-pulse');

    // Play sound
    const audio = document.getElementById('bell-sound');
    if (audio) audio.play();

    // Auto-check task
    if (!state.dailyChecklist[moment().format('YYYY-MM-DD')]) {
        state.dailyChecklist[moment().format('YYYY-MM-DD')] = [];
    }
    if (!state.dailyChecklist[moment().format('YYYY-MM-DD')].includes('meditate')) {
        toggleTask('meditate', true);
        confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#fbbf24']
        });
    }

    // Auto close after delay
    setTimeout(() => {
        closeMeditationModal();
        resetMeditationTimer();
    }, 4000);
}

// --- Chart Logic ---
function initChart() {
    const ctx = document.getElementById('recoveryChart').getContext('2d');
    charts.recovery = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => `Day ${i+1}`),
            datasets: [{
                label: 'Dopamine Baseline',
                data: Array.from({length: 30}, (_, i) => Math.log(i+1) * 20 + 10),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            interaction: { intersect: false, mode: 'index' },
        }
    });
}

// --- Analytics System ---
function initAnalytics() {
    updateAnalytics();
    renderHeatmap();
    initStreakChart();
    initTaskChart();
}

function updateAnalytics() {
    // Update stat cards
    els.statRelapses.innerText = state.relapseHistory.length;
    els.statCheckins.innerText = state.totalCheckins;
    els.statJournals.innerText = state.journalEntries.length;
    els.statPanic.innerText = state.panicButtonUses;

    // Update activity timeline
    renderActivityTimeline();
    
    // Update insights
    renderInsights();

    // Update charts
    if (charts.streak) updateStreakChart();
    if (charts.task) updateTaskChart();
}

function initStreakChart() {
    const ctx = document.getElementById('streakChart').getContext('2d');
    const last30Days = Array.from({length: 30}, (_, i) => {
        const date = moment().subtract(29 - i, 'days').format('YYYY-MM-DD');
        return { date, streak: state.streakHistory[date] || 0 };
    });

    charts.streak = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last30Days.map(d => moment(d.date).format('MMM D')),
            datasets: [{
                label: 'Streak Days',
                data: last30Days.map(d => d.streak),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#06b6d4',
                    bodyColor: '#fff'
                }
            },
            scales: { 
                x: { 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#6b7280' }
                }, 
                y: { 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#6b7280' }
                } 
            }
        }
    });
}

function updateStreakChart() {
    if (!charts.streak) return;
    const last30Days = Array.from({length: 30}, (_, i) => {
        const date = moment().subtract(29 - i, 'days').format('YYYY-MM-DD');
        return state.streakHistory[date] || 0;
    });
    charts.streak.data.datasets[0].data = last30Days;
    charts.streak.update();
}

function initTaskChart() {
    const ctx = document.getElementById('taskChart').getContext('2d');
    const taskStats = CONFIG.dailyTasks.map(task => {
        let count = 0;
        Object.values(state.dailyChecklist).forEach(tasks => {
            if (tasks.includes(task.id)) count++;
        });
        return count;
    });

    charts.task = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: CONFIG.dailyTasks.map(t => t.text),
            datasets: [{
                data: taskStats,
                backgroundColor: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', padding: 15 }
                }
            }
        }
    });
}

function updateTaskChart() {
    if (!charts.task) return;
    const taskStats = CONFIG.dailyTasks.map(task => {
        let count = 0;
        Object.values(state.dailyChecklist).forEach(tasks => {
            if (tasks.includes(task.id)) count++;
        });
        return count;
    });
    charts.task.data.datasets[0].data = taskStats;
    charts.task.update();
}

function renderActivityTimeline() {
    if (state.activityLog.length === 0) {
        els.activityTimeline.innerHTML = '<div class="text-center py-8 text-gray-600 text-sm">No activity yet</div>';
        return;
    }

    els.activityTimeline.innerHTML = state.activityLog.slice(0, 10).map(log => {
        const icons = {
            checkin: 'fa-check-double text-success',
            journal: 'fa-pen text-secondary',
            panic: 'fa-triangle-exclamation text-danger',
            relapse: 'fa-arrow-rotate-left text-red-500'
        };
        return `
            <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-glass transition-colors">
                <div class="w-8 h-8 rounded-full bg-glassBorder flex items-center justify-center shrink-0">
                    <i class="fa-solid ${icons[log.type]} text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-300">${log.description}</p>
                    <p class="text-xs text-gray-600">${moment(log.timestamp).fromNow()}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderInsights() {
    const insights = [];
    const currentStreak = Math.floor(moment.duration(moment().diff(moment(state.startDate))).asDays());
    
    if (currentStreak >= 7) {
        insights.push({ type: 'success', text: `🔥 ${currentStreak} day streak! You're in the top 10% of users.` });
    }
    
    if (state.relapseHistory.length > 0) {
        const avgStreak = state.relapseHistory.reduce((sum, r) => sum + r.daysBefore, 0) / state.relapseHistory.length;
        if (currentStreak > avgStreak) {
            insights.push({ type: 'success', text: `📈 Current streak exceeds your average by ${Math.floor(currentStreak - avgStreak)} days!` });
        }
    }

    if (state.totalCheckins > 20) {
        insights.push({ type: 'info', text: `✅ ${state.totalCheckins} check-ins completed. Consistency is key!` });
    }

    if (state.panicButtonUses > 5) {
        insights.push({ type: 'warning', text: `⚠️ High panic button usage. Consider meditation or exercise.` });
    }

    if (insights.length === 0) {
        insights.push({ type: 'info', text: '💪 Keep building your streak to unlock insights!' });
    }

    els.insightsPanel.innerHTML = insights.map(i => `
        <div class="bg-glass border border-glassBorder rounded-lg p-3">
            <p class="text-sm text-gray-300">${i.text}</p>
        </div>
    `).join('');
}

function renderHeatmap() {
    const weeks = 20;
    const days = weeks * 7;
    const startDate = moment().subtract(days, 'days');
    
    let html = '';
    for (let week = 0; week < weeks; week++) {
        html += '<div class="flex flex-col gap-1">';
        for (let day = 0; day < 7; day++) {
            const date = moment(startDate).add(week * 7 + day, 'days');
            const dateStr = date.format('YYYY-MM-DD');
            const streak = state.streakHistory[dateStr] || 0;
            
            let intensity = 'bg-glassBorder';
            if (streak > 0) intensity = 'bg-accent/20';
            if (streak > 3) intensity = 'bg-accent/50';
            if (streak > 7) intensity = 'bg-accent/80';
            if (streak > 14) intensity = 'bg-accent';
            
            html += `<div class="w-3 h-3 ${intensity} rounded-sm" title="${date.format('MMM D')}: ${streak} days"></div>`;
        }
        html += '</div>';
    }
    
    els.heatmapGrid.innerHTML = html;
}

// --- Export/Import ---
function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purity-protocol-backup-${moment().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('export', 'Data exported successfully');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (confirm('This will overwrite all current data. Continue?')) {
                state = imported;
                saveState();
                location.reload();
            }
        } catch (err) {
            alert('Invalid backup file');
        }
    };
    reader.readAsText(file);
}

// --- Achievements System ---
function checkAchievements() {
    let newUnlocks = [];
    CONFIG.achievements.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id) && ach.condition(state)) {
            state.unlockedAchievements.push(ach.id);
            newUnlocks.push(ach);
        }
    });
    
    if (newUnlocks.length > 0) {
        saveState();
        newUnlocks.forEach(ach => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#fbbf24', '#f59e0b', '#ffffff']
            });
            logActivity('achievement', `Unlocked: ${ach.name}`);
        });
    }
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = CONFIG.achievements.map(ach => {
        const unlocked = state.unlockedAchievements.includes(ach.id);
        return `
            <div class="bg-surface border border-glassBorder rounded-2xl p-6 ${unlocked ? '' : 'opacity-50'} transition-all hover:scale-105">
                <div class="flex items-start gap-4">
                    <div class="w-16 h-16 rounded-full ${unlocked ? 'bg-gradient-to-br from-gold to-yellow-600' : 'bg-glassBorder'} flex items-center justify-center shrink-0">
                        <i class="fa-solid ${ach.icon} text-2xl ${unlocked ? 'text-white' : 'text-gray-600'}"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-white font-bold mb-1">${ach.name}</h4>
                        <p class="text-sm text-gray-400">${ach.desc}</p>
                        ${unlocked ? '<span class="inline-block mt-2 px-2 py-1 bg-gold/20 text-gold text-xs rounded-full">UNLOCKED</span>' : '<span class="inline-block mt-2 px-2 py-1 bg-glassBorder text-gray-600 text-xs rounded-full">LOCKED</span>'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- Leaderboard System ---
function renderLeaderboard() {
    const currentStreak = getCurrentStreak(state);
    const userBadges = state.unlockedAchievements.length;
    
    // Mock leaderboard data
    const mockUsers = [
        { name: 'ShadowWarrior', streak: 156, checkins: 142, badges: 8 },
        { name: 'PhoenixRising', streak: 134, checkins: 128, badges: 7 },
        { name: 'IronMind', streak: 98, checkins: 95, badges: 6 },
        { name: 'ZenMaster', streak: 87, checkins: 84, badges: 6 },
        { name: 'NightHawk', streak: 76, checkins: 71, badges: 5 },
        { name: 'StormBreaker', streak: 65, checkins: 62, badges: 5 },
        { name: 'SilentGuardian', streak: 54, checkins: 51, badges: 4 },
        { name: 'VoidWalker', streak: 43, checkins: 40, badges: 4 },
        { name: 'CyberMonk', streak: 32, checkins: 30, badges: 3 },
        { name: 'QuantumLeap', streak: 21, checkins: 20, badges: 3 }
    ];
    
    // Add user to list
    const userEntry = { name: state.profile.username, streak: currentStreak, checkins: state.totalCheckins, badges: userBadges };
    const allUsers = [...mockUsers, userEntry].sort((a, b) => b.streak - a.streak);
    const userRank = allUsers.findIndex(u => u.name === state.profile.username) + 1;
    
    // Update user stats
    document.getElementById('user-rank').innerText = `#${userRank}`;
    document.getElementById('user-streak-display').innerText = currentStreak;
    document.getElementById('user-checkins-display').innerText = state.totalCheckins;
    document.getElementById('user-badges-display').innerText = userBadges;
    
    // Render list
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    
    list.innerHTML = allUsers.slice(0, 10).map((user, idx) => {
        const isUser = user.name === state.profile.username;
        const medals = ['🥇', '🥈', '🥉'];
        return `
            <div class="flex items-center justify-between p-3 rounded-lg ${isUser ? 'bg-accent/10 border border-accent/30' : 'bg-glass'} transition-colors">
                <div class="flex items-center gap-4">
                    <span class="text-2xl w-8 text-center">${medals[idx] || `#${idx + 1}`}</span>
                    <div>
                        <p class="text-white font-medium ${isUser ? 'text-accent' : ''}">${user.name}</p>
                        <p class="text-xs text-gray-500">${user.checkins} check-ins • ${user.badges} badges</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xl font-bold text-white">${user.streak}</p>
                    <p class="text-xs text-gray-500">days</p>
                </div>
            </div>
        `;
    }).join('');
}

// --- Profile System ---
function updateProfileUI() {
    // Sidebar
    document.getElementById('sidebar-username').innerText = state.profile.username;
    document.getElementById('sidebar-avatar').className = `fa-solid ${state.profile.avatar} text-xl text-gray-300`;
    
    // Addiction badges in sidebar
    const sidebarAddictions = document.getElementById('sidebar-addictions');
    if (sidebarAddictions) {
        sidebarAddictions.innerHTML = state.profile.addictionTypes.map(type => {
            const addiction = CONFIG.addictionTypes.find(a => a.id === type);
            if (addiction) {
                return `<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-glassBorder text-gray-400 border border-white/5 uppercase">${addiction.name.split(' ')[0]}</span>`;
            }
            return `<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-glassBorder text-gray-400 border border-white/5 uppercase">${type}</span>`;
        }).join('');
    }
}

function renderProfileSettings() {
    // Username input
    document.getElementById('username-input').value = state.profile.username;
    
    // Avatar grid
    const avatarGrid = document.getElementById('avatar-grid');
    if (avatarGrid) {
        avatarGrid.innerHTML = CONFIG.avatars.map(icon => {
            const selected = state.profile.avatar === icon;
            return `
                <button class="avatar-option w-12 h-12 rounded-lg ${selected ? 'bg-accent text-void' : 'bg-glassBorder text-gray-400 hover:bg-white/10'} flex items-center justify-center transition-colors" data-avatar="${icon}">
                    <i class="fa-solid ${icon} text-xl"></i>
                </button>
            `;
        }).join('');
        
        // Add click handlers
        document.querySelectorAll('.avatar-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(b => {
                    b.classList.remove('bg-accent', 'text-void');
                    b.classList.add('bg-glassBorder', 'text-gray-400');
                });
                btn.classList.remove('bg-glassBorder', 'text-gray-400');
                btn.classList.add('bg-accent', 'text-void');
            });
        });
    }
    
    // Addiction checkboxes
    const checkboxContainer = document.getElementById('addiction-checkboxes');
    if (checkboxContainer) {
        checkboxContainer.innerHTML = CONFIG.addictionTypes.map(addiction => {
            const checked = state.profile.addictionTypes.includes(addiction.id);
            return `
                <label class="flex items-center gap-3 p-3 rounded-lg bg-glass hover:bg-glassHigh border border-glassBorder cursor-pointer transition-colors">
                    <input type="checkbox" class="addiction-checkbox custom-checkbox" data-addiction="${addiction.id}" ${checked ? 'checked' : ''}>
                    <i class="fa-solid ${addiction.icon}" style="color: ${addiction.color}"></i>
                    <span class="text-sm text-gray-300">${addiction.name}</span>
                </label>
            `;
        }).join('');
        
        // Add custom addictions
        state.profile.addictionTypes.forEach(type => {
            if (!CONFIG.addictionTypes.find(a => a.id === type)) {
                checkboxContainer.innerHTML += `
                    <label class="flex items-center gap-3 p-3 rounded-lg bg-glass hover:bg-glassHigh border border-glassBorder cursor-pointer transition-colors">
                        <input type="checkbox" class="addiction-checkbox custom-checkbox" data-addiction="${type}" checked>
                        <i class="fa-solid fa-circle" style="color: #6b7280"></i>
                        <span class="text-sm text-gray-300">${type}</span>
                        <button class="ml-auto text-red-500 hover:text-red-400" onclick="removeCustomAddiction('${type}')">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </label>
                `;
            }
        });
    }
}

function saveProfile() {
    // Get username
    state.profile.username = document.getElementById('username-input').value.trim() || 'Warrior';
    
    // Get selected avatar
    const selectedAvatar = document.querySelector('.avatar-option.bg-accent');
    if (selectedAvatar) {
        state.profile.avatar = selectedAvatar.dataset.avatar;
    }
    
    // Get selected addictions
    const checkedBoxes = document.querySelectorAll('.addiction-checkbox:checked');
    state.profile.addictionTypes = Array.from(checkedBoxes).map(cb => cb.dataset.addiction);
    
    saveState();
    updateProfileUI();
    logActivity('profile', 'Profile updated');
    
    alert('Profile saved!');
}

function addCustomAddiction() {
    const input = document.getElementById('custom-addiction');
    const value = input.value.trim();
    if (value && !state.profile.addictionTypes.includes(value)) {
        state.profile.addictionTypes.push(value);
        input.value = '';
        renderProfileSettings();
    }
}

window.removeCustomAddiction = function(type) {
    state.profile.addictionTypes = state.profile.addictionTypes.filter(t => t !== type);
    renderProfileSettings();
};