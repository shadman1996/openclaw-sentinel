document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const elements = {
        toastContainer: document.getElementById('toast-container'),
        killBtn: document.getElementById('kill-all-btn'),
        navItems: document.querySelectorAll('.nav-item'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        pageTitle: document.getElementById('page-title'),
        activeProcs: document.getElementById('active-procs'),
        logsList: document.getElementById('logs-list'),
        
        // Performance Elements
        cpuSideVal: document.getElementById('cpu-side-val'),
        memSideVal: document.getElementById('mem-side-val'),
        netSideVal: document.getElementById('net-side-val'),
        cpuMainVal: document.getElementById('cpu-main-val'),
        netMainVal: document.getElementById('net-main-val'),
        healthScoreVal: document.getElementById('health-score-val'),
        
        // Scan Elements
        scanFeedback: document.getElementById('scan-feedback'),
        scanStatusText: document.getElementById('scan-status-text'),
        scanProgress: document.getElementById('scan-progress'),
        scanThreats: document.getElementById('scan-threats-found'),
        scanBtns: document.querySelectorAll('.sys-btn.primary') // Just disabled on scan running
    };

    let lastLogId = 0;

    // --- Tab Navigation ---
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            elements.tabPanes.forEach(pane => pane.classList.remove('active-tab'));
            
            // Allow clicking SVG path safely
            const targetEl = e.target.closest('.nav-item');
            targetEl.classList.add('active');
            
            const targetTab = targetEl.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active-tab');
            elements.pageTitle.innerText = targetEl.getAttribute('title');
        });
    });

    // --- Action Handlers ---
    elements.killBtn.addEventListener('click', async () => {
        elements.killBtn.innerText = "Ending tasks...";
        try {
            const res = await fetch('/api/action/kill_process', { method: 'POST' });
            if(res.ok) showToast("Rogue background tasks successfully killed.", "var(--health-good)");
        } catch(e) {}
        setTimeout(() => elements.killBtn.innerText = "End Rogue Tasks", 1500);
    });
    
    // PC Cleaner Button
    const cleanTempBtn = document.getElementById('clean-temp-btn');
    if(cleanTempBtn) {
        cleanTempBtn.addEventListener('click', async () => {
            cleanTempBtn.innerText = "Cleaning system files...";
            cleanTempBtn.disabled = true;
            try {
                const res = await fetch('/api/action/clean_temp', { method: 'POST' });
                const json = await res.json();
                
                const feedbackBox = document.getElementById('tuneup-feedback');
                const savedText = document.getElementById('tuneup-saved-text');
                
                feedbackBox.style.display = 'block';
                savedText.innerText = json.message;
                showToast(json.message, "var(--health-good)");
                
            } catch(e) { showToast("Cleanup failed.", "var(--health-crit)"); }
            
            setTimeout(() => {
                cleanTempBtn.innerText = "Clean Junk Files Instantly";
                cleanTempBtn.disabled = false;
            }, 3000);
        });
    }

    window.startScan = async function(type) {
        try {
            const res = await fetch(`/api/action/scan/${type}`, { method: 'POST' });
            if(res.ok) {
                elements.scanFeedback.style.display = 'block';
                elements.scanStatusText.innerText = `Running ${type} engine scan...`;
                document.querySelectorAll('.scan-card .sys-btn').forEach(b => b.disabled = true);
            }
        } catch(e) {}
    };

    function showToast(message, color = "var(--text-primary)") {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderColor = color;
        toast.innerHTML = `<strong style="color: ${color}">System Notice:</strong> ${message}`;
        elements.toastContainer.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3500);
    }

    // --- Offline Native Canvas Graph Engine ---
    // Zero dependencies to fix horizontal expansion bugs & offline crashes
    const canvas = document.getElementById('customGraphCanvas');
    const ctx = canvas.getContext('2d');
    
    // Resize observer binds canvas strictly to the flex container dimensions
    const resizeCanvas = () => {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const maxDataPoints = 60; // 60 seconds
    let cpuHistory = Array(maxDataPoints).fill(0);

    function drawGraph() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#0078D4'; // Windows accent
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 120, 212, 0.15)'; // Fill below
        
        ctx.beginPath();
        const stepX = canvas.width / (maxDataPoints - 1);
        
        // Move to start point for the fill area (bottom left)
        ctx.moveTo(0, canvas.height);
        
        for (let i = 0; i < maxDataPoints; i++) {
            const val = cpuHistory[i];
            const x = i * stepX;
            // Map 0-100 to Canvas Height
            const y = canvas.height - (val / 100 * canvas.height);
            ctx.lineTo(x, y);
        }
        
        // Close the fill path strictly
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Stroke line
        ctx.beginPath();
        for (let i = 0; i < maxDataPoints; i++) {
            const val = cpuHistory[i];
            const x = i * stepX;
            const y = canvas.height - (val / 100 * canvas.height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // --- Core Data Sync ---
    function updateDashboard(data) {
        const tel = data.telemetry;
        
        // Status Indicators
        elements.activeProcs.innerText = tel.active_processes;
        
        // Push to custom graph array
        cpuHistory.push(tel.cpu_usage);
        cpuHistory.shift(); 
        drawGraph(); // Re-render canvas immediately
        
        // Side metrics
        elements.cpuSideVal.innerText = `${tel.cpu_usage}%`;
        elements.cpuMainVal.innerText = `${tel.cpu_usage}%`;
        
        elements.memSideVal.innerText = `${tel.memory_usage}%`;
        
        elements.netSideVal.innerText = `${tel.network_connections} Conn`;
        elements.netMainVal.innerText = tel.network_connections;
        
        elements.healthScoreVal.innerText = tel.system_health === 100 ? "Healthy" : tel.system_health + "%";
        if (tel.system_health < 80) elements.healthScoreVal.style.color = "var(--health-warn)";

        // Logs Injection
        elements.logsList.innerHTML = '';
        if (tel.recent_logs.length === 0) {
            elements.logsList.innerHTML = '<div class="log-entry">Waiting for OpenClaw daemon...</div>';
        }

        tel.recent_logs.forEach(log => {
            const logEl = document.createElement('div');
            logEl.className = 'log-entry';
            
            let statusBadge = "bg-info";
            let statusText = "Normal";
            
            if(log.level === 'CRIT'){ statusBadge = "bg-crit"; statusText = "Suspended"; }
            else if(log.level === 'WARN'){ statusBadge = "bg-warn"; statusText = "Monitored"; }
            
            logEl.innerHTML = `
                <div class="col-name" style="font-family: monospace;">${log.message.substring(0, 60)}</div>
                <div class="col-status"><span class="status-badge ${statusBadge}">${statusText}</span></div>
                <div class="col-pid">${log.level === 'INFO' ? '-' : 'Quarantine Engine Engaged'}</div>
            `;
            elements.logsList.appendChild(logEl);
        });

        // Scan Updates
        if (data.scan.is_scanning) {
            elements.scanFeedback.style.display = 'block';
            elements.scanProgress.style.width = `${data.scan.progress}%`;
            elements.scanThreats.innerText = `Threats identified: ${data.scan.threats_found}`;
        } else if (elements.scanProgress.style.width === '100%') {
            elements.scanStatusText.innerText = "Scan Complete.";
            document.querySelectorAll('.scan-card .sys-btn').forEach(b => b.disabled = false);
            setTimeout(() => elements.scanFeedback.style.display = 'none', 3000);
            elements.scanProgress.style.width = '0%';
        }

        // Toasts
        if (tel.recent_logs.length > 0) {
            const newest = tel.recent_logs[0];
            if (newest.id > lastLogId) {
                if (newest.level === 'CRIT') showToast(newest.message);
                lastLogId = newest.id;
            }
        }
    }

    // Interval fetcher
    setInterval(async () => {
        try {
            const response = await fetch('/api/telemetry');
            if (response.ok) updateDashboard(await response.json());
        } catch (error) {}
    }, 1000);
});
