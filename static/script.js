document.addEventListener("DOMContentLoaded", () => {
    // --- Mobile Responsive Nav ---
    const navToggle = document.getElementById('navToggle');
    const sidebar = document.getElementById('sidebar');
    if(navToggle) {
        navToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // --- Tab Controller (desktop sidebar + mobile bottom nav) ---
    function switchTab(targetTab) {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active-tab'));
        document.getElementById(targetTab).classList.add('active-tab');
        // Sync active state on both nav sets
        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.toggle('active', n.getAttribute('data-tab') === targetTab);
        });
        document.querySelectorAll('.mob-nav-item').forEach(n => {
            n.classList.toggle('active', n.getAttribute('data-tab') === targetTab);
        });
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            switchTab(e.currentTarget.getAttribute('data-tab'));
            if (window.innerWidth <= 768) { sidebar.classList.remove('show'); }
        });
    });

    document.querySelectorAll('.mob-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            switchTab(e.currentTarget.getAttribute('data-tab'));
        });
    });

    // --- Chart.js Configuration Stack (Task Manager Style) ---
    Chart.defaults.color = '#6b7a99';
    Chart.defaults.font.family = '"Roboto Mono", monospace';

    const MAX_PTS = 60; // 30-second rolling window at 500ms

    // Gradient fill created dynamically from actual chartArea bounds — mirrors Task Manager fill
    function makeGradient(chart, topRgba, botRgba) {
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return topRgba;
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, topRgba);
        g.addColorStop(1, botRgba);
        return g;
    }

    function createChart(canvasId, lineColor, topRgba, botRgba, yMax, showPercent) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(MAX_PTS).fill(''),
                datasets: [{
                    data: Array(MAX_PTS).fill(0),
                    borderColor: lineColor,
                    backgroundColor: function(context) {
                        return makeGradient(context.chart, topRgba, botRgba);
                    },
                    borderWidth: 2,
                    tension: 0.25,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: {
                        min: 0,
                        max: yMax || 100,
                        grid: { color: 'rgba(255,255,255,0.07)' },
                        ticks: {
                            color: '#6b7a99',
                            font: { size: 10, family: '"Roboto Mono", monospace' },
                            maxTicksLimit: 5,
                            callback: (v) => showPercent ? v + '%' : v
                        },
                        border: { display: false }
                    }
                }
            }
        });
    }

    const charts = {
        cpu:  createChart('cpuChart',  '#00ff88', 'rgba(0,255,136,0.45)',  'rgba(0,255,136,0.02)',   100, true),
        ram:  createChart('ramChart',  '#00c8ff', 'rgba(0,200,255,0.45)',  'rgba(0,200,255,0.02)',   100, true),
        gpu:  createChart('gpuChart',  '#ff9900', 'rgba(255,153,0,0.45)',  'rgba(255,153,0,0.02)',   100, true),
        disk: createChart('diskChart', '#ff3366', 'rgba(255,51,102,0.45)', 'rgba(255,51,102,0.02)',   20, false),
        net:  createChart('netChart',  '#ffcc00', 'rgba(255,204,0,0.45)',  'rgba(255,204,0,0.02)',    10, false)
    };

    // Render per-core CPU mini-bars (like Task Manager's CPU graph grid option)
    function renderCoreBars(coreLoads) {
        const container = document.getElementById('cpu-core-bars');
        if (!container || !coreLoads || !coreLoads.length) return;

        if (container.children.length !== coreLoads.length) {
            container.innerHTML = coreLoads.map((_, i) => `
                <div class="core-bar-wrap">
                    <div class="core-bar-track">
                        <div class="core-bar-fill" id="cb-${i}"></div>
                    </div>
                    <span class="core-bar-lbl">C${i}</span>
                </div>
            `).join('');
        }

        coreLoads.forEach((load, i) => {
            const fill = document.getElementById(`cb-${i}`);
            if (fill) fill.style.height = Math.min(100, Math.max(0, load)) + '%';
        });
    }

    function updateChartData(chartInstance, newValue, dynamicY = false) {
        const dataArray = chartInstance.data.datasets[0].data;
        dataArray.push(newValue);
        dataArray.shift();

        if (dynamicY) {
            // Recalculate ceiling to keep graph visually tight
            const currentMax = Math.max(...dataArray);
            chartInstance.options.scales.y.max = currentMax > 5 ? currentMax * 1.5 : 5;
        }

        chartInstance.update();
    }

    // Helpers for mobile tile updates
    function setMob(id, val) {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    }
    function setMobBar(id, pct) {
        const el = document.getElementById(id);
        if (el) el.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    // --- Master Telemetry Matrix ---
    async function pollTelemetry() {
        try {
            const response = await fetch('/api/telemetry');
            if (response.ok) {
                const data = await response.json();
                const tel = data.telemetry;
                const aud = data.audit;

                // 1. CPU
                const cpuPct = parseFloat(tel.cpu.overall).toFixed(1);
                document.getElementById('cpu-val').innerText      = cpuPct + '%';
                document.getElementById('cpu-temp').innerText     = tel.cpu.temp;
                document.getElementById('cpu-util-s').innerText   = cpuPct + '%';
                document.getElementById('cpu-temp-s').innerText   = tel.cpu.temp;
                document.getElementById('cpu-cores-s').innerText  = (tel.cpu.core_load || []).length || '—';
                updateChartData(charts.cpu, tel.cpu.overall);
                renderCoreBars(tel.cpu.core_load || []);

                // 2. RAM
                const ramUsedGB = ((tel.ram.usage / 100) * tel.ram.total).toFixed(1);
                document.getElementById('ram-val').innerText      = tel.ram.usage + '%';
                document.getElementById('ram-total').innerText    = tel.ram.total + ' GB';
                document.getElementById('ram-standby').innerText  = tel.ram.standby;
                document.getElementById('ram-used-s').innerText   = ramUsedGB + ' GB';
                updateChartData(charts.ram, tel.ram.usage);

                // 3. GPU
                document.getElementById('gpu-val').innerText      = tel.gpu.usage + '%';
                document.getElementById('gpu-temp').innerText     = tel.gpu.temp;
                document.getElementById('gpu-model').innerText    = tel.gpu.model;
                document.getElementById('gpu-load-s').innerText   = tel.gpu.usage + '%';
                document.getElementById('gpu-temp-s').innerText   = tel.gpu.temp;
                updateChartData(charts.gpu, tel.gpu.usage);

                // 4. DISK
                const diskVal = Math.max(tel.disk.read_mb, tel.disk.write_mb);
                document.getElementById('disk-iops').innerText    = tel.disk.iops + ' IO/s';
                document.getElementById('disk-read').innerText    = tel.disk.read_mb + ' MB/s';
                document.getElementById('disk-write').innerText   = tel.disk.write_mb + ' MB/s';
                document.getElementById('disk-iops-s').innerText  = tel.disk.iops;
                updateChartData(charts.disk, diskVal, true);

                // 5. NETWORK
                const netVal = Math.max(tel.network.download_mb, tel.network.upload_mb);
                document.getElementById('net-latency').innerText  = tel.network.latency;
                document.getElementById('net-down').innerText     = tel.network.download_mb + ' MB/s';
                document.getElementById('net-up').innerText       = tel.network.upload_mb + ' MB/s';
                document.getElementById('net-lat-s').innerText    = tel.network.latency;
                updateChartData(charts.net, netVal, true);

                // AUDIT TAB
                document.getElementById('aud-fw').innerText     = aud.firewall_active;
                document.getElementById('aud-ports').innerText  = aud.open_ports;
                document.getElementById('aud-reboot').innerText = aud.pending_updates;
                renderSockets(aud.sockets || []);

                // MOBILE STAT TILES
                setMob('mob-cpu-val',   cpuPct + '%');
                setMobBar('mob-cpu-bar', tel.cpu.overall);
                setMob('mob-cpu-temp',  tel.cpu.temp);
                setMob('mob-cpu-cores', (tel.cpu.core_load || []).length || '—');

                setMob('mob-ram-val',   tel.ram.usage + '%');
                setMobBar('mob-ram-bar', tel.ram.usage);
                setMob('mob-ram-used',  ramUsedGB + ' GB');
                setMob('mob-ram-total', tel.ram.total + ' GB');

                setMob('mob-gpu-val',   tel.gpu.usage + '%');
                setMobBar('mob-gpu-bar', tel.gpu.usage);
                setMob('mob-gpu-temp',  tel.gpu.temp);
                setMob('mob-gpu-model', tel.gpu.model);

                setMob('mob-disk-iops',  tel.disk.iops + ' IO/s');
                setMobBar('mob-disk-bar', Math.min(100, (diskVal / 50) * 100));
                setMob('mob-disk-read',  tel.disk.read_mb + ' MB/s');
                setMob('mob-disk-write', tel.disk.write_mb + ' MB/s');

                setMob('mob-net-latency', tel.network.latency);
                setMobBar('mob-net-bar', Math.min(100, (netVal / 10) * 100));
                setMob('mob-net-down', tel.network.download_mb + ' MB/s');
                setMob('mob-net-up',   tel.network.upload_mb + ' MB/s');
                setMob('mob-net-lat',  tel.network.latency);
            }
        } catch (error) {}
    }
    
    // Poll endpoints rapidly. 500ms syncs cleanly mapped to asyncio sleeps.
    setInterval(pollTelemetry, 500);


    // --- Optimizer Shield Logic ---
    const shieldBtn = document.getElementById('shield-btn');
    if(shieldBtn) {
        shieldBtn.addEventListener('click', async () => {
            
            shieldBtn.innerText = "Initiating Override...";
            shieldBtn.classList.add('glow-pulse');
            shieldBtn.disabled = true;

            const fbBox = document.getElementById('shield-feedback');
            const fbEff = document.getElementById('eff-gain');
            const fbLog = document.getElementById('fb-logs');
            fbBox.style.display = 'none';

            try {
                const res = await fetch('/api/action/one_click_shield', { method: 'POST' });
                const json = await res.json();
                
                if (res.ok) {
                    fbEff.innerText = json.gain;
                    fbLog.innerHTML = json.logs.map(log => `<div>> ${log}</div>`).join('');
                    fbBox.style.display = 'block';
                }
            } catch(e) {
                fbLog.innerHTML = "<div>> Critical Connection Timeout reaching Daemon Layer.</div>";
                fbBox.style.display = 'block';
            }

            shieldBtn.innerText = "Initiate Deep Clean";
            shieldBtn.disabled = false;
        });
    }

    // Ping initial audit layer to prime it immediately against WMI delays
    fetch('/api/action/audit', { method: 'POST' }).catch(()=>{});

    // Ports considered HIGH risk if exposed — well-known attack surface
    const HIGH_RISK_PORTS = new Set([21, 23, 135, 137, 138, 139, 445, 1433, 1434, 3306, 3389, 5900, 5985, 5986, 27017]);
    const MED_RISK_PORTS  = new Set([22, 25, 53, 80, 110, 143, 8080, 8443]);

    let lastSocketCount = -1;

    function renderSockets(sockets) {
        const container = document.getElementById('socket-list');
        if (!container) return;

        // Only re-render if the count changed (avoids thrashing the DOM every 500ms)
        if (sockets.length === lastSocketCount) return;
        lastSocketCount = sockets.length;

        if (sockets.length === 0) {
            container.innerHTML = '<p class="socket-empty" style="color:#00ff88;">No open listening sockets detected.</p>';
            return;
        }

        container.innerHTML = sockets.map(s => {
            const risk   = HIGH_RISK_PORTS.has(s.port) ? 'high' : MED_RISK_PORTS.has(s.port) ? 'med' : 'low';
            const portTxt = s.label ? `${s.port} <span class="port-label">${s.label}</span>` : s.port;
            return `
                <div class="socket-row risk-${risk}">
                    <span class="socket-col socket-port">${portTxt}</span>
                    <span class="socket-col socket-proto">${s.proto}</span>
                    <span class="socket-col socket-addr">${s.addr}</span>
                    <span class="socket-col socket-proc">${s.process}</span>
                    <span class="socket-col socket-pid">${s.pid || '—'}</span>
                    <span class="socket-col"><span class="risk-badge risk-${risk}">${risk.toUpperCase()}</span></span>
                </div>`;
        }).join('');
    }

    window.rescanAudit = async function() {
        const btn = document.querySelector('.rescan-btn');
        if (btn) { btn.disabled = true; btn.innerText = 'Scanning...'; }
        lastSocketCount = -1; // force re-render
        try {
            await fetch('/api/action/audit', { method: 'POST' });
        } catch(e) {}
        if (btn) { btn.disabled = false; btn.innerText = '↻ Re-scan'; }
    };

    // Global trigger for OS Optimization UI buttons
    window.triggerOpt = async function(type) {
        const fbNode = document.getElementById('opt-feedback');
        fbNode.style.color = '#8892b0';
        fbNode.innerText = "> Engaging [" + type + "] subsystem target...";

        try {
            const res = await fetch('/api/optimize/' + type, { method: 'POST' });
            const json = await res.json();

            if (json.status === 'success') {
                fbNode.style.color = '#00ff88';
            } else {
                fbNode.style.color = '#ff3366';
            }
            fbNode.innerText = "> " + json.message;
        } catch(e) {
            fbNode.style.color = '#ff3366';
            fbNode.innerText = "> CRITICAL: Connection failure reaching Daemon Layer.";
        }
    };

    // --- Startup App Manager ---
    window.loadStartupApps = async function() {
        const listEl = document.getElementById('startup-list');
        const statusEl = document.getElementById('startup-status');
        statusEl.style.color = '#8892b0';
        statusEl.innerText = "> Scanning registry startup entries...";
        listEl.innerHTML = '';

        try {
            const res = await fetch('/api/startup/list');
            const json = await res.json();
            const apps = json.apps || [];

            if (apps.length === 0) {
                statusEl.style.color = '#00ff88';
                statusEl.innerText = "> No startup entries detected in registry.";
                return;
            }

            statusEl.style.color = '#00ff88';
            statusEl.innerText = `> ${apps.length} startup entr${apps.length === 1 ? 'y' : 'ies'} found:`;

            apps.forEach(app => {
                const row = document.createElement('div');
                row.className = 'startup-row';
                row.id = 'sr-' + btoa(app.name + app.hive).replace(/=/g, '');
                row.innerHTML = `
                    <div class="startup-info">
                        <span class="startup-name">${app.name}</span>
                        <span class="startup-hive">[${app.hive}]</span>
                        <span class="startup-path">${app.path}</span>
                    </div>
                    <button class="startup-disable-btn" onclick="disableStartup('${app.name.replace(/'/g, "\\'")}', '${app.hive}', this)">Disable</button>
                `;
                listEl.appendChild(row);
            });
        } catch(e) {
            statusEl.style.color = '#ff3366';
            statusEl.innerText = "> CRITICAL: Failed to reach Daemon Layer for startup scan.";
        }
    };

    window.disableStartup = async function(name, hive, btn) {
        btn.disabled = true;
        btn.innerText = "...";
        const statusEl = document.getElementById('startup-status');

        try {
            const res = await fetch('/api/startup/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, hive })
            });
            const json = await res.json();
            if (json.status === 'success') {
                const rowId = 'sr-' + btoa(name + hive).replace(/=/g, '');
                const row = document.getElementById(rowId);
                if (row) {
                    row.style.opacity = '0.4';
                    btn.innerText = "Disabled";
                    btn.style.color = '#ff3366';
                    btn.style.borderColor = '#ff3366';
                }
                statusEl.style.color = '#00ff88';
                statusEl.innerText = "> " + json.message;
            } else {
                btn.disabled = false;
                btn.innerText = "Disable";
                statusEl.style.color = '#ff3366';
                statusEl.innerText = "> " + json.message;
            }
        } catch(e) {
            btn.disabled = false;
            btn.innerText = "Disable";
            statusEl.style.color = '#ff3366';
            statusEl.innerText = "> CRITICAL: Connection failure.";
        }
    };
});
