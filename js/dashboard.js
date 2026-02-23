// js/dashboard.js

const TOTAL_PRODUCTION = 5000;
const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

// UI Elements
const kpiTotal = document.getElementById("kpi-total");
const kpiTasa = document.getElementById("kpi-tasa");
const kpiCritico = document.getElementById("kpi-critico");

// Chart instances
let paretoChart;
let shiftChart;
let trendChart;

const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#94a3b8',
            bodyColor: '#ffffff',
            borderColor: 'rgba(51, 65, 85, 0.5)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
                label: function (context) {
                    return `${context.parsed.y || context.parsed || 0} unidades`;
                }
            }
        }
    },
    scales: {
        x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748b' } },
        y: {
            grid: { color: 'rgba(30, 41, 59, 0.5)', borderDash: [5, 5], drawBorder: false },
            ticks: { color: '#64748b' }
        }
    }
};

async function fetchAndRenderDashboard() {
    try {
        const res = await fetch("http://localhost:3001/api/defects");
        const json = await res.json();

        if (json.ok && Array.isArray(json.data)) {
            const defects = json.data;

            // 1. Calcular KPIs
            const totalDefects = defects.reduce((acc, d) => acc + Number(d.cantidad), 0);
            const rejectionRate = ((totalDefects / TOTAL_PRODUCTION) * 100).toFixed(2);

            const criticalType = defects.reduce((acc, d) => {
                acc[d.tipo_defecto] = (acc[d.tipo_defecto] || 0) + Number(d.cantidad);
                return acc;
            }, {});

            const topDefect = Object.entries(criticalType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            // Actualizar DOM
            kpiTotal.textContent = totalDefects;
            kpiTasa.textContent = `${rejectionRate}%`;
            kpiCritico.textContent = topDefect;

            // 2. Data para Pareto
            const paretoDataEntries = Object.entries(criticalType).sort((a, b) => b[1] - a[1]);
            const paretoLabels = paretoDataEntries.map(e => e[0]);
            const paretoValues = paretoDataEntries.map(e => e[1]);

            // 3. Data para Turnos
            const shiftCount = defects.reduce((acc, d) => {
                const turnoStr = d.turno === 'Dia' ? 'Día' :
                    d.turno === 'Tarde' ? 'Tarde' : 'Noche';
                acc[turnoStr] = (acc[turnoStr] || 0) + Number(d.cantidad);
                return acc;
            }, {});

            // 4. Data para Trends
            const trendGroup = defects.reduce((acc, d) => {
                const dateRaw = d.fecha_registro ? d.fecha_registro.substring(0, 10) : "N/A";
                acc[dateRaw] = (acc[dateRaw] || 0) + Number(d.cantidad);
                return acc;
            }, {});

            const trendEntries = Object.entries(trendGroup)
                .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                .slice(-7);

            const trendLabels = trendEntries.map(e => {
                if (e[0] === "N/A") return e[0];
                return e[0].split('-').slice(1).join('/'); // mm/dd
            });
            const trendValues = trendEntries.map(e => e[1]);

            // Dibujar gráficas
            renderPareto(paretoLabels, paretoValues);
            renderShift(Object.keys(shiftCount), Object.values(shiftCount));
            renderTrend(trendLabels, trendValues);

        }
    } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
    }
}

function renderPareto(labels, data) {
    const ctx = document.getElementById('paretoChart').getContext('2d');
    if (paretoChart) paretoChart.destroy();

    // Crear colores del mismo array repetidos si es necesario
    const bgColors = data.map((_, i) => COLORS[i % COLORS.length]);

    paretoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            ...commonChartOptions,
            indexAxis: 'y', // Barra horizontal
            scales: {
                x: {
                    grid: { color: 'rgba(30, 41, 59, 0.5)', borderDash: [5, 5], drawBorder: false },
                    ticks: { display: false } // hide x digits like Recharts hide prop
                },
                y: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#64748b' }
                }
            }
        }
    });
}

function renderShift(labels, data) {
    const ctx = document.getElementById('shiftChart').getContext('2d');
    if (shiftChart) shiftChart.destroy();

    const bgColors = data.map((_, i) => COLORS[i % COLORS.length]);

    shiftChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // agujero dona ajustado a Recharts layout
            layout: { padding: 20 },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: '#94a3b8', usePointStyle: true, boxWidth: 8, padding: 20 }
                },
                tooltip: commonChartOptions.plugins.tooltip
            }
        }
    });
}

function renderTrend(labels, data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();

    // Crear gradiente teal para area
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.3)');
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: '#14b8a6',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4, // Linea suave (monotone)
                pointBackgroundColor: '#14b8a6',
                pointBorderColor: '#0f172a',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: commonChartOptions
    });
}

// Iniciar aplicación
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons(); // Inicializa los iconos SVG
    fetchAndRenderDashboard();
});
