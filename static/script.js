document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const elements = {
        healthScore: document.getElementById('health-score'),
        healthBadge: document.getElementById('health-badge'),
        healthCircle: document.getElementById('health-circle'),
        cpuVal: document.getElementById('cpu-val'),
        cpuBar: document.getElementById('cpu-bar'),
        memVal: document.getElementById('mem-val'),
        memBar: document.getElementById('mem-bar'),
        anomalyCount: document.getElementById('anomaly-count'),
        logsList: document.getElementById('logs-list'),
        toastContainer: document.getElementById('toast-container'),
        killBtn: document.getElementById('kill-all-btn'),
        filterBtns: document.querySelectorAll('.filter-btn')
    };

    let currentLogs = [];
    let currentFilter = 'all';
    let lastLogId = 0;

    // Filter Logic
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderLogs();
        });
    });

    // Kill/Terminate Processes Feature
    elements.killBtn.addEventListener('click', async () => {
        elements.killBtn.innerText = "Terminating...";
        elements.killBtn.style.opacity = '0.7';
        elements.killBtn.style.pointerEvents = 'none';

        try {
            const res = await fetch('/api/action/kill_process', { method: 'POST' });
            if(res.ok) {
                showToast("CRITICAL: Rogue tasks terminated successfully.", "var(--health-good)");
            }
        } catch(e) {
            console.error("Failed to terminate process.");
        }

        setTimeout(() => {
            elements.killBtn.innerText = "Terminate Rogue OpenClaw Tasks";
            elements.killBtn.style.opacity = '1';
            elements.killBtn.style.pointerEvents = 'all';
        }, 1500);
    });

    function showToast(message, color = "var(--health-crit)") {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderColor = color;
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="${color}" stroke-width="2" fill="none">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div>${message}</div>
        `;
        elements.toastContainer.appendChild(toast);
        
        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function renderLogs() {
        elements.logsList.innerHTML = '';
        
        const filtered = currentLogs.filter(log => {
            if (currentFilter === 'all') return true;
            return log.level === currentFilter;
        });

        if (filtered.length === 0) {
            elements.logsList.innerHTML = '<div class="log-entry" style="justify-content:center; color: var(--text-secondary);">No logs found for current filter.</div>';
            return;
        }

        filtered.forEach(log => {
            const logEl = document.createElement('div');
            logEl.className = `log-entry level-${log.level}`;
            logEl.innerHTML = `
                <div class="log-time">${log.timestamp}</div>
                <div class="log-tag tag-${log.level}">${log.level}</div>
                <div class="log-msg">${log.message}</div>
            `;
            elements.logsList.appendChild(logEl);
        });
    }

    function updateDashboard(data) {
        // Update Health Score
        elements.healthScore.textContent = `${data.system_health}%`;
        
        // Map 0-100 to stroke-dasharray (circumference is ~100)
        elements.healthCircle.setAttribute('stroke-dasharray', `${data.system_health}, 100`);
        
        // Change colors globally based on health
        if (data.system_health > 80) {
            elements.healthCircle.style.stroke = "var(--health-good)";
            elements.healthBadge.style.color = "var(--health-good)";
            elements.healthBadge.innerText = "Optimal";
        } else if (data.system_health > 40) {
            elements.healthCircle.style.stroke = "var(--health-warn)";
            elements.healthBadge.style.color = "var(--health-warn)";
            elements.healthBadge.innerText = "Warning";
        } else {
            elements.healthCircle.style.stroke = "var(--health-crit)";
            elements.healthBadge.style.color = "var(--health-crit)";
            elements.healthBadge.innerText = "Critical";
            elements.healthScore.style.fill = "var(--health-crit)";
            elements.healthCircle.style.animation = "blink 1s infinite alternate";
        }

        if (data.system_health > 40) {
             elements.healthScore.style.fill = "#fff";
             elements.healthCircle.style.animation = "none";
        }

        // Update CPU/Mem
        elements.cpuVal.innerText = data.cpu_usage;
        elements.cpuBar.style.width = `${data.cpu_usage}%`;
        elements.cpuBar.style.backgroundColor = data.cpu_usage > 85 ? "var(--health-crit)" : (data.cpu_usage > 65 ? "var(--health-warn)" : "var(--primary-blue)");

        elements.memVal.innerText = data.memory_usage;
        elements.memBar.style.width = `${data.memory_usage}%`;
        elements.memBar.style.backgroundColor = data.memory_usage > 85 ? "var(--health-crit)" : (data.memory_usage > 65 ? "var(--health-warn)" : "var(--accent-cyan)");

        // Update Anomaly Count
        elements.anomalyCount.innerText = data.anomalies.length;
        if(data.anomalies.length > 0) {
            elements.anomalyCount.classList.add('warn-text');
        } else {
            elements.anomalyCount.classList.remove('warn-text');
        }

        // Update Logs
        currentLogs = data.recent_logs;
        renderLogs();

        // Check for new critical/warn logs to show Toast
        if (data.recent_logs.length > 0) {
            const newestLog = data.recent_logs[0];
            if (newestLog.id > lastLogId) {
                if (newestLog.level === 'CRIT' || newestLog.level === 'WARN') {
                    showToast(`[${newestLog.level}]: ${newestLog.message}`, newestLog.level === 'CRIT' ? "var(--health-crit)" : "var(--health-warn)");
                }
                lastLogId = newestLog.id;
            }
        }
    }

    // Polling function for live telemetry feeds
    async function fetchTelemetry() {
        try {
            const response = await fetch('/api/telemetry');
            if (response.ok) {
                const data = await response.json();
                updateDashboard(data);
            }
        } catch (error) {
            console.error('Error fetching telemetry:', error);
            elements.healthBadge.innerText = "Offline";
            elements.healthBadge.style.color = "var(--text-secondary)";
            elements.healthCircle.style.stroke = "var(--text-secondary)";
        }
    }

    // Start Polling every 1.5 seconds
    setInterval(fetchTelemetry, 1500);
    fetchTelemetry(); // Initial fetch
});
