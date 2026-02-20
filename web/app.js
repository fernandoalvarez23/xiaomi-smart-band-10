const formatNumber = (value) => new Intl.NumberFormat('es-ES').format(value);

const renderSummary = (summary) => {
  const cards = [
    ['Días', summary.days],
    ['Pasos totales', formatNumber(summary.total_steps)],
    ['FC promedio', `${summary.avg_heart_rate} bpm`],
    ['Calorías totales', formatNumber(summary.total_calories)],
    ['Sueño promedio', `${summary.avg_sleep_hours} h`],
  ];

  const container = document.getElementById('summary-cards');
  container.innerHTML = cards
    .map(([label, value]) => `<article class="card"><h3>${label}</h3><p>${value}</p></article>`)
    .join('');
};

const drawChart = (canvasId, label, labels, data, color) => {
  const ctx = document.getElementById(canvasId);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: `${color}33`,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#d4ddff' } },
        y: { ticks: { color: '#d4ddff' } },
      },
    },
  });
};

const init = async () => {
  const [summaryRes, dailyRes] = await Promise.all([
    fetch('/api/summary'),
    fetch('/api/daily'),
  ]);

  const summary = await summaryRes.json();
  const daily = await dailyRes.json();

  renderSummary(summary);

  const labels = daily.map((d) => d.date);
  drawChart('stepsChart', 'Pasos', labels, daily.map((d) => d.steps), '#63e6be');
  drawChart('heartRateChart', 'BPM', labels, daily.map((d) => d.avg_heart_rate), '#ff8787');
  drawChart('sleepChart', 'Horas de sueño', labels, daily.map((d) => d.sleep_hours), '#74c0fc');
};

init().catch((error) => {
  console.error('No se pudo cargar el dashboard', error);
});
