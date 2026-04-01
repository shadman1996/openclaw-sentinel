document.addEventListener("DOMContentLoaded", () => {
    // --- Mobile Responsive Nav ---
    const navToggle = document.getElementById('navToggle');
    const sidebar = document.getElementById('sidebar');
    if(navToggle) {
        navToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // --- Tab Controller ---
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active-tab'));
            
            e.currentTarget.classList.add('active');
            const targetTab = e.currentTarget.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active-tab');
            
            if (window.innerWidth <= 768) { sidebar.classList.remove('show'); }
        });
    });

    // --- Chart.js Configuration Stack (60FPS Smooth) ---
    Chart.defaults.color = '#8892b0';
    Chart.defaults.font.family = '"Roboto Mono", monospace';
    
    function createChart(canvasId, mainColor, fillHex, maxDataPoints, yMax) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(maxDataPoints).fill(''),
                datasets: [{
                    data: Array(maxDataPoints).fill(0),
                    borderColor: mainColor,
                    backgroundColor: fillHex,
                    borderWidth: 2,
                    tension: 0.3, // Spline interpolation for smooth data curves
                    fill: 'start',
                    pointRadius: 0 // Hide points for clean fluid sweep
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Critical to prohibit horizontal canvas expanding bugs
                animation: { duration: 0 }, // Hardware handles timing via Async
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { min: 0, max: yMax, grid: { color: 'rgba(0, 255, 136, 0.05)' } }
                }
            }
        });
    }

    // 5 Independent Sensor Charts
    const MAX_PTS = 60; // 30 sec rolling window at 500ms
    const charts = {
        cpu: createChart('cpuChart', '#00ff88', 'rgba(0, 255, 136, 0.1)', MAX_PTS, 100),
        ram: createChart('ramChart', '#00ff88', 'rgba(0, 255, 136, 0.1)', MAX_PTS, 100),
        gpu: createChart('gpuChart', '#00ff88', 'rgba(0, 255, 136, 0.1)', MAX_PTS, 100),
        disk: createChart('diskChart', '#ff3366', 'rgba(255, 51, 102, 0.1)', MAX_PTS, 20), // Trunks at 20MB/s for relative IO curve
        net: createChart('netChart', '#ffcc00', 'rgba(255, 204, 0, 0.1)', MAX_PTS, 10)  // Trunks at 10MB/s 
    };

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

    // --- Master Telemetry Matrix ---
    async function pollTelemetry() {
        try {
            const response = await fetch('/api/telemetry');
            if (response.ok) {
                const data = await response.json();
                const tel = data.telemetry;
                const aud = data.audit;

                // 1. CPU
                document.getElementById('cpu-val').innerText = `${tel.cpu.overall}%`;
                document.getElementById('cpu-temp').innerText = tel.cpu.temp;
                updateChartData(charts.cpu, tel.cpu.overall);

                // 2. RAM
                document.getElementById('ram-val').innerText = `${tel.ram.usage}%`;
                document.getElementById('ram-total').innerText = tel.ram.total;
                document.getElementById('ram-standby').innerText = tel.ram.standby;
                updateChartData(charts.ram, tel.ram.usage);

                // 3. GPU
                document.getElementById('gpu-val').innerText = `${tel.gpu.usage}%`;
                document.getElementById('gpu-temp').innerText = tel.gpu.temp;
                document.getElementById('gpu-model').innerText = tel.gpu.model;
                updateChartData(charts.gpu, tel.gpu.usage);

                // 4. DISK
                document.getElementById('disk-iops').innerText = `${tel.disk.iops} IO/s`;
                document.getElementById('disk-read').innerText = tel.disk.read_mb;
                document.getElementById('disk-write').innerText = tel.disk.write_mb;
                // Graph max payload
                const diskVal = tel.disk.read_mb > tel.disk.write_mb ? tel.disk.read_mb : tel.disk.write_mb;
                updateChartData(charts.disk, diskVal, true);

                // 5. NETWORK
                document.getElementById('net-latency').innerText = tel.network.latency;
                document.getElementById('net-down').innerText = tel.network.download_mb;
                document.getElementById('net-up').innerText = tel.network.upload_mb;
                const netVal = tel.network.download_mb > tel.network.upload_mb ? tel.network.download_mb : tel.network.upload_mb;
                updateChartData(charts.net, netVal, true);

                // AUDIT TAB
                document.getElementById('aud-fw').innerText = aud.firewall_active;
                document.getElementById('aud-ports').innerText = aud.open_ports;
                document.getElementById('aud-reboot').innerText = aud.pending_updates;
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
});
