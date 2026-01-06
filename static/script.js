document.addEventListener('DOMContentLoaded', () => {
    loadCases();
    initDistributionChart();

    // Global chart instances
    window.radarChart = null;
    window.distChart = null;
    window.currentThreshold = 0.0;
});

// Live Feed & Load Logic
async function loadCases() {
    const res = await fetch('/static/casos.json');
    const allCases = await res.json();
    const container = document.getElementById('cards-container');

    // Initial Seed (Show first 3 immediately)
    let index = 0;

    function addCase(c) {
        const row = document.createElement('div');
        row.className = 'case-row';
        row.draggable = true;
        row.style.animation = 'fadeIn 0.5s ease'; // Add fade in effect

        row.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(c));
            row.style.opacity = '0.5';
        };
        row.ondragend = () => row.style.opacity = '1';

        let iconClass = 'fa-credit-card';
        if (c.titulo.includes('ATM')) iconClass = 'fa-money-bill-wave';
        if (c.titulo.includes('Streaming') || c.titulo.includes('Spotify')) iconClass = 'fa-play-circle';
        if (c.titulo.includes('Supermercado')) iconClass = 'fa-shopping-cart';
        if (c.titulo.includes('Uber')) iconClass = 'fa-car';
        if (c.titulo.includes('Apple')) iconClass = 'fa-mobile-alt';
        if (c.titulo.includes('Crypto')) iconClass = 'fa-bitcoin';

        // Only show ID in the list as requested
        row.innerHTML = `
            <div class="icon-box">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="case-details">
                <strong style="font-family:monospace; font-size:1.1em;">${c.id}</strong>
                <span style="font-size:0.7em; color:var(--text-muted); display:block;">${c.fecha.split(' ')[1]}</span>
            </div>
        `;

        // Prepend to show newest at top
        container.insertBefore(row, container.firstChild);
    }

    // Add first few
    for (let i = 0; i < 3; i++) {
        if (index < allCases.length) addCase(allCases[index++]);
    }

    // Live Feed Interval (Every 6 seconds)
    setInterval(() => {
        if (index < allCases.length) {
            addCase(allCases[index++]);
        } else {
            // Loop or stop? Let's loop for endless feed feel
            index = 0;
        }
    }, 6000); // 6 seconds

    // Toggle Logic
    const deck = document.getElementById('floating-deck');
    document.getElementById('case-fab').addEventListener('click', () => {
        deck.classList.toggle('hidden');
    });
    document.getElementById('close-deck').addEventListener('click', () => {
        deck.classList.add('hidden');
    });
}

// Drag & Drop Handling (Full Screen Overlay)
// ------------------------------------------

const overlay = document.getElementById('overlay-drop');
let dragCounter = 0; // Needed to prevent flickering when entering/leaving child elements

// Listen on the whole window
window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    overlay.classList.remove('hidden');
});

window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
        overlay.classList.add('hidden');
    }
});

window.addEventListener('dragover', (e) => {
    e.preventDefault(); // Necessary to allow dropping
});

window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    overlay.classList.add('hidden');

    // Check if we dropped valid JSON data from our app
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
        const data = JSON.parse(rawData);

        // Visual feedback on the drop zone ("virtual" one in UI)
        const uiZone = document.getElementById('drop-zone');
        uiZone.classList.add('scanning');
        uiZone.querySelector('p').innerText = "Analizando...";

        // Wait a bit for effect
        setTimeout(() => {
            uiZone.classList.remove('scanning');
            uiZone.querySelector('p').innerText = "Arrastra una transacción aquí para analizar";
            analyzeCase(data);
        }, 1000);

    } catch (err) {
        console.error("Invalid drop data", err);
    }
});

// Main Analysis Logic
async function analyzeCase(caseData) {
    window.currentCase = caseData; // Store for slider updates
    const threshold = document.getElementById('threshold').value;

    const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: caseData.datos, threshold: threshold })
    });

    const result = await res.json();
    updateUI(result, caseData);
}

function updateUI(result, caseData) {
    // Status
    const statusEl = document.getElementById('status-indicator');
    if (result.is_anomaly) {
        statusEl.innerText = "ALERTA: ANOMALÍA";
        statusEl.style.color = "var(--danger)";
        statusEl.style.borderColor = "var(--danger)";
    } else {
        statusEl.innerText = "TRANSACCIÓN NORMAL";
        statusEl.style.color = "var(--success)";
        statusEl.style.borderColor = "var(--success)";
    }
    // Show Metadata Panel
    document.getElementById('metadata-display').style.display = 'block';
    document.getElementById('meta-id').innerText = caseData.id || '---';
    document.getElementById('meta-date').innerText = caseData.fecha || 'Unknown';
    document.getElementById('meta-user').innerText = caseData.usuario || 'Unknown';
    document.getElementById('meta-amount').innerText = caseData.monto || '---';

    document.getElementById('explanation-text').innerHTML = `
        <h3>${caseData.titulo}</h3>
        <p>${caseData.descripcion}</p>
        <hr style="border-color:var(--border); opacity:0.3; margin:15px 0;">
        <p><strong>Resultado:</strong> ${result.is_anomaly ? '<span style="color:var(--danger)">ANOMALÍA DETECTADA</span>' : '<span style="color:var(--success)">Normal</span>'}</p>
    `;

    const scoreVal = document.getElementById('score-val');
    scoreVal.innerText = result.score.toFixed(4);
    scoreVal.style.color = result.is_anomaly ? 'var(--danger)' : 'var(--success)';

    updateRadarChart(caseData.datos);
    updateDistributionLine(result.score);
    runIsolationSimulation(result.score);
}

// Isolation Chamber Simulation
// ----------------------------
let isoReqId = null;
let zoomLevel = 1.0;

window.updateZoom = function (delta) {
    zoomLevel = Math.max(0.5, Math.min(3.0, zoomLevel + delta));
    // If simulation is running, it will pick up new zoom next frame
    // If static, we might want to redraw? For now, user zooms while watching.
};

function runIsolationSimulation(score) {
    const canvas = document.getElementById('isoChamber');
    const ctx = canvas.getContext('2d');
    const counterEl = document.getElementById('cuts-counter');

    // Fix resolution
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    // Cancel previous
    if (isoReqId) cancelAnimationFrame(isoReqId);

    // Zoom center point
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    let w = canvas.width;
    let h = canvas.height;

    // Determine number of cuts based on score (heuristic)
    // Score < 0 (Anomaly) -> Few cuts (e.g., 2-5)
    // Score > 0 (Normal) -> Many cuts (e.g., 10-20)
    const threshold = document.getElementById('threshold').value;
    const isAnomaly = score < threshold;
    const targetCuts = isAnomaly ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 10) + 12;

    // Current bounds of the isolated point
    let bounds = { x: 0, y: 0, w: w, h: h };
    // Target Point (randomish but centered)
    const px = w / 2 + (Math.random() * 40 - 20);
    const py = h / 2 + (Math.random() * 40 - 20);

    let currentCut = 0;
    let lastTime = 0;
    const cutInterval = 600;

    // State for re-drawing
    let cuts = []; // Store lines: {type: 'v'|'h', val: number, min: number, max: number}

    counterEl.innerText = "CORTES: 0";
    counterEl.style.color = "#f5f5f5";

    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const elapsed = timestamp - lastTime;

        // Logic Update
        if (currentCut < targetCuts && elapsed > cutInterval) {
            currentCut++;
            counterEl.innerText = `CORTES: ${currentCut}`;
            lastTime = timestamp;

            // Pick dimension (Vertical or Horizontal)
            const isVertical = Math.random() > 0.5;
            if (isVertical) {
                // Cut X
                // In real algo, cut is random within range.
                // Visual trick: Draw line across current bounds to simulate partitioning this zone
                const cutX = bounds.x + Math.random() * bounds.w;
                cuts.push({ type: 'v', val: cutX, min: bounds.y, max: bounds.y + bounds.h });

                // Update bounds to shrink around point
                if (cutX < px) {
                    bounds.w = (bounds.x + bounds.w) - cutX;
                    bounds.x = cutX;
                } else {
                    bounds.w = cutX - bounds.x;
                }
            } else {
                // Cut Y
                const cutY = bounds.y + Math.random() * bounds.h;
                cuts.push({ type: 'h', val: cutY, min: bounds.x, max: bounds.x + bounds.w });

                if (cutY < py) {
                    bounds.h = (bounds.y + bounds.h) - cutY;
                    bounds.y = cutY;
                } else {
                    bounds.h = cutY - bounds.y;
                }
            }
        }

        // Rendering (Every Frame to support smooth zoom)
        // Clear & Setup
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#0a0a0a'; // Dark bg
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.translate(cx, cy);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.translate(-cx, -cy);

        // Draw World Border
        ctx.strokeStyle = '#262626';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, w, h);

        // Draw Previous Cuts
        ctx.strokeStyle = '#525252'; // Dark Gray Lines
        ctx.lineWidth = 1;
        ctx.beginPath();
        cuts.forEach(c => {
            if (c.type === 'v') {
                ctx.moveTo(c.val, c.min);
                ctx.lineTo(c.val, c.max);
            } else {
                ctx.moveTo(c.min, c.val);
                ctx.lineTo(c.max, c.val);
            }
        });
        ctx.stroke();

        // Highlight Bounds (Active Zone)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);

        // Draw Point
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = isAnomaly ? '#ef4444' : '#22c55e'; // Red implies anomaly, Green normal
        ctx.fill();

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (currentCut >= targetCuts && isAnomaly) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
        }

        isoReqId = requestAnimationFrame(animate);
    }

    isoReqId = requestAnimationFrame(animate);
}
function updateRadarChart(data) {
    const ctx = document.getElementById('radarChart').getContext('2d');

    if (window.radarChart) window.radarChart.destroy();

    window.radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'],
            datasets: [{
                label: 'Este Caso',
                data: data.slice(1, 7).map(Math.abs), // Skip index 0 (Time), take V1-V6
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                pointBackgroundColor: '#0ea5e9',
                borderWidth: 2
            }, {
                label: 'Promedio Normal',
                data: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8], // Mean Absolute Error for Standard Normal is ~0.8
                borderColor: '#94a3b8',
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(148, 163, 184, 0.1)' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    pointLabels: { color: '#94a3b8' },
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: '#f8fafc' } }
            }
        }
    });
}

// Distribution Chart (Histogram)
async function initDistributionChart() {
    const res = await fetch('/distribution');
    const distData = await res.json();

    const ctx = document.getElementById('distChart').getContext('2d');

    window.distChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: distData.labels,
            datasets: [{
                label: 'Frecuencia de Scores',
                data: distData.data,
                backgroundColor: (context) => {
                    const val = parseFloat(distData.labels[context.dataIndex]);
                    return val < window.currentThreshold ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)';
                },
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', maxTicksLimit: 10 }
                },
                y: { display: false }
            },
            plugins: {
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: 0,
                            xMax: 0,
                            borderColor: 'white',
                            borderWidth: 2,
                            label: { content: 'Umbral', display: true, color: 'white' }
                        },
                        point1: {
                            type: 'point',
                            xValue: 0.1, // Initial position, updated later
                            yValue: 5,
                            backgroundColor: 'yellow',
                            radius: 6,
                            display: false // Only show when a case is active
                        }
                    }
                }
            }
        }
    });

    // Slider listener
    const slider = document.getElementById('threshold');
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        window.currentThreshold = val;
        document.getElementById('thresh-val').innerText = val;

        // Update chart colors dynamically
        window.distChart.data.datasets[0].backgroundColor = window.distChart.data.labels.map(l =>
            parseFloat(l) < val ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'
        );

        // Move annotation line (requires plugin-annotation, assumes it's loaded via CDN)
        if (window.distChart.options.plugins.annotation) {
            window.distChart.options.plugins.annotation.annotations.line1.xMin = val;
            window.distChart.options.plugins.annotation.annotations.line1.xMax = val;
        }

        window.distChart.update();

        // Re-analyze if case is active
        if (window.currentCase) analyzeCase(window.currentCase);
    });
}

function updateDistributionLine(score) {
    if (!window.distChart || !window.distChart.options.plugins.annotation) return;

    // Show point of current case
    window.distChart.options.plugins.annotation.annotations.point1 = {
        type: 'point',
        xValue: score,
        yValue: 50, // Arbitrary height
        backgroundColor: '#fbbf24',
        borderColor: 'white',
        borderWidth: 2,
        radius: 8,
        display: true
    };
    window.distChart.update();
}
